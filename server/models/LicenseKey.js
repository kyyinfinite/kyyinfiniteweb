const mongoose = require('mongoose');

const ActivationSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    ip: { type: String },
  },
  { _id: false }
);

const LicenseKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectAsset', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active', index: true },
    // Snapshot dari ProjectAsset SAAT key diterbitkan, supaya perubahan kebijakan
    // produk di kemudian hari tidak mengubah key yang sudah terlanjur terbit.
    maxActivations: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, default: null },
    activations: { type: [ActivationSchema], default: [] },
  },
  { timestamps: true }
);

LicenseKeySchema.methods.isExpired = function isExpired() {
  return this.expiresAt ? this.expiresAt.getTime() < Date.now() : false;
};

module.exports = mongoose.models.LicenseKey || mongoose.model('LicenseKey', LicenseKeySchema);
