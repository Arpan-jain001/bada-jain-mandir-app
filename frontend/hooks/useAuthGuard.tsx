import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

type Action = () => void | Promise<void>;

export function useAuthGuard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const requireAuth = useCallback(
    (action?: Action) => {
      const state = useAuthStore.getState();
      const isLoggedIn = Boolean(state?.token);
      if (!isLoggedIn) {
        Alert.alert('Login Required', 'You must be logged in to perform this action.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/auth/login'),
          },
        ]);
        return false;
      }

      // optionally run the protected action
      if (action) {
        try {
          void action();
        } catch (err) {
          console.warn('Protected action failed', err);
        }
      }
      return true;
    },
    [router]
  );

  return {
    token,
    requireAuth,
  } as const;
}

export function withAuthProtection<P extends object>(Component: (props: P) => JSX.Element) {
  return function Protected(props: P) {
    const { token, requireAuth } = useAuthGuard();
    // You can enhance this wrapper to redirect or render a placeholder
    // For now, render component but provide guard via props if needed
    return <Component {...props} token={token} requireAuth={requireAuth} /> as unknown as JSX.Element;
  };
}

export default useAuthGuard;
