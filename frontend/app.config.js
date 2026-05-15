const appJson = require('./app.json');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const DEFAULT_API_BASE_URL = 'https://bada-jain-mandir-app-1357.onrender.com/api';

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const normalizeApiBaseUrl = (url) => {
  const trimmedUrl = url.trim().replace(/\/$/, '');
  return /\/api$/i.test(trimmedUrl) ? trimmedUrl : `${trimmedUrl}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    appJson.expo.extra?.EXPO_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
);

module.exports = {
  ...appJson.expo,
  newArchEnabled: true,
  android: {
    ...(appJson.expo.android || {}),
    newArchEnabled: true,
    usesCleartextTraffic: apiBaseUrl.startsWith('http://') || appJson.expo.android?.usesCleartextTraffic,
  },
  extra: {
    ...(appJson.expo.extra || {}),
    EXPO_PUBLIC_API_BASE_URL: apiBaseUrl,
    ANDROID_PACKAGE_NAME: process.env.ANDROID_PACKAGE_NAME || appJson.expo.extra?.ANDROID_PACKAGE_NAME,
    INDUS_INSTALLER_PACKAGE: process.env.INDUS_INSTALLER_PACKAGE || appJson.expo.extra?.INDUS_INSTALLER_PACKAGE,
    INDUS_APPSTORE_URL: process.env.INDUS_APPSTORE_URL || appJson.expo.extra?.INDUS_APPSTORE_URL,
    PLAY_STORE_URL: process.env.PLAY_STORE_URL || appJson.expo.extra?.PLAY_STORE_URL,
    WEBSITE_URL: process.env.WEBSITE_URL || appJson.expo.extra?.WEBSITE_URL || 'https://jainmandirparham.netlify.app/',
    FCM_ANDROID_CHANNEL_ID: process.env.FCM_ANDROID_CHANNEL_ID || appJson.expo.extra?.FCM_ANDROID_CHANNEL_ID,
    FCM_ANDROID_CHANNEL_NAME: process.env.FCM_ANDROID_CHANNEL_NAME || appJson.expo.extra?.FCM_ANDROID_CHANNEL_NAME,
    FCM_ANDROID_CHANNEL_DESCRIPTION:
      process.env.FCM_ANDROID_CHANNEL_DESCRIPTION || appJson.expo.extra?.FCM_ANDROID_CHANNEL_DESCRIPTION,
    FIREBASE_PROJECT_ID:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      appJson.expo.extra?.FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
      process.env.FIREBASE_APP_ID ||
      appJson.expo.extra?.FIREBASE_APP_ID,
    FIREBASE_MESSAGING_SENDER_ID:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      appJson.expo.extra?.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_STORAGE_BUCKET:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      appJson.expo.extra?.FIREBASE_STORAGE_BUCKET,
  },
};
