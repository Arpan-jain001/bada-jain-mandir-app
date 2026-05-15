import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../utils/api';
import { unwrapData } from '../utils/dataApi';

export type UserNotification = {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  category?: string;
  created_at?: string;
  sent_at?: string;
};

const LAST_READ_KEY = 'notifications_last_read_at';

const getNotificationTime = (item: UserNotification) =>
  new Date(item.sent_at || item.created_at || 0).getTime();

interface UserNotificationState {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  lastReadAt: number;
  loadLastRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useUserNotificationStore = create<UserNotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastReadAt: 0,
  loadLastRead: async () => {
    const stored = await SecureStore.getItemAsync(LAST_READ_KEY);
    const lastReadAt = stored ? Number(stored) : 0;
    const unreadCount = get().notifications.filter((item) => getNotificationTime(item) > lastReadAt).length;
    set({ lastReadAt, unreadCount });
  },
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/notifications');
      const notifications = unwrapData(response) as UserNotification[];
      const lastReadAt = get().lastReadAt;
      set({
        notifications,
        unreadCount: notifications.filter((item) => getNotificationTime(item) > lastReadAt).length,
      });
    } finally {
      set({ loading: false });
    }
  },
  markAllRead: async () => {
    const now = Date.now();
    await SecureStore.setItemAsync(LAST_READ_KEY, String(now));
    set({ lastReadAt: now, unreadCount: 0 });
  },
}));
