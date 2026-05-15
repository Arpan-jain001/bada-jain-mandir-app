import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Router } from 'expo-router';
import { api } from './api';

const extra = Constants.expoConfig?.extra || {};
const isExpoGo = Constants.appOwnership === 'expo';
const CHANNEL_ID = extra.FCM_ANDROID_CHANNEL_ID || process.env.FCM_ANDROID_CHANNEL_ID || 'temple_updates';
const CHANNEL_NAME = extra.FCM_ANDROID_CHANNEL_NAME || process.env.FCM_ANDROID_CHANNEL_NAME || 'Temple Updates';
const CHANNEL_DESCRIPTION =
  extra.FCM_ANDROID_CHANNEL_DESCRIPTION ||
  process.env.FCM_ANDROID_CHANNEL_DESCRIPTION ||
  'Announcements, updates and alerts from the temple app';
const NOTIFICATION_PROMPT_VERSION_KEY = 'notification_permission_prompt_version';

type ExpoNotifications = typeof import('expo-notifications');
let notificationsModule: ExpoNotifications | null = null;

const getNotifications = async () => {
  if (isExpoGo) return null;
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
  return notificationsModule;
};

export type NotificationPreferences = {
  push: boolean;
  email: boolean;
  announcements: boolean;
  updates: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push: true,
  email: true,
  announcements: true,
  updates: true,
};

export const loadNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const stored = await SecureStore.getItemAsync('notification_preferences');
  if (!stored) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
};

export const saveNotificationPreferences = async (preferences: NotificationPreferences) => {
  await SecureStore.setItemAsync('notification_preferences', JSON.stringify(preferences));
  await api.put('/auth/preferences', preferences);
};

export const configureAndroidNotificationChannel = async () => {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: CHANNEL_NAME,
    description: CHANNEL_DESCRIPTION,
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF9933',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
};

export const registerForPushNotifications = async () => {
  if (isExpoGo) return null;
  const Notifications = await getNotifications();
  if (!Notifications) return null;
  await configureAndroidNotificationChannel();

  const preferences = await loadNotificationPreferences();
  const appVersion = Constants.expoConfig?.version || 'unknown';
  const lastPromptVersion = await SecureStore.getItemAsync(NOTIFICATION_PROMPT_VERSION_KEY);
  const shouldPromptThisVersion = lastPromptVersion !== appVersion;
  if (!preferences.push && !shouldPromptThisVersion) return null;

  const current = await Notifications.getPermissionsAsync();
  let finalStatus = current.status;
  if (current.status !== 'granted' && shouldPromptThisVersion) {
    await SecureStore.setItemAsync(NOTIFICATION_PROMPT_VERSION_KEY, appVersion);
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== 'granted') {
    await saveNotificationPreferences({ ...preferences, push: false });
    return null;
  }

  if (!preferences.push) {
    await saveNotificationPreferences({ ...preferences, push: true });
  }

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const expoToken = await Notifications.getExpoPushTokenAsync({
    projectId: extra.eas?.projectId || extra.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  }).catch(() => null);

  const tokenPayload = {
    token: deviceToken.data,
    tokenType: deviceToken.type,
    expoPushToken: expoToken?.data,
    platform: Platform.OS,
    appVersion,
  };

  await api.post('/auth/device-token', tokenPayload);
  return tokenPayload;
};

export const clearNotificationBadge = async () => {
  if (isExpoGo) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.setBadgeCountAsync(0).catch(() => undefined);
};

export const handleNotificationNavigation = (router: Router, notification: { request: { content: { data?: Record<string, unknown> } } }) => {
  const data = notification.request.content.data || {};
  if (typeof data.url === 'string') {
    Linking.openURL(data.url).catch(() => undefined);
    return;
  }

  switch (data.type || data.category) {
    case 'donations':
      router.push('/user/donations');
      break;
    case 'updates':
      Alert.alert('Update Available', String(data.message || 'Please update the app.'));
      break;
    case 'live-darshan':
      router.push('/user/live-darshan');
      break;
    case 'festivals/events':
      router.push('/user/events');
      break;
    case 'announcements':
    default:
      router.push('/user');
      break;
  }
};

export const attachNotificationListeners = (router: Router) => {
  if (isExpoGo) return () => undefined;
  let received: { remove: () => void } | null = null;
  let response: { remove: () => void } | null = null;

  getNotifications().then((Notifications) => {
    if (!Notifications) return;
    received = Notifications.addNotificationReceivedListener(() => {
      clearNotificationBadge();
    });
    response = Notifications.addNotificationResponseReceivedListener((event) => {
      handleNotificationNavigation(router, event.notification);
    });
    Notifications.getLastNotificationResponseAsync()
      .then((lastResponse) => {
        if (lastResponse?.notification) {
          handleNotificationNavigation(router, lastResponse.notification);
        }
      })
      .catch(() => undefined);
  });

  return () => {
    received?.remove();
    response?.remove();
  };
};
