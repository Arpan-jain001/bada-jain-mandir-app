const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { authResponse } = require('../services/tokenService');
const { sendMail } = require('../services/mailService');
const env = require('../config/env');

function createResetOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function sendPasswordResetOtp(email) {
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  const resetOtp = createResetOtp();
  user.passwordResetToken = crypto.createHash('sha256').update(resetOtp).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendMail({
    to: user.email,
    subject: `Password reset OTP - ${env.appName}`,
    text: `Your password reset OTP is ${resetOtp}. It is valid for 10 minutes.`,
    html: `<p>Your password reset OTP is <strong>${resetOtp}</strong>.</p><p>It is valid for 10 minutes.</p>`
  });
}

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, accepted_privacy_policy } = req.body;
  if (!accepted_privacy_policy) throw new ApiError(400, 'Privacy Policy acceptance is required');
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Email already registered');

  const user = await User.create({ name, email, password, phone, is_admin: false });
  res.status(201).json(authResponse(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  res.json(authResponse(user));
});

exports.me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar_url'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json(req.user);
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  req.user.notificationPreferences = {
    ...req.user.notificationPreferences,
    email: req.body.email ?? req.user.notificationPreferences.email,
    push: req.body.push ?? req.user.notificationPreferences.push,
    announcements: req.body.announcements ?? req.user.notificationPreferences.announcements,
    updates: req.body.updates ?? req.user.notificationPreferences.updates
  };
  await req.user.save();
  res.json(req.user.notificationPreferences);
});

exports.registerFcmToken = asyncHandler(async (req, res) => {
  const { token, tokenType, expoPushToken, platform, appVersion } = req.body;
  if (!token && !expoPushToken) throw new ApiError(400, 'Device token is required');
  req.user.fcmTokens = req.user.fcmTokens.filter(
    (entry) => entry.token !== token && entry.expoPushToken !== expoPushToken
  );
  req.user.fcmTokens.push({ token, tokenType, expoPushToken, platform, appVersion, lastSeenAt: new Date() });
  await req.user.save();
  res.json({ message: 'Device token registered' });
});

exports.removeFcmToken = asyncHandler(async (req, res) => {
  req.user.fcmTokens = req.user.fcmTokens.filter((entry) => entry.token !== req.body.token);
  await req.user.save();
  res.json({ message: 'Device token removed' });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  await sendPasswordResetOtp(req.body.email);
  res.json({ message: 'If the email exists, a password reset OTP has been sent' });
});

exports.resendPasswordResetOtp = asyncHandler(async (req, res) => {
  await sendPasswordResetOtp(req.body.email);
  res.json({ message: 'If the email exists, a new password reset OTP has been sent' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
