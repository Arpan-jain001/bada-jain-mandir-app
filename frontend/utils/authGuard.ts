import { useAuthStore } from '../stores/authStore';
import { Alert } from 'react-native';
import { router } from 'expo-router';

/**
 * Helper function to require login before executing an action.
 * If user is not logged in, shows alert and redirects to /auth/login.
 * Otherwise executes the provided action immediately.
 */
export const requireLogin = (action: () => void | Promise<void>) => {
  const { user } = useAuthStore.getState();

  if (!user) {
    Alert.alert('Login Required', 'Please login first', [
      { text: 'Cancel' },
      {
        text: 'Login',
        onPress: () => router.push('/auth/login'),
      },
    ]);
    return;
  }

  try {
    void action();
  } catch (err) {
    console.warn('Protected action failed', err);
  }
};
