const mongoose = require('mongoose');

const ApiKeyUsageEventSchema = new mongoose.Schema(
  {
    keyId: { type: String, required: true, index: true },
    ownerUid: { type: String, index: true, default: null },
    scope: { type: String },
  },
  { timestamps: true }
);

// Query pattern is always "events for this owner in the last N days" — compound index speeds that up.
ApiKeyUsageEventSchema.index({ ownerUid: 1, createdAt: 1 });

module.exports = mongoose.models.ApiKeyUsageEvent || mongoose.model('ApiKeyUsageEvent', ApiKeyUsageEventSchema);
