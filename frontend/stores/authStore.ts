import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string, acceptedPrivacyPolicy?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (token: string, user: User) => void;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (details: Partial<Pick<User, 'name' | 'phone'>>) => Promise<void>;
}

const normalizeAuthResponse = (data: any): { access_token: string; user: User } => {
  const payload = data?.data || data;
  const access_token = payload?.access_token || payload?.token;
  const rawUser = payload?.user;

  if (!access_token || !rawUser) {
    throw new Error(data?.message || data?.detail || 'Invalid authentication response');
  }

  const user: User = {
    ...rawUser,
    is_admin: rawUser.is_admin ?? rawUser.role === 'admin',
  };

  return { access_token, user };
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race<T>([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('SecureStore read timed out')), timeoutMs)
    ),
  ]);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,
  
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      const { access_token, user } = normalizeAuthResponse(response.data);
      
      // Store in SecureStore for 10 days persistence
      await SecureStore.setItemAsync('auth_token', access_token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
      setAuthToken(access_token);
      
      set({ token: access_token, user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  signup: async (name: string, email: string, password: string, phone?: string, acceptedPrivacyPolicy = false) => {
    set({ loading: true });
    try {
      let response;
      try {
        response = await api.post('/auth/signup', {
          name,
          email,
          password,
          phone,
          accepted_privacy_policy: acceptedPrivacyPolicy,
        });
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          throw error;
        }
        response = await api.post('/auth/register', {
          name,
          email,
          password,
          phone,
          accepted_privacy_policy: acceptedPrivacyPolicy,
        });
      }
      const { access_token, user } = normalizeAuthResponse(response.data);
      
      // Store in SecureStore for 10 days persistence
      await SecureStore.setItemAsync('auth_token', access_token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
      setAuthToken(access_token);
      
      set({ token: access_token, user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    setAuthToken(null);
    set({ user: null, token: null });
  },
  
  setAuthData: (token: string, user: User) => {
    setAuthToken(token);
    set({ token, user });
  },

  updateProfile: async (details) => {
    set({ loading: true });
    try {
      const response = await api.put('/auth/profile', details);
      const updatedUser = {
        ...(response.data?.data || response.data),
        is_admin: (response.data?.data || response.data).is_admin ?? (response.data?.data || response.data).role === 'admin',
      };
      await SecureStore.setItemAsync('auth_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  loadStoredAuth: async () => {
    try {
      const [token, userStr] = await withTimeout(
        Promise.all([
          SecureStore.getItemAsync('auth_token'),
          SecureStore.getItemAsync('auth_user'),
        ]),
        2500
      );
      
      if (token && userStr) {
        const storedUser = JSON.parse(userStr);
        const user = {
          ...storedUser,
          is_admin: storedUser.is_admin ?? storedUser.role === 'admin',
        };
        setAuthToken(token);
        set({ token, user, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await SecureStore.deleteItemAsync('auth_token').catch(() => undefined);
      await SecureStore.deleteItemAsync('auth_user').catch(() => undefined);
      setAuthToken(null);
      set({ token: null, user: null, initialized: true });
    }
  },
}));
