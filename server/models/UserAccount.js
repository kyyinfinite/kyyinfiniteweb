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
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserAccount || mongoose.model('UserAccount', UserAccountSchema);
