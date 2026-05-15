import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { setAuthToken } from '../utils/api';
import { silentHealthCheck } from '../utils/healthCheck';
import {
  attachNotificationListeners,
  clearNotificationBadge,
  registerForPushNotifications,
  requestInitialNotificationPermission,
} from '../utils/notifications';
import { checkForAppUpdate } from '../utils/appUpdates';

const BOOT_TIMEOUT_MS = 1000;
const MIN_SPLASH_DURATION_MS = 1500; // Splash shows minimum 1.5 seconds

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { initialized, isCached, loadStoredAuth, token } = useAuthStore();
  const loadLanguage = usePreferencesStore((state) => state.loadLanguage);
  const router = useRouter();
  const pathname = usePathname();
  const initStartedRef = useRef(false);
  const splashHideTimeRef = useRef<number>(0);

  // Ultra-fast initialization - instant startup
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    // Record when we want to hide splash (minimum duration)
    splashHideTimeRef.current = Date.now() + MIN_SPLASH_DURATION_MS;

    // Start loading in background - fire and forget
    loadStoredAuth().catch(() => {});
    loadLanguage().catch(() => undefined);

    // Timeout as safety net only
    const bootTimeout = setTimeout(() => {
      const auth = useAuthStore.getState();
      if (!auth.initialized) {
        setAuthToken(null);
        useAuthStore.setState({ initialized: true, token: null, user: null });
      }
    }, BOOT_TIMEOUT_MS);

    return () => clearTimeout(bootTimeout);
  }, [loadStoredAuth, loadLanguage]);

  // Hide splash only after minimum duration AND initialization complete
  useEffect(() => {
    if (initialized) {
      const timeElapsed = Date.now() - splashHideTimeRef.current;
      if (timeElapsed >= 0) {
        // Enough time has passed
        SplashScreen.hideAsync().catch(() => undefined);
      } else {
        // Wait for remaining time
        const remainingTime = Math.abs(timeElapsed);
        const hideTimer = setTimeout(() => {
          SplashScreen.hideAsync().catch(() => undefined);
        }, remainingTime);
        return () => clearTimeout(hideTimer);
      }
    }
  }, [initialized]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pathname !== '/user' && pathname !== '/admin' && pathname !== '/auth/login') {
        router.replace(pathname.startsWith('/admin') ? '/admin' : '/user');
        return true;
      }
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });

    return () => subscription.remove();
  }, [pathname, router]);

  // Hide splash and start background tasks once initialized
  useEffect(() => {
    if (initialized) {
      // Set token in API client if available
      if (token) {
        setAuthToken(token);
      }

      // All these tasks run in background - don't block UI
      silentHealthCheck().catch(() => undefined);
      requestInitialNotificationPermission().catch(() => undefined);
      checkForAppUpdate().catch(() => undefined);

      if (token) {
        registerForPushNotifications().catch(() => undefined);
      }
    }
  }, [initialized, token]);

  useEffect(() => {
    clearNotificationBadge();
    return attachNotificationListeners(router);
  }, [router]);

  // Always show splash screen - UI waits for splash to hide
  if (!initialized) {
    return null; // Keep splash screen showing
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/privacy-policy" />
        <Stack.Screen name="user" />
        <Stack.Screen name="admin" />
      </Stack>
    </GestureHandlerRootView>
  );
}
