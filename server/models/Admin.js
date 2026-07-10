const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['superadmin'], default: 'superadmin' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
