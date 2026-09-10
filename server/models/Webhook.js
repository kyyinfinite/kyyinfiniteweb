const mongoose = require('mongoose');
const crypto = require('crypto');

const WEBHOOK_EVENTS = ['snippet.approved', 'snippet.rejected', 'apikey.quota_warning', 'incident.created'];

const WebhookSchema = new mongoose.Schema(
  {
    ownerUid: { type: String, required: true, index: true },
    url: { type: String, required: true },
    events: { type: [String], enum: WEBHOOK_EVENTS, default: [] },
    secret: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WebhookSchema.statics.generateSecret = function generateSecret() {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`;
};

module.exports = mongoose.models.Webhook || mongoose.model('Webhook', WebhookSchema);
module.exports.WEBHOOK_EVENTS = WEBHOOK_EVENTS;
