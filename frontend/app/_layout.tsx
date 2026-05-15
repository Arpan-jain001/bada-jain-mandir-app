import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { setAuthToken } from '../utils/api';
import {
  attachNotificationListeners,
  clearNotificationBadge,
  registerForPushNotifications,
  requestInitialNotificationPermission,
} from '../utils/notifications';
import { checkForAppUpdate } from '../utils/appUpdates';

const BOOT_TIMEOUT_MS = 3500;

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { initialized, loadStoredAuth, token } = useAuthStore();
  const loadLanguage = usePreferencesStore((state) => state.loadLanguage);
  const router = useRouter();
  const pathname = usePathname();
  const bootTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bootTimeoutRef.current = setTimeout(() => {
      const auth = useAuthStore.getState();
      if (!auth.initialized) {
        setAuthToken(null);
        useAuthStore.setState({ initialized: true, token: null, user: null });
      }
    }, BOOT_TIMEOUT_MS);

    loadStoredAuth().finally(() => {
      if (bootTimeoutRef.current) {
        clearTimeout(bootTimeoutRef.current);
        bootTimeoutRef.current = null;
      }
    });
    loadLanguage().catch(() => undefined);

    return () => {
      if (bootTimeoutRef.current) {
        clearTimeout(bootTimeoutRef.current);
        bootTimeoutRef.current = null;
      }
    };
  }, [loadLanguage, loadStoredAuth]);

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

  useEffect(() => {
    if (initialized) {
      // Set token in API client if exists
      if (token) {
        setAuthToken(token);
      }
      SplashScreen.hideAsync().catch(() => undefined);

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
