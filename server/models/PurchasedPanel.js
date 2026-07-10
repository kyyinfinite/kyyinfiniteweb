const mongoose = require('mongoose');

const PurchasedPanelSchema = new mongoose.Schema(
  {
    guestEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    pterodactylUserId: { type: Number, required: true },
    pterodactylServerId: { type: Number, required: true },
    serverIdentifier: { type: String, required: true },
    ipAddress: { type: String },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PurchasedPanel || mongoose.model('PurchasedPanel', PurchasedPanelSchema);
