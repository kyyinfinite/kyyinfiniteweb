const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema(
  {
    keyId: { type: String, required: true, unique: true, index: true },
    hashedSecret: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    ownerType: { type: String, enum: ['admin', 'user'], default: 'admin', index: true },
    ownerUid: { type: String, index: true, default: null },
    scopes: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
    rateLimitTier: { type: String, enum: ['default', 'pro'], default: 'default' },
    requestCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    lastUsedIp: { type: String },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
