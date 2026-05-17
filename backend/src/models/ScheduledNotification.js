const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const scheduledNotificationSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['announcements', 'updates', 'festivals/events', 'projects', 'recent-work', 'live-darshan'],
      default: 'announcements',
      index: true
    },
    scheduledFor: { type: Date, required: true, index: true },
    // Reference to the content that triggered this notification
    contentType: { type: String, enum: ['event', 'project', 'recent-work', 'live-darshan'] },
    contentId: String,
    // Execution status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    // Execution details
    executedAt: Date,
    resultsSummary: mongoose.Schema.Types.Mixed,
    failureReason: String,
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    // Timezone-safe scheduling
    timezone: { type: String, default: 'UTC' },
    // Created by admin
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Index for finding pending notifications that need processing
scheduledNotificationSchema.index({ status: 1, scheduledFor: 1 });

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);
