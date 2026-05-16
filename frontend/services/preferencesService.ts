/**
 * Notification Preferences API Service
 * Handles frontend API calls for user notification preferences
 */

import { api } from '../utils/api';

export interface NotificationPreferences {
  pushEnabled: boolean;
  promotionalEnabled: boolean;
  updateEnabled: boolean;
  announcementsEnabled: boolean;
  eventEnabled: boolean;
  chatEnabled: boolean;
  emailEnabled: boolean;
  deliveryMode: 'push' | 'email' | 'both';
  quietMode: boolean;
}

/**
 * Get user's current notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await api.get('/notifications/preferences');
    return response.data.preferences;
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error);
    throw error;
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data.preferences;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await api.post('/notifications/preferences/reset');
    return response.data.preferences;
  } catch (error) {
    console.error('Failed to reset notification preferences:', error);
    throw error;
  }
}

/**
 * Default preferences for new users
 */
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  promotionalEnabled: false,
  updateEnabled: true,
  announcementsEnabled: true,
  eventEnabled: true,
  chatEnabled: true,
  emailEnabled: true,
  deliveryMode: 'both',
  quietMode: false
};
