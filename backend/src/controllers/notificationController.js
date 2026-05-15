const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmailToUsers, sendPushToUsers } = require('../services/notificationService');

async function handleSend(req, res) {
  const payload = {
    title: req.body.title,
    message: req.body.message,
    category: req.body.category || 'announcements'
  };

  const results = { email: 0, push: 0, sms: 0, whatsapp: 0, errors: [] };
  if (req.body.send_email) {
    const email = await sendEmailToUsers(payload);
    results.email = email.sent;
    results.errors.push(...email.errors);
  }
  if (req.body.send_push || req.body.sendPush) {
    const push = await sendPushToUsers(payload);
    results.push = push.sent;
    results.errors.push(...push.errors);
  }

  const notification = await Notification.create({
    ...payload,
    channels: {
      email: !!req.body.send_email,
      push: !!req.body.send_push,
      sms: !!req.body.send_sms,
      whatsapp: !!req.body.send_whatsapp
    },
    results,
    sent_by: req.user._id,
    sent_at: new Date()
  });

  res.json({ message: 'Notifications sent', results, notification });
}

exports.sendNotification = asyncHandler(handleSend);

exports.sendBroadcast = asyncHandler(async (req, res) => {
  req.body.send_email = req.body.send_email ?? false;
  req.body.send_push = req.body.send_push ?? true;
  return handleSend(req, res);
});

exports.listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort('-created_at').limit(100);
  res.json(notifications);
});
