const admin = require('firebase-admin');
const path = require('path');
const env = require('./env');
const logger = require('../utils/logger');

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();
  if (env.firebase.serviceAccountPath) {
    try {
      const serviceAccountPath = path.resolve(process.cwd(), env.firebase.serviceAccountPath);
      return admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
        storageBucket: env.firebase.storageBucket
      });
    } catch (error) {
      logger.warn(`Firebase service account file could not be loaded: ${error.message}`);
    }
  }

  if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
    logger.warn('Firebase Admin is not configured; push notifications will be skipped');
    return null;
  }

  const privateKey = env.firebase.privateKey.replace(/\\n/g, '\n');
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey
    }),
    storageBucket: env.firebase.storageBucket
  });
}

module.exports = { admin, getFirebaseApp };
