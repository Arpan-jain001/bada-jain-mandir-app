const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

/**
 * Get user's notification preferences
 */
exports.getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    message: 'Notification preferences retrieved',
    preferences: user.notificationPreferences || {}
  });
});

/**
 * Update user's notification preferences
 */
exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const {
    pushEnabled,
    promotionalEnabled,
    updateEnabled,
    announcementsEnabled,
    eventEnabled,
    chatEnabled,
    emailEnabled,
    deliveryMode,
    quietMode,
    promotionalEmailsEnabled
  } = req.body;

  // Validate deliveryMode if provided
  if (deliveryMode && !['push', 'email', 'both'].includes(deliveryMode)) {
    throw new ApiError(400, 'Invalid deliveryMode. Must be one of: push, email, both');
  }

  // Build preferences object with only provided fields
  const preferencesUpdate = {};
  
  if (pushEnabled !== undefined) preferencesUpdate.pushEnabled = Boolean(pushEnabled);
  if (promotionalEnabled !== undefined) preferencesUpdate.promotionalEnabled = Boolean(promotionalEnabled);
  if (updateEnabled !== undefined) preferencesUpdate.updateEnabled = Boolean(updateEnabled);
  if (announcementsEnabled !== undefined) preferencesUpdate.announcementsEnabled = Boolean(announcementsEnabled);
  if (eventEnabled !== undefined) preferencesUpdate.eventEnabled = Boolean(eventEnabled);
  if (chatEnabled !== undefined) preferencesUpdate.chatEnabled = Boolean(chatEnabled);
  if (emailEnabled !== undefined) preferencesUpdate.emailEnabled = Boolean(emailEnabled);
  if (deliveryMode !== undefined) preferencesUpdate.deliveryMode = deliveryMode;
  if (quietMode !== undefined) preferencesUpdate.quietMode = Boolean(quietMode);
  if (promotionalEmailsEnabled !== undefined) preferencesUpdate.promotionalEmailsEnabled = Boolean(promotionalEmailsEnabled);

  // Update user with new preferences
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'notificationPreferences': {
        ...req.user.notificationPreferences,
        ...preferencesUpdate
      }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    message: 'Notification preferences updated successfully',
    preferences: user.notificationPreferences
  });
});

/**
 * Reset notification preferences to defaults
 */
exports.resetNotificationPreferences = asyncHandler(async (req, res) => {
  const defaultPreferences = {
    pushEnabled: true,
    promotionalEnabled: false,
    updateEnabled: true,
    announcementsEnabled: true,
    eventEnabled: true,
    chatEnabled: true,
    emailEnabled: true,
    deliveryMode: 'both',
    quietMode: false,
    promotionalEmailsEnabled: false
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationPreferences: defaultPreferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    message: 'Notification preferences reset to defaults',
    preferences: user.notificationPreferences
  });
});
