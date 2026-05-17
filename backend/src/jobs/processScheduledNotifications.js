const cron = require('node-cron');
const { processPendingNotifications, getScheduledNotificationsStatus } = require('../services/scheduledNotificationService');
const logger = require('../utils/logger');

/**
 * Start the scheduled notification processor
 * Runs every minute to check for pending notifications that need to be sent
 */
function startScheduledNotificationProcessor() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const result = await processPendingNotifications();
      if (result.processed > 0) {
        logger.info('Scheduled notification processor ran', {
          processed: result.processed,
          successful: result.successful,
          failed: result.failed
        });
      }
    } catch (error) {
      logger.error('Error in scheduled notification processor', {
        error: error.message
      });
    }
  });

  logger.info('Scheduled notification processor started');
}

/**
 * Get current status of scheduled notifications
 */
async function getSchedulerStatus() {
  return await getScheduledNotificationsStatus();
}

module.exports = {
  startScheduledNotificationProcessor,
  getSchedulerStatus
};
