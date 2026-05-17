const LiveDarshan = require('../models/LiveDarshan');
const asyncHandler = require('../utils/asyncHandler');
const { sendPushToUsers, sendEmailToUsers } = require('../services/notificationService');
const Notification = require('../models/Notification');

function extractEmbedUrl(embedCode = '') {
  const match = String(embedCode).match(/src=["']([^"']+)["']/i);
  return match?.[1] || embedCode;
}

exports.getLiveDarshan = asyncHandler(async (req, res) => {
  const live = await LiveDarshan.findOne().sort('-updated_at');
  res.json(live || { is_live: false, title: 'Live Darshan' });
});

exports.updateLiveDarshan = asyncHandler(async (req, res) => {
  const isLive = !!req.body.is_live;
  const data = {
    title: req.body.title || 'Live Darshan',
    embed_code: req.body.embed_code,
    embed_url: req.body.embed_url || extractEmbedUrl(req.body.embed_code),
    youtube_url: req.body.youtube_url,
    is_live: isLive,
    started_at: isLive ? new Date() : undefined,
    stopped_at: isLive ? undefined : new Date()
  };

  const live = await LiveDarshan.findOneAndUpdate({}, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });

  if (isLive && req.body.notify !== false) {
    const payload = {
      title: '🔴 Live Darshan Started Now',
      message: 'Live Darshan has started. Tap to watch now.',
      category: 'festivals/events'
    };
    
    const results = await sendPushToUsers(payload);
    if (req.body.send_email) {
      await sendEmailToUsers(payload);
    }
    
    // Log the notification
    await Notification.create({
      title: payload.title,
      message: payload.message,
      category: payload.category,
      channels: { 
        push: true, 
        email: !!req.body.send_email 
      },
      results,
      sent_by: req.user?._id,
      sent_at: new Date()
    });
  }

  res.json(live);
});
