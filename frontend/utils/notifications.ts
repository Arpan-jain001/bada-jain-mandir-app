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
const NOTIFICATION_PERMISSION_STATUS_KEY = 'notification_permission_status';
const TOKEN_REGISTRATION_KEY = 'notification_token_data';
const TOKEN_EXPIRY_DAYS = 30; // Refresh token every 30 days
const TOKEN_REGISTRATION_RETRY_KEY = 'token_registration_retry_count';
const MAX_TOKEN_REGISTRATION_RETRIES = 3;

const getEasProjectId = () => {
  const projectId = extra.eas?.projectId || extra.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  return typeof projectId === 'string' && projectId && !projectId.startsWith('YOUR_') ? projectId : undefined;
};

/**
 * Log utility for production debugging
 */
const log = {
  info: (tag: string, msg: string, data?: any) => {
    console.log(`[NOTIF] ${tag}: ${msg}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (tag: string, msg: string, data?: any) => {
    console.warn(`[NOTIF] ${tag}: ${msg}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (tag: string, msg: string, error?: any) => {
    console.error(`[NOTIF] ${tag}: ${msg}`, error?.message || String(error));
  },
};

type ExpoNotifications = typeof import('expo-notifications');
let notificationsModule: ExpoNotifications | null = null;

/**
 * Lazy load expo-notifications module
 * Prevents issues in Expo Go and web environments
 */
const getNotifications = async (): Promise<ExpoNotifications | null> => {
  if (isExpoGo) return null;
  if (!notificationsModule) {
    try {
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
      log.info('INIT', 'expo-notifications module loaded');
    } catch (error) {
      log.error('INIT', 'Failed to load expo-notifications', error);
      return null;
    }
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

/**
 * Load notification preferences from SecureStore
 * Defaults to all enabled if not found
 */
export const loadNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const stored = await SecureStore.getItemAsync('notification_preferences');
    if (!stored) {
      log.info('PREFS', 'No preferences found, using defaults');
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(stored);
    log.info('PREFS', 'Preferences loaded', parsed);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    log.error('PREFS', 'Failed to load preferences', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Save notification preferences to both local storage and backend
 * Runs sync call but doesn't block on backend response
 */
export const saveNotificationPreferences = async (preferences: NotificationPreferences) => {
  try {
    await SecureStore.setItemAsync('notification_preferences', JSON.stringify(preferences));
    log.info('PREFS', 'Preferences saved locally', preferences);
    
    // Fire and forget backend sync - don't block UI
    api.put('/auth/preferences', preferences).catch((error) => {
      log.warn('PREFS', 'Failed to sync with backend', error.message);
    });
  } catch (error) {
    log.error('PREFS', 'Failed to save preferences', error);
  }
};

/**
 * Configure Android notification channel
 * Called on every app start to ensure channel exists
 * Does nothing on iOS
 */
export const configureAndroidNotificationChannel = async () => {
  if (isExpoGo || Platform.OS !== 'android') return;
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: CHANNEL_NAME,
      description: CHANNEL_DESCRIPTION,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9933', // Temple orange
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
      bypassDnd: false, // Respect Do Not Disturb
      enableLights: true,
      lightColor: '#FF9933',
    });
    log.info('CHANNEL', 'Android notification channel configured');
  } catch (error) {
    log.error('CHANNEL', 'Failed to configure Android channel', error);
  }
};

/**
 * Request initial notification permission
 * Handles Android 13+ POST_NOTIFICATIONS permission
 * Can be called multiple times - respects user's choice
 */
export const requestInitialNotificationPermission = async () => {
  if (isExpoGo) return null;
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    
    log.info('PERM', 'Starting permission request flow');
    await configureAndroidNotificationChannel();

    const current = await Notifications.getPermissionsAsync();
    log.info('PERM', 'Current permission status', { status: current.status, canAsk: current.canAskAgain });
    
    // Already granted or can't ask anymore
    if (current.status === 'granted' || !current.canAskAgain) {
      await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_STATUS_KEY, current.status);
      log.info('PERM', 'Permission already decided', { status: current.status });
      return current.status;
    }

    // Request permission
    const requested = await Notifications.requestPermissionsAsync();
    await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_STATUS_KEY, requested.status);
    log.info('PERM', 'Permission request result', { status: requested.status });

    // If denied, show helpful alert with option to go to settings
    if (requested.status !== 'granted') {
      Alert.alert(
        'Enable Notifications',
        'Stay updated with temple announcements, live darshan schedules, donation confirmations, and app updates.\n\nYou can enable this anytime in Settings.',
        [
          { text: 'Not Now', style: 'cancel', onPress: () => log.info('PERM', 'User declined permission') },
          {
            text: 'Open Settings',
            onPress: () => {
              log.info('PERM', 'User opening settings');
              Linking.openSettings().catch((err) => log.error('PERM', 'Failed to open settings', err));
            },
          },
        ]
      );
    } else {
      log.info('PERM', 'Permission granted successfully');
    }

    return requested.status;
  } catch (error) {
    log.error('PERM', 'Permission request failed', error);
    return null;
  }
};

