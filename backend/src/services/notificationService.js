const User = require('../models/User');
const { sendMail } = require('./mailService');
const { admin, getFirebaseApp } = require('../config/firebase');
const env = require('../config/env');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildNotificationEmailHtml({ title, message, category }) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');
  const safeCategory = escapeHtml(category || 'announcement');
  const websiteUrl = env.websiteUrl || 'https://jainmandirparham.netlify.app/';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eee;">
            <tr>
              <td style="background:#FF9933;padding:24px 28px;color:#fff;">
                <div style="font-size:22px;font-weight:700;line-height:1.25;">${env.appName}</div>
                <div style="font-size:14px;opacity:.95;margin-top:4px;">Parham</div>
              </td>
            </tr>
            <tr>
              <td style="height:8px;background:#138808;"></td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <div style="display:inline-block;background:#fff2e5;color:#c45d00;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;">${safeCategory}</div>
                <h1 style="font-size:24px;line-height:1.3;margin:18px 0 12px;color:#222;">${safeTitle}</h1>
                <div style="font-size:16px;line-height:1.65;color:#444;">${safeMessage}</div>
                <div style="margin-top:28px;">
                  <a href="${websiteUrl}" style="display:inline-block;background:#FF9933;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:10px;font-weight:700;">Visit Website</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#fafafa;border-top:1px solid #eee;color:#666;font-size:13px;line-height:1.5;">
                <div>${env.appName}</div>
                <a href="${websiteUrl}" style="color:#FF7722;text-decoration:none;">${websiteUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmailToUsers({ title, message, category }) {
  const users = await User.find({ is_admin: false, 'notificationPreferences.email': true, email: { $exists: true } });
  let sent = 0;
  const errors = [];
  const html = buildNotificationEmailHtml({ title, message, category });
  for (const user of users) {
    try {
      await sendMail({
        to: user.email,
        subject: title,
        text: `${title}\n\n${message}\n\n${env.appName}\n${env.websiteUrl}`,
        html
      });
      sent += 1;
    } catch (error) {
      errors.push(`Email to ${user.email}: ${error.message}`);
    }
  }
  return { sent, errors };
}

async function sendExpoPushNotifications({ tokens, title, message, category }) {
  if (tokens.length === 0) return { sent: 0, errors: [] };

  const chunks = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  let sent = 0;
  const errors = [];
  for (const chunk of chunks) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        chunk.map((to) => ({
          to,
          title,
          body: message,
          sound: 'default',
          priority: 'high',
          channelId: env.fcmAndroidChannelId,
          data: { category: category || 'announcements', type: category || 'announcements' }
        }))
      )
    });

    const json = await response.json().catch(() => ({}));
    const receipts = Array.isArray(json.data) ? json.data : [];
    sent += receipts.filter((item) => item.status === 'ok').length;
    errors.push(
      ...receipts
        .filter((item) => item.status === 'error')
        .map((item) => item.message || item.details?.error || 'Expo push failed')
    );
    if (!response.ok && receipts.length === 0) {
      errors.push(json.errors?.[0]?.message || `Expo push failed with HTTP ${response.status}`);
    }
  }

  return { sent, errors };
}

async function sendPushToUsers({ title, message, category }) {
  const app = getFirebaseApp();

  const preferenceQuery =
    category === 'updates'
      ? { 'notificationPreferences.updates': true }
      : category === 'announcements' || category === 'festivals/events'
        ? { 'notificationPreferences.announcements': true }
        : {};

  const users = await User.find({
    is_admin: false,
    'notificationPreferences.push': true,
    'fcmTokens.0': { $exists: true },
    ...preferenceQuery
  });

  const fcmTokens = [...new Set(users.flatMap((user) => user.fcmTokens.map((entry) => entry.token)).filter(Boolean))];
  const expoTokens = [
    ...new Set(users.flatMap((user) => user.fcmTokens.map((entry) => entry.expoPushToken)).filter(Boolean))
  ];
  if (fcmTokens.length === 0 && expoTokens.length === 0) return { sent: 0, errors: [] };

  let fcmSent = 0;
  const errors = [];
  if (app && fcmTokens.length > 0) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title, body: message },
      data: { category: category || 'announcements', type: category || 'announcements' },
      android: {
        priority: 'high',
        notification: { channelId: env.fcmAndroidChannelId, sound: 'default' }
      }
    });

    const invalidTokens = [];
    response.responses.forEach((item, index) => {
      const code = item.error?.code || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-registration-token')) {
        invalidTokens.push(fcmTokens[index]);
      }
    });

    if (invalidTokens.length > 0) {
      await User.updateMany({}, { $pull: { fcmTokens: { token: { $in: invalidTokens } } } });
    }

    fcmSent = response.successCount;
    errors.push(...response.responses.filter((item) => !item.success).map((item) => item.error?.message || 'Push failed'));
  } else if (fcmTokens.length > 0) {
    errors.push('Firebase Admin is not configured');
  }

  const expo = await sendExpoPushNotifications({ tokens: expoTokens, title, message, category });
  return {
    sent: fcmSent + expo.sent,
    errors: [...errors, ...expo.errors]
  };
}

module.exports = { sendEmailToUsers, sendPushToUsers };
