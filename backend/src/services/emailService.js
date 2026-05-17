/**
 * Email Service
 * Separates system emails (never skip) from promotional emails (user-controlled)
 */

const { sendMail } = require('./mailService');
const User = require('../models/User');
const env = require('../config/env');

/**
 * Send system/security email
 * Always sends regardless of user preferences
 * Used for: password reset, OTP, security alerts, login verification, etc.
 */
async function sendSystemEmail({ to, subject, text, html, attachments }) {
  if (!to) {
    throw new Error('Email recipient (to) is required');
  }

  try {
    const result = await sendMail({
      to,
      subject: `[${env.appName}] ${subject}`,
      text,
      html,
      attachments
    });
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send system email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send promotional email
 * Only sends if user has opted in to promotional emails
 * Used for: marketing campaigns, newsletters, event promotions, offers, etc.
 */
async function sendPromotionalEmail({ userId, to, subject, text, html, attachments }) {
  if (!userId || (!to && !userId)) {
    throw new Error('Either userId or email (to) is required');
  }

  try {
    // If userId provided, fetch user preferences
    let shouldSend = true;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`User not found for promotional email: ${userId}`);
        return { skipped: true, reason: 'user_not_found' };
      }

      // Check if user has opted in
      if (user.notificationPreferences?.promotionalEmailsEnabled === false) {
        return { skipped: true, reason: 'user_opted_out' };
      }

      to = to || user.email;
    }

    // Send the email
    const result = await sendMail({
      to,
      subject: `[${env.appName}] ${subject}`,
      text,
      html,
      attachments
    });

    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send promotional email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send promotional emails to multiple users
 * Only sends to users who have opted in
 */
async function sendPromotionalEmailToUsers({ subject, text, html, attachments }) {
  try {
    // Find users who have opted in to promotional emails
    const users = await User.find({
      is_admin: false,
      'notificationPreferences.promotionalEmailsEnabled': true,
      email: { $exists: true }
    });

    let sent = 0;
    const errors = [];

    for (const user of users) {
      try {
        const result = await sendMail({
          to: user.email,
          subject: `[${env.appName}] ${subject}`,
          text,
          html,
          attachments
        });
        sent += 1;
      } catch (error) {
        errors.push(`Email to ${user.email}: ${error.message}`);
      }
    }

    return { sent, errors, skipped: users.length - sent };
  } catch (error) {
    console.error('Failed to send promotional emails:', error.message);
    throw error;
  }
}

/**
 * Send promotional email to specific user
 * Checks user preferences before sending
 */
async function sendPromotionalEmailToUser(userId, { subject, text, html, attachments }) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { skipped: true, reason: 'user_not_found' };
    }

    // Check preference
    if (user.notificationPreferences?.promotionalEmailsEnabled !== true) {
      return { skipped: true, reason: 'user_opted_out' };
    }

    // Send email
    const result = await sendMail({
      to: user.email,
      subject: `[${env.appName}] ${subject}`,
      text,
      html,
      attachments
    });

    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send promotional email to user ${userId}:`, error.message);
    throw error;
  }
}

module.exports = {
  sendSystemEmail,
  sendPromotionalEmail,
  sendPromotionalEmailToUsers,
  sendPromotionalEmailToUser
};
