const {
  Gallery,
  Project,
  RecentWork,
  CommitteeMember,
  Event,
  Banner,
  Announcement
} = require('../models/Content');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../services/cloudinaryService');
const { sendPushToUsers } = require('../services/notificationService');
const { scheduleEventNotification } = require('../services/scheduledNotificationService');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

function clean(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
}

const notificationConfig = {
  projects: {
    title: (doc) => {
      const emoji = {
        upcoming: '🚧',
        ongoing: '🔨',
        completed: '✅'
      }[doc.status] || '🚧';
      return `${emoji} ${doc.title || 'Project Update'}`;
    },
    message: (doc) => {
      const statusText = {
        upcoming: 'is coming soon',
        ongoing: 'is now underway',
        completed: 'has been completed'
      }[doc.status] || 'has been updated';
      return `${doc.description || doc.title || 'A project'} ${statusText}.`;
    },
    category: 'announcements'
  },
  recentWork: {
    title: '✨ New Temple Update Added',
    message: (doc) => doc.description || 'A new recent work update has been added.',
    category: 'announcements'
  },
  events: {
    title: (doc) => {
      const emoji = {
        upcoming: '📅',
        ongoing: '🔴',
        completed: '✅',
        cancelled: '❌'
      }[doc.status] || '📅';
      return `${emoji} ${doc.title || 'Event Update'}`;
    },
    message: (doc) => {
      const statusText = {
        upcoming: 'is coming up',
        ongoing: 'is happening now',
        completed: 'has finished',
        cancelled: 'has been cancelled'
      }[doc.status] || 'has been updated';
      return `${doc.description || doc.title || 'A temple event'} ${statusText}.`;
    },
    category: 'festivals/events'
  },
  announcements: {
    title: (doc) => doc.title || 'New Announcement',
    message: (doc) => doc.message || 'A new temple announcement has been posted.',
    category: (doc) => doc.category || 'announcements'
  }
};

const resolveValue = (value, doc) => (typeof value === 'function' ? value(doc) : value);

async function notifyContentCreate(collectionName, doc, req) {
  const config = notificationConfig[collectionName];
  if (!config) return;

  // Only auto-notify for: projects, recentWork, events
  // Gallery is completely removed from auto-notifications
  const autoNotifyCollections = ['projects', 'recentWork', 'events'];
  if (!autoNotifyCollections.includes(collectionName)) return;

  const payload = {
    title: resolveValue(config.title, doc),
    message: resolveValue(config.message, doc),
    category: resolveValue(config.category, doc)
  };

  try {
    const results = await sendPushToUsers(payload);
    await Notification.create({
      ...payload,
      channels: { push: true },
      results,
      sent_by: req.user?._id,
      sent_at: new Date()
    });

    // Mark as notified
    if (collectionName === 'projects' || collectionName === 'events') {
      await (collectionName === 'projects' ? Project : Event).updateOne(
        { _id: doc._id },
        { notification_sent: true }
      );
    }
  } catch (error) {
    logger.warn('Content notification failed', {
      collection: collectionName,
      itemId: doc.id,
      error: error.message
    });
  }
}

async function scheduleEventNotificationIfNeeded(eventDoc, req) {
  // Schedule notification if date and time are provided
  if (eventDoc.date && eventDoc.time) {
    try {
      const [hours, minutes] = eventDoc.time.split(':').map(Number);
      const [year, month, day] = eventDoc.date.split('-').map(Number);
      
      // Create a Date object for the scheduled time
      const scheduledTime = new Date(year, month - 1, day, hours, minutes, 0);
      
      // Only schedule if the time is in the future
      if (scheduledTime > new Date()) {
        await scheduleEventNotification({
          eventId: eventDoc._id,
          eventTitle: eventDoc.title,
          scheduledTime,
          timezone: req.body.timezone || 'UTC',
          userId: req.user?._id
        });
      }
    } catch (error) {
      logger.warn('Event notification scheduling failed', {
        eventId: eventDoc.id,
        error: error.message
      });
    }
  }
}

function collection(Model, imageFolder, requiredImage = true, collectionName = '') {
  return {
    list: asyncHandler(async (req, res) => {
      const items = await Model.find({ is_active: { $ne: false } }).sort(req.query.sort || '-created_at').limit(1000);
      res.json(items.map(clean));
    }),
    create: asyncHandler(async (req, res) => {
      const body = { ...req.body };
      const file = req.file || req.files?.[0];
      if (file?.buffer || body.image_data) {
        Object.assign(body, await uploadImage(file?.buffer || body.image_data, imageFolder));
        delete body.image_data;
      } else if (requiredImage) {
        throw new ApiError(400, 'Image is required');
      }
      const doc = await Model.create(body);
      await notifyContentCreate(collectionName, doc, req);
      
      // Schedule event notification if applicable
      if (collectionName === 'events') {
        await scheduleEventNotificationIfNeeded(doc, req);
      }
      
      res.status(201).json(clean(doc));
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findOne({ id: req.params.id });
      if (!doc) throw new ApiError(404, 'Item not found');
      
      const oldStatus = doc.status;
      Object.assign(doc, req.body);
      
      const file = req.file || req.files?.[0];
      if (file?.buffer || req.body.image_data) {
        Object.assign(doc, await uploadImage(file?.buffer || req.body.image_data, imageFolder));
        doc.image_data = undefined;
      }
      await doc.save();
      
      // Notify on status change for projects and events
      if ((collectionName === 'projects' || collectionName === 'events') && oldStatus !== doc.status) {
        await notifyContentCreate(collectionName, doc, req);
      }
      
      // Re-schedule event notification if time/date changed
      if (collectionName === 'events' && (oldStatus !== doc.status || req.body.date || req.body.time)) {
        doc.notification_sent = false; // Reset notification flag
        await doc.save();
        await scheduleEventNotificationIfNeeded(doc, req);
      }
      
      res.json(clean(doc));
    }),
    remove: asyncHandler(async (req, res) => {
      const result = await Model.deleteOne({ id: req.params.id });
      if (!result.deletedCount) throw new ApiError(404, 'Item not found');
      res.json({ message: 'Item deleted successfully' });
    })
  };
}

exports.gallery = collection(Gallery, 'temple/gallery', true, 'gallery');
exports.projects = collection(Project, 'temple/projects', true, 'projects');
exports.recentWork = collection(RecentWork, 'temple/recent-work', true, 'recentWork');
exports.committee = collection(CommitteeMember, 'temple/committee', true, 'committee');
exports.events = collection(Event, 'temple/events', false, 'events');
exports.banners = collection(Banner, 'temple/banners', true, 'banners');
exports.announcements = collection(Announcement, 'temple/announcements', false, 'announcements');
