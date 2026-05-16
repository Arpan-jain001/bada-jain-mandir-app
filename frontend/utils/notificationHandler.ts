/**
 * Notification Handler
 * Manages background notification processing, analytics, and deep linking
 * This module runs in the background when the app is killed
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Log notification event for debugging/analytics
 * Useful for understanding notification delivery and engagement
 */
async function logNotificationEvent(event: string, data: any) {
  if (isExpoGo) return;
  try {
    const logs = await SecureStore.getItemAsync('notification_logs');
    const logList = logs ? JSON.parse(logs) : [];
    
    // Keep only last 50 logs
    logList.push({
      event,
      timestamp: new Date().toISOString(),
      data,
    });
    
    if (logList.length > 50) {
      logList.shift();
    }
    
    await SecureStore.setItemAsync('notification_logs', JSON.stringify(logList));
  } catch (error) {
    console.warn('[NOTIF_HANDLER] Failed to log event', error);
  }
}

/**
 * Extract notification data safely
 * Handles malformed or missing notification data gracefully
 */
export function extractNotificationData(notification: Notifications.Notification) {
  try {
    const data = notification?.request?.content?.data || {};
    return {
      title: notification?.request?.content?.title || 'Notification',
      body: notification?.request?.content?.body || '',
      type: (data.type || data.category || 'announcements') as string,
      url: typeof data.url === 'string' ? data.url : undefined,
      customData: data,
      receivedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[NOTIF_HANDLER] Failed to extract notification data', error);
    return null;
  }
}

/**
 * Handle notification received event (foreground)
 * Called when notification arrives while app is open
 */
export async function handleNotificationReceived(notification: Notifications.Notification) {
  const data = extractNotificationData(notification);
  if (!data) return;

  await logNotificationEvent('RECEIVED_FOREGROUND', {
    type: data.type,
    title: data.title,
  });

  console.log('[NOTIF_HANDLER] Notification received (foreground)', data.title);
}

/**
 * Handle notification response event (user tapped)
 * Called when user interacts with a notification
 */
export async function handleNotificationResponse(event: Notifications.NotificationResponse) {
  const data = extractNotificationData(event.notification);
  if (!data) return;

  await logNotificationEvent('RESPONSE_USER_TAPPED', {
    type: data.type,
    title: data.title,
    actionIdentifier: event.actionIdentifier,
  });

  console.log('[NOTIF_HANDLER] User tapped notification', data.type);
  
  // Return the extracted data for router navigation
  return data;
}

/**
 * Handle notification action (Android action buttons)
 * Future support for notification actions like "Open", "Download", etc.
 */
export async function handleNotificationAction(
  event: Notifications.NotificationResponse,
  actionId: string
) {
  const data = extractNotificationData(event.notification);
  if (!data) return;

  await logNotificationEvent('ACTION_TRIGGERED', {
    type: data.type,
    title: data.title,
    actionId,
  });

  console.log('[NOTIF_HANDLER] Notification action triggered', actionId);
  return data;
}

/**
 * Mark notification as read/consumed
 * Useful for tracking which notifications user has seen
 */
export async function markNotificationRead(notificationId: string) {
  try {
    const readList = await SecureStore.getItemAsync('notifications_read');
    const list = readList ? JSON.parse(readList) : [];
    
    if (!list.includes(notificationId)) {
      list.push(notificationId);
      await SecureStore.setItemAsync('notifications_read', JSON.stringify(list));
    }

    await logNotificationEvent('MARKED_READ', { notificationId });
  } catch (error) {
    console.warn('[NOTIF_HANDLER] Failed to mark notification read', error);
  }
}

/**
 * Get notification engagement metrics
 * Returns stats about notification delivery and engagement
 */
export async function getNotificationMetrics() {
  try {
    const logs = await SecureStore.getItemAsync('notification_logs');
    const logList = logs ? JSON.parse(logs) : [];
    
    const metrics = {
      totalReceived: logList.filter((l: any) => l.event === 'RECEIVED_FOREGROUND').length,
      totalTapped: logList.filter((l: any) => l.event === 'RESPONSE_USER_TAPPED').length,
      byCategory: {} as Record<string, number>,
      recentLogs: logList.slice(-10),
    };

    // Count by type
    logList.forEach((log: any) => {
      const type = log.data?.type || 'unknown';
      metrics.byCategory[type] = (metrics.byCategory[type] || 0) + 1;
    });

    return metrics;
  } catch (error) {
    console.error('[NOTIF_HANDLER] Failed to get metrics', error);
    return null;
  }
}

/**
 * Clear notification logs
 * Useful for cleanup and privacy
 */
export async function clearNotificationLogs() {
  try {
    await SecureStore.removeItemAsync('notification_logs');
    await SecureStore.removeItemAsync('notifications_read');
    console.log('[NOTIF_HANDLER] Notification logs cleared');
  } catch (error) {
    console.warn('[NOTIF_HANDLER] Failed to clear logs', error);
  }
}
