const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { publicId } = require('../utils/ids');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, default: publicId, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    is_admin: { type: Boolean, default: false, index: true },
    avatar_url: String,
    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      promotionalEnabled: { type: Boolean, default: false },
      updateEnabled: { type: Boolean, default: true },
      announcementsEnabled: { type: Boolean, default: true },
      eventEnabled: { type: Boolean, default: true },
      chatEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      deliveryMode: { type: String, enum: ['push', 'email', 'both'], default: 'both' },
      quietMode: { type: Boolean, default: false },
      promotionalEmailsEnabled: { type: Boolean, default: false }
    },
    fcmTokens: [
      {
        token: String,
        tokenType: String,
        expoPushToken: String,
        platform: String,
        appVersion: String,
        lastSeenAt: { type: Date, default: () => new Date() }
      }
    ],
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
