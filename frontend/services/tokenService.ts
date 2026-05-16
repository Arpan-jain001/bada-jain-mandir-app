/**
 * Token Service
 * Frontend token lifecycle management
 * Handles registration, refresh, expiry, and cleanup
 */

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '../utils/api';

const TOKEN_DATA_KEY = 'notification_token_data';
const TOKEN_EXPIRY_DAYS = 30;
const TOKEN_CLEANUP_INTERVAL_HOURS = 24;

/**
 * Logging utility
 */
const log = {
  info: (msg: string, data?: any) => console.log(`[TOKEN_SERVICE] ${msg}`, data),
  warn: (msg: string, data?: any) => console.warn(`[TOKEN_SERVICE] ${msg}`, data),
  error: (msg: string, error?: any) => console.error(`[TOKEN_SERVICE] ${msg}`, error?.message || error),
};

export interface StoredTokenData {
  token: string | null;
  tokenType: string | null;
  expoPushToken: string | null;
  platform: string;
  appVersion: string;
  registeredAt: string;
}

/**
 * Get currently stored token data
 */
export async function getStoredTokenData(): Promise<StoredTokenData | null> {
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_DATA_KEY);
    if (!stored) {
      log.info('No token data found in storage');
      return null;
    }
    return JSON.parse(stored);
  } catch (error) {
    log.error('Failed to retrieve token data', error);
    return null;
  }
}

/**
 * Save token data with timestamp
 */
export async function saveTokenData(data: Omit<StoredTokenData, 'registeredAt'>): Promise<boolean> {
  try {
    const tokenData: StoredTokenData = {
      ...data,
      registeredAt: new Date().toISOString(),
    };
    await SecureStore.setItemAsync(TOKEN_DATA_KEY, JSON.stringify(tokenData));
    log.info('Token data saved', { platform: data.platform, appVersion: data.appVersion });
    return true;
  } catch (error) {
    log.error('Failed to save token data', error);
    return false;
  }
}

/**
 * Check if stored token has expired
 * Returns true if expired or no token exists
 */
export async function isTokenExpired(): Promise<boolean> {
  try {
    const tokenData = await getStoredTokenData();
    if (!tokenData) {
      log.info('No token data found - considered expired');
      return true;
    }

    const registeredAt = new Date(tokenData.registeredAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;
    
    const expired = daysDiff > TOKEN_EXPIRY_DAYS;
    log.info(`Token age: ${Math.floor(daysDiff)} days, Expired: ${expired}`);
    
    return expired;
  } catch (error) {
    log.warn('Failed to check token expiry, assuming expired', error);
    return true;
  }
}

/**
 * Get token refresh needed status
 * Also checks if app version changed (requires re-registration)
 */
export async function shouldRefreshToken(): Promise<boolean> {
  try {
    const tokenData = await getStoredTokenData();
    if (!tokenData) return true;

    // Check if app version changed
    const currentAppVersion = Constants.expoConfig?.version || 'unknown';
    if (tokenData.appVersion !== currentAppVersion) {
      log.info('App version changed, refresh needed', {
        old: tokenData.appVersion,
        new: currentAppVersion,
      });
      return true;
    }

    // Check if token expired
    const expired = await isTokenExpired();
    return expired;
  } catch (error) {
    log.error('Failed to check refresh status', error);
    return true;
  }
}

/**
 * Get time until token expires
 * Returns milliseconds or 0 if already expired
 */
export async function getTokenExpiryTime(): Promise<number> {
  try {
    const tokenData = await getStoredTokenData();
    if (!tokenData) return 0;

    const registeredAt = new Date(tokenData.registeredAt);
    const expiresAt = new Date(registeredAt.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, timeUntilExpiry);
  } catch (error) {
    log.error('Failed to get expiry time', error);
    return 0;
  }
}

/**
 * Get human-readable token expiry status
 */
export async function getTokenExpiryStatus(): Promise<string> {
  try {
    const timeMs = await getTokenExpiryTime();
    if (timeMs === 0) return 'Expired';
    
    const days = Math.floor(timeMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  } catch (error) {
    log.error('Failed to get expiry status', error);
    return 'Unknown';
  }
}

/**
 * Validate token data structure
 */
export function validateTokenData(data: any): data is StoredTokenData {
  return (
    data &&
    typeof data === 'object' &&
    (typeof data.token === 'string' || data.token === null) &&
    (typeof data.tokenType === 'string' || data.tokenType === null) &&
    (typeof data.expoPushToken === 'string' || data.expoPushToken === null) &&
    typeof data.platform === 'string' &&
    typeof data.appVersion === 'string' &&
    typeof data.registeredAt === 'string'
  );
}

/**
 * Clear stored token data
 * Called on logout
 */
export async function clearTokenData(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_DATA_KEY);
    log.info('Token data cleared');
    return true;
  } catch (error) {
    log.error('Failed to clear token data', error);
    return false;
  }
}

/**
 * Request token cleanup from backend
 * Removes old or invalid tokens
 */
export async function requestBackendTokenCleanup(): Promise<boolean> {
  try {
    const response = await api.post('/auth/device-tokens/cleanup', {
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || 'unknown',
    });
    log.info('Backend token cleanup requested', response.data);
    return true;
  } catch (error) {
    log.warn('Failed to request backend cleanup', error);
    return false;
  }
}

/**
 * Get all registered tokens for this device
 * Returns list of tokens registered at backend
 */
export async function getRegisteredTokens(): Promise<any[] | null> {
  try {
    const response = await api.get('/auth/device-tokens');
    log.info('Retrieved registered tokens', { count: response.data?.length || 0 });
    return response.data || [];
  } catch (error) {
    log.warn('Failed to get registered tokens', error);
    return null;
  }
}

/**
 * Unregister a specific token
 * Used when user wants to revoke a device
 */
export async function unregisterToken(token: string): Promise<boolean> {
  try {
    await api.delete('/auth/device-token', { data: { token } });
    log.info('Token unregistered', { token: token.substring(0, 10) + '...' });
    return true;
  } catch (error) {
    log.warn('Failed to unregister token', error);
    return false;
  }
}

/**
 * Get token statistics for debugging
 */
export async function getTokenStats(): Promise<any> {
  try {
    const tokenData = await getStoredTokenData();
    const isExpired = await isTokenExpired();
    const shouldRefresh = await shouldRefreshToken();
    const expiryTime = await getTokenExpiryTime();
    const expiryStatus = await getTokenExpiryStatus();

    return {
      hasToken: !!tokenData,
      isExpired,
      shouldRefresh,
      expiryTime,
      expiryStatus,
      platform: tokenData?.platform || 'unknown',
      appVersion: tokenData?.appVersion || 'unknown',
      registeredAt: tokenData?.registeredAt || 'never',
      hasDeviceToken: !!tokenData?.token,
      hasExpoToken: !!tokenData?.expoPushToken,
    };
  } catch (error) {
    log.error('Failed to get token stats', error);
    return null;
  }
}
