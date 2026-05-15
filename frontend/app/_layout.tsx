import { Stack, useRouter } from 'expo-router';

import { useEffect, useState } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as SplashScreen from 'expo-splash-screen';

import { useAuthStore } from '../stores/authStore';

import { usePreferencesStore } from '../stores/preferencesStore';

import { setAuthToken } from '../utils/api';

// 🚀 HOLD native splash
SplashScreen.preventAutoHideAsync().catch(
  () => {}
);

export default function RootLayout() {
  const router = useRouter();

  const [ready, setReady] = useState(false);

  const loadStoredAuth = useAuthStore(
    (s) => s.loadStoredAuth
  );

  const token = useAuthStore((s) => s.token);

  const user = useAuthStore((s) => s.user);

  const loadLanguage = usePreferencesStore(
    (s) => s.loadLanguage
  );

  // 🚀 startup
  useEffect(() => {
    let mounted = true;

    const prepare = async () => {
      try {
        await Promise.all([
          loadStoredAuth(),
          loadLanguage(),
        ]);

        if (token) {
          setAuthToken(token);
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    prepare();

    return () => {
      mounted = false;
    };
  }, []);

  // 🚀 hide splash ONLY when app fully ready
  useEffect(() => {
    if (!ready) return;

    const init = async () => {
      try {
        if (user) {
          router.replace('/(protected)/user');
        } else {
          router.replace('/auth/login');
        }

        // slight delay for smooth transition
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 300);
      } catch (e) {
        console.log(e);
      }
    };

    init();
  }, [ready]);

  // 🚀 KEEP native splash visible
  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
    >
      <Stack
        screenOptions={{
          headerShown: false,

          animation: 'fade',

          contentStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen
          name="auth/login"
        />

        <Stack.Screen
          name="auth/signup"
        />

        <Stack.Screen
          name="auth/forgot-password"
        />

        <Stack.Screen
          name="(protected)"
        />
      </Stack>
    </GestureHandlerRootView>
  );
}