const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const options = { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } };

const gallerySchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    image_url: { type: String, required: true },
    title: { type: String, trim: true },
    public_id: String
  },
  options
);

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    image_url: { type: String, required: true },
    public_id: String,
    youtube_url: { type: String, trim: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'ongoing', index: true },
    is_active: { type: Boolean, default: true, index: true },
    notification_sent: { type: Boolean, default: false }
  },
  options
);

const committeeSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    position: { type: String, required: true, trim: true },
    image_url: { type: String, required: true },
    public_id: String,
    phone: { type: String, trim: true }
  },
  options
);

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    time: { type: String }, // HH:MM format (e.g., "07:00" or "19:30")
    image_url: String,
    public_id: String,
    category: { type: String, default: 'events' },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming', index: true },
    is_active: { type: Boolean, default: true, index: true },
    notification_sent: { type: Boolean, default: false },
    scheduled_notification_id: String // Reference to ScheduledNotification document
  },
  options
);

const bannerSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, trim: true },
    image_url: { type: String, required: true },
    link_url: String,
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true, index: true }
  },
  options
);

const announcementSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: { type: String, enum: ['announcements', 'updates', 'festivals/events'], default: 'announcements' },
    is_active: { type: Boolean, default: true, index: true },
    published_at: { type: Date, default: Date.now, index: true }
  },
  options
);

module.exports = {
  Gallery: mongoose.model('Gallery', gallerySchema, 'gallery'),
  Project: mongoose.model('Project', projectSchema, 'projects'),
  RecentWork: mongoose.model('RecentWork', projectSchema, 'recent_work'),
  CommitteeMember: mongoose.model('CommitteeMember', committeeSchema, 'committee'),
  Event: mongoose.model('Event', eventSchema, 'events'),
  Banner: mongoose.model('Banner', bannerSchema, 'banners'),
  Announcement: mongoose.model('Announcement', announcementSchema, 'announcements')
};
