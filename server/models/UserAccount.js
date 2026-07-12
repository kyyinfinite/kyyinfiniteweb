const mongoose = require('mongoose');

const UserAccountSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    provider: { type: String, enum: ['google.com', 'github.com', 'password', 'other'], default: 'other' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserAccount || mongoose.model('UserAccount', UserAccountSchema);