/**
 * Store token data with timestamp for expiry tracking
 */
const saveTokenData = async (tokenPayload: any) => {
  try {
    const data = {
      ...tokenPayload,
      registeredAt: new Date().toISOString(),
    };
    await SecureStore.setItemAsync(TOKEN_REGISTRATION_KEY, JSON.stringify(data));
    log.info('TOKEN', 'Token data saved', { platform: tokenPayload.platform, tokenType: tokenPayload.tokenType });
  } catch (error) {
    log.error('TOKEN', 'Failed to save token data', error);
  }
};

/**
 * Check if token needs refresh based on expiry
 */
const isTokenExpired = async (): Promise<boolean> => {
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_REGISTRATION_KEY);
    if (!stored) return true;
    
    const data = JSON.parse(stored);
    const registeredAt = new Date(data.registeredAt);
    const now = new Date();
    const daysDiff = (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60 * 24);
    const expired = daysDiff > TOKEN_EXPIRY_DAYS;
    
    if (expired) {
      log.info('TOKEN', `Token expired (${Math.floor(daysDiff)} days old)`);
    }
    return expired;
  } catch (error) {
    log.warn('TOKEN', 'Failed to check token expiry', error);
    return true; // Assume expired if can't check
  }
};

/**
 * Register or refresh push notification token with retry logic
 * Handles both FCM (native) and Expo Push tokens
 * Implements exponential backoff for failed registrations
 */
export const registerForPushNotifications = async (options: { forcePrompt?: boolean; forceRefresh?: boolean } = {}) => {
  if (isExpoGo) {
    log.info('TOKEN', 'Skipping token registration (Expo Go)');
    return null;
  }
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) {
      log.warn('TOKEN', 'expo-notifications not available');
      return null;
    }

    // Check if token needs refresh
    if (!options.forceRefresh) {
      const expired = await isTokenExpired();
      if (!expired) {
        log.info('TOKEN', 'Token still valid, skipping registration');
        const stored = await SecureStore.getItemAsync(TOKEN_REGISTRATION_KEY);
        return stored ? JSON.parse(stored) : null;
      }
    }

    await configureAndroidNotificationChannel();
    
    const preferences = await loadNotificationPreferences();
    if (!preferences.push && !options.forcePrompt) {
      log.info('TOKEN', 'Notifications disabled by user preference');
      return null;
    }

    const appVersion = Constants.expoConfig?.version || 'unknown';

    // Request permission if needed
    const current = await Notifications.getPermissionsAsync();
    let finalStatus = current.status;
    
    if (current.status !== 'granted' && (current.canAskAgain || options.forcePrompt)) {
      log.info('TOKEN', 'Requesting notification permission');
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      log.warn('TOKEN', 'Notification permission not granted', { status: finalStatus });
      await saveNotificationPreferences({ ...preferences, push: false });
      return null;
    }

    if (!preferences.push) {
      await saveNotificationPreferences({ ...preferences, push: true });
    }

    // Get tokens
    let deviceToken: any = null;
    let expoToken: any = null;

    try {
      deviceToken = await Notifications.getDevicePushTokenAsync().catch(() => null);
    } catch (error) {
      log.warn('TOKEN', 'Failed to get device token', error);
    }

    try {
      const easProjectId = getEasProjectId();
      expoToken = await Notifications.getExpoPushTokenAsync(
        easProjectId ? { projectId: easProjectId } : undefined
      ).catch(() => null);
    } catch (error) {
      log.warn('TOKEN', 'Failed to get Expo token', error);
    }

    if (!deviceToken?.data && !expoToken?.data) {
      log.error('TOKEN', 'No tokens available');
      return null;
    }

    const tokenPayload = {
      token: deviceToken?.data || null,
      tokenType: deviceToken?.type || null,
      expoPushToken: expoToken?.data || null,
      platform: Platform.OS,
      appVersion,
    };

    log.info('TOKEN', 'Tokens retrieved', { hasDeviceToken: !!deviceToken?.data, hasExpoToken: !!expoToken?.data });

    // Register with backend with retry logic
    await registerTokenWithBackend(tokenPayload);
    
    // Save locally only after successful registration
    await saveTokenData(tokenPayload);
    
    return tokenPayload;
  } catch (error) {
    log.error('TOKEN', 'Token registration failed', error);
    return null;
  }
};

/**
 * Register token with backend with exponential backoff retry
 */
