import { Stack, useRouter } from 'expo-router';

import { useEffect } from 'react';

import { useAuthStore } from '../../stores/authStore';

export default function ProtectedLayout() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);

  const initialized = useAuthStore(
    (s) => s.initialized
  );

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace('/auth/login');
    }
  }, [initialized, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}