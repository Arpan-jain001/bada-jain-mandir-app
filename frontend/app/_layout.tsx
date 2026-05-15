import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { setAuthToken } from '../utils/api';
import { attachNotificationListeners, clearNotificationBadge, registerForPushNotifications } from '../utils/notifications';
import { checkForAppUpdate } from '../utils/appUpdates';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialized, loadStoredAuth, token } = useAuthStore();
  const loadLanguage = usePreferencesStore((state) => state.loadLanguage);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load stored auth on app start
    loadStoredAuth();
    loadLanguage();
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
      // Hide splash screen once initialized
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);

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