const registerTokenWithBackend = async (tokenPayload: any, attempt: number = 1) => {
  try {
    await api.post('/auth/device-token', tokenPayload, {
      timeout: 10000, // 10 second timeout for this specific call
    });
    log.info('TOKEN', 'Token registered with backend successfully');
    // Reset retry count on success
    await SecureStore.setItemAsync(TOKEN_REGISTRATION_RETRY_KEY, '0');
  } catch (error: any) {
    log.warn('TOKEN', `Backend registration failed (attempt ${attempt}/${MAX_TOKEN_REGISTRATION_RETRIES})`, error.message);
    
    // Retry with exponential backoff if not exhausted
    if (attempt < MAX_TOKEN_REGISTRATION_RETRIES) {
      const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      log.info('TOKEN', `Retrying in ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return registerTokenWithBackend(tokenPayload, attempt + 1);
    }
    
    // If all retries exhausted, log but don't throw - app should still work
    log.error('TOKEN', 'All registration attempts exhausted, continuing without backend sync');
    throw error;
  }
};

/**
 * Clear notification badge count on app home screen
 */
export const clearNotificationBadge = async () => {
  if (isExpoGo) return;
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(0).catch(() => undefined);
    log.info('BADGE', 'Badge cleared');
  } catch (error) {
    log.warn('BADGE', 'Failed to clear badge', error);
  }
};

/**
 * Deep link navigation when user taps notification
 * Handles different notification types and custom URLs
 */
export const handleNotificationNavigation = (router: Router, notification: { request: { content: { data?: Record<string, unknown> } } }) => {
  if (!notification?.request?.content?.data) {
    log.warn('NAV', 'No notification data to navigate');
    return;
  }

  const data = notification.request.content.data;
  const type = (data.type || data.category || 'announcements') as string;
  
  log.info('NAV', 'Handling notification navigation', { type });

  // Handle custom URL deep links
  if (typeof data.url === 'string' && data.url.length > 0) {
    log.info('NAV', 'Opening custom URL', { url: data.url });
    Linking.openURL(data.url).catch((err) => log.error('NAV', 'Failed to open URL', err));
    return;
  }

  // Route based on category
  switch (type) {
    case 'donations':
      log.info('NAV', 'Navigating to donations');
      router.push('/user/donations');
      break;
    case 'updates':
      log.info('NAV', 'Showing update alert');
      Alert.alert(
        'Update Available',
        String(data.message || 'A new version is available. Please update the app.'),
        [{ text: 'OK', onPress: () => router.push('/user') }]
      );
      break;
    case 'live-darshan':
      log.info('NAV', 'Navigating to live darshan');
      router.push('/user/live-darshan');
      break;
    case 'festivals/events':
    case 'events':
      log.info('NAV', 'Navigating to events');
      router.push('/user/events');
      break;
    case 'announcements':
    default:
      log.info('NAV', 'Navigating to notifications');
      router.push('/user/notifications');
      break;
  }
};

/**
 * Attach notification event listeners
 * Handles:
 * - Notifications received when app is open (clear badge)
 * - Notifications tapped (deep link navigation)
 * - Notifications received while app was closed (deferred navigation)
 * 
 * Returns cleanup function to remove listeners
 */
export const attachNotificationListeners = (router: Router) => {
  if (isExpoGo) return () => undefined;
  
  let received: { remove: () => void } | null = null;
  let response: { remove: () => void } | null = null;

  getNotifications().then((Notifications) => {
    if (!Notifications) {
      log.warn('LISTEN', 'expo-notifications not available for listeners');
      return;
    }

    try {
      // Handle notifications received while app is open
      received = Notifications.addNotificationReceivedListener((event) => {
        log.info('LISTEN', 'Notification received while app open');
        clearNotificationBadge();
      });

      // Handle notifications tapped/opened
      response = Notifications.addNotificationResponseReceivedListener((event) => {
        log.info('LISTEN', 'User tapped notification');
        handleNotificationNavigation(router, event.notification);
      });

      // Handle notification that triggered app from killed state
      Notifications.getLastNotificationResponseAsync()
        .then((lastResponse) => {
          if (lastResponse?.notification) {
            log.info('LISTEN', 'App opened from notification while killed');
            // Small delay to ensure router is ready
            setTimeout(() => {
              handleNotificationNavigation(router, lastResponse.notification);
            }, 500);
          }
        })
        .catch((error) => {
          log.warn('LISTEN', 'Failed to get last notification response', error);
        });

      log.info('LISTEN', 'Notification listeners attached successfully');
    } catch (error) {
      log.error('LISTEN', 'Failed to attach notification listeners', error);
    }
  });

  // Return cleanup function
  return () => {
    try {
      received?.remove();
      response?.remove();
      log.info('LISTEN', 'Notification listeners removed');
    } catch (error) {
      log.warn('LISTEN', 'Error removing listeners', error);
    }
  };
};
