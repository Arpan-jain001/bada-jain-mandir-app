const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['donations', 'announcements', 'updates', 'festivals/events'],
      default: 'announcements',
      index: true
    },
    channels: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    },
    results: mongoose.Schema.Types.Mixed,
    sent_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sent_at: Date
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Notification', notificationSchema);
