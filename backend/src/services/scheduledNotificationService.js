const ScheduledNotification = require('../models/ScheduledNotification');
const Event = require('../models/Content').Event;
const { sendPushToUsers, sendEmailToUsers } = require('./notificationService');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Schedule an event notification to be sent at a specific time
 * @param {Object} params - Configuration object
 * @param {string} params.eventId - Event document _id
 * @param {string} params.eventTitle - Event title
 * @param {Date} params.scheduledTime - When to send the notification
 * @param {string} params.timezone - Timezone for scheduling
 * @param {ObjectId} params.userId - Admin user ID
 */
async function scheduleEventNotification({ eventId, eventTitle, scheduledTime, timezone, userId }) {
  try {
    // Check if notification is already scheduled for this event
    const existing = await ScheduledNotification.findOne({
      contentId: eventId,
      contentType: 'event',
      status: { $in: ['pending', 'processing'] }
    });

    if (existing) {
      // Update existing scheduled notification
      existing.scheduledFor = scheduledTime;
      existing.timezone = timezone;
      await existing.save();
      logger.info('Updated scheduled event notification', {
        eventId,
        scheduledFor: scheduledTime
      });
      return existing;
    }

    // Create new scheduled notification
    const notification = await ScheduledNotification.create({
      title: `📅 Event Started: ${eventTitle}`,
      message: `${eventTitle} is starting now. Tap to view details.`,
      category: 'festivals/events',
      scheduledFor: scheduledTime,
      contentType: 'event',
      contentId: eventId,
      timezone,
      created_by: userId
    });

    logger.info('Scheduled event notification', {
      eventId,
      notificationId: notification.id,
      scheduledFor: scheduledTime
    });

    return notification;
  } catch (error) {
    logger.error('Failed to schedule event notification', {
      eventId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Process pending scheduled notifications
 * Called by cron job
 */
async function processPendingNotifications() {
  const now = new Date();

  try {
    // Find all pending notifications that are due
    const pendingNotifications = await ScheduledNotification.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    }).limit(100);

    if (pendingNotifications.length === 0) {
      return { processed: 0, successful: 0, failed: 0 };
    }

    logger.info(`Processing ${pendingNotifications.length} pending notifications`);

    let successful = 0;
    let failed = 0;

    for (const notif of pendingNotifications) {
      try {
        await processNotification(notif);
        successful++;
      } catch (error) {
        logger.error('Failed to process notification', {
          notificationId: notif.id,
          error: error.message
        });
        failed++;
      }
    }

    return {
      processed: pendingNotifications.length,
      successful,
      failed
    };
  } catch (error) {
    logger.error('Error processing pending notifications', {
      error: error.message
    });
    return { processed: 0, successful: 0, failed: 0, error: error.message };
  }
}

/**
 * Process a single scheduled notification
 */
async function processNotification(scheduledNotif) {
  try {
    // Update status to processing
    scheduledNotif.status = 'processing';
    await scheduledNotif.save();

    // Send the notification
    const payload = {
      title: scheduledNotif.title,
      message: scheduledNotif.message,
      category: scheduledNotif.category
    };

    const results = await sendPushToUsers(payload);

    // Record the sent notification
    const notification = await Notification.create({
      title: scheduledNotif.title,
      message: scheduledNotif.message,
      category: scheduledNotif.category,
      channels: { push: true },
      results,
      sent_at: new Date()
    });

    // Update scheduled notification status
    scheduledNotif.status = 'completed';
    scheduledNotif.executedAt = new Date();
    scheduledNotif.resultsSummary = {
      notificationId: notification._id,
      sentCount: results.sent,
      errorCount: results.errors?.length || 0
    };
    await scheduledNotif.save();

    // Mark event as notified if applicable
    if (scheduledNotif.contentType === 'event' && scheduledNotif.contentId) {
      await Event.updateOne(
        { _id: scheduledNotif.contentId },
        { notification_sent: true }
      );
    }

    logger.info('Successfully processed scheduled notification', {
      notificationId: scheduledNotif.id,
      sentCount: results.sent
    });

    return { success: true, results };
  } catch (error) {
    logger.error('Error executing scheduled notification', {
      notificationId: scheduledNotif.id,
      error: error.message
    });

    // Update retry count and status
    scheduledNotif.retryCount = (scheduledNotif.retryCount || 0) + 1;

    if (scheduledNotif.retryCount >= (scheduledNotif.maxRetries || 3)) {
      scheduledNotif.status = 'failed';
      scheduledNotif.failureReason = error.message;
    } else {
      // Reschedule for 5 minutes later
      scheduledNotif.scheduledFor = new Date(scheduledNotif.scheduledFor.getTime() + 5 * 60 * 1000);
      scheduledNotif.status = 'pending';
    }

    await scheduledNotif.save();
    throw error;
  }
}

/**
 * Get status of scheduled notifications
 */
async function getScheduledNotificationsStatus() {
  const stats = await ScheduledNotification.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  };

  stats.forEach((stat) => {
    if (result.hasOwnProperty(stat._id)) {
      result[stat._id] = stat.count;
    }
  });

  return result;
}

module.exports = {
  scheduleEventNotification,
  processPendingNotifications,
  processNotification,
  getScheduledNotificationsStatus
};
