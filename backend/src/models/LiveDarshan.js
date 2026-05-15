const mongoose = require('mongoose');
const { publicId } = require('../utils/ids');

const liveDarshanSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    title: { type: String, default: 'Live Darshan' },
    embed_code: String,
    embed_url: String,
    youtube_url: String,
    is_live: { type: Boolean, default: false, index: true },
    started_at: Date,
    stopped_at: Date
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('LiveDarshan', liveDarshanSchema, 'live_darshan');
