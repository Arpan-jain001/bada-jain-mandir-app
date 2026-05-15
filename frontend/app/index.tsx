import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function IndexScreen() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    router.replace(user ? (user.is_admin ? '/admin' : '/user') : '/auth/login');
  }, [initialized, router, user]);

  return null;
}
