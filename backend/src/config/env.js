const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  appOrigin: process.env.APP_ORIGIN || '*',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-strong-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  admin: {
    name: process.env.ADMIN_NAME || 'Arpan Jain',
    email: process.env.ADMIN_EMAIL || 'jainarpan207@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Arpan@jain6399003541',
    phone: process.env.ADMIN_PHONE || '+916399003541'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    currency: process.env.DONATION_CURRENCY || 'INR'
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  },
  androidPackageName: process.env.ANDROID_PACKAGE_NAME || 'com.parham.jainmandir',
  playStoreUrl: process.env.PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.parham.jainmandir',
  indusAppstoreUrl: process.env.INDUS_APPSTORE_URL || 'https://www.indusappstore.com/',
  indusInstallerPackage: process.env.INDUS_INSTALLER_PACKAGE || 'com.indus.appstore',
  apiBaseUrl: process.env.API_BASE_URL,
  websiteUrl: process.env.WEBSITE_URL || 'https://jainmandirparham.netlify.app/',
  fcmAndroidChannelId: process.env.FCM_ANDROID_CHANNEL_ID || 'temple_updates',
  appName: 'Bada Jain Mandir Parham'
};

module.exports = env;
