import { Stack, useRouter } from 'expo-router';

import { useEffect, useState, useRef } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as SplashScreen from 'expo-splash-screen';

import { AppState, AppStateStatus } from 'react-native';

import { useAuthStore } from '../stores/authStore';

import { usePreferencesStore } from '../stores/preferencesStore';

import { setAuthToken } from '../utils/api';

import {
  requestInitialNotificationPermission,
  registerForPushNotifications,
  attachNotificationListeners,
  configureAndroidNotificationChannel,
} from '../utils/notifications';

import * as tokenService from '../services/tokenService';

// 🚀 HOLD native splash
SplashScreen.preventAutoHideAsync().catch(
  () => {}
);

export default function RootLayout() {
  const router = useRouter();

  const [ready, setReady] = useState(false);

  const appStateRef = useRef<AppStateStatus>('active');

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
          // Configure Android notification channel early
          configureAndroidNotificationChannel(),
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

  // 🚀 Setup notifications after authentication
  useEffect(() => {
    if (!user || !token) return;

    let mounted = true;
    let unsubscribeListeners: (() => void) | null = null;

    const setupNotifications = async () => {
      try {
        console.log('[APP] Setting up notifications for user', user.email);

        // 1. Request permission if not already granted
        const permission = await requestInitialNotificationPermission();
        console.log('[APP] Notification permission:', permission);

        // 2. Register or refresh push token
        const tokenNeedsRefresh = await tokenService.shouldRefreshToken();
        if (tokenNeedsRefresh) {
          console.log('[APP] Token needs refresh, registering...');
          const token = await registerForPushNotifications();
          if (token) {
            console.log('[APP] Token registered successfully');
          }
        } else {
          console.log('[APP] Token still valid, skipping registration');
        }

        // 3. Attach notification listeners for deep linking
        unsubscribeListeners = attachNotificationListeners(router);
        console.log('[APP] Notification listeners attached');
      } catch (error) {
        console.error('[APP] Failed to setup notifications', error);
      }
    };

    setupNotifications();

    return () => {
      mounted = false;
      unsubscribeListeners?.();
    };
  }, [user, token, router]);

  // 🚀 Handle app state changes for token refresh
  useEffect(() => {
    if (!user || !token) return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user, token]);

  const handleAppStateChange = async (state: AppStateStatus) => {
    appStateRef.current = state;

    if (state === 'active') {
      // App just came to foreground
      console.log('[APP] App came to foreground, checking token expiry');

      try {
        // Check if token needs refresh
        const needsRefresh = await tokenService.shouldRefreshToken();
        if (needsRefresh) {
          console.log('[APP] Token expired or needs refresh, re-registering...');
          await registerForPushNotifications({ forceRefresh: true });
        }
      } catch (error) {
        console.error('[APP] Failed to refresh token on app resume', error);
        // Don't fail - app should still work
      }
    }
  };

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