const mongoose = require('mongoose');

const UserAccountSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, lowercase: true, trim: true, default: null },
    phoneNumber: { type: String, trim: true, default: null },
    username: { type: String, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    provider: {
      type: String,
      enum: ['google.com', 'github.com', 'password', 'phone', 'other'],
      default: 'other',
    },
    // Verified contributors' snippet submissions skip the moderation queue
    // and go live immediately — set by an admin from the snippet panel.
    isVerifiedContributor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserAccount || mongoose.model('UserAccount', UserAccountSchema);
