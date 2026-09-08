const mongoose = require('mongoose');

const ApiKeyOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    ownerUid: { type: String, required: true, index: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    scopes: { type: [String], default: [] },
    plan: { type: String, enum: ['1000', '10000', 'unlimited'], required: true },
    grossAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    qrCodeUrl: { type: String },
    midtransTransactionId: { type: String },
    issuedApiKey: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', default: null },
    issuedPlaintext: { type: String, default: null }, // dihapus setelah user ambil sekali (lihat reveal endpoint)
    rawWebhookData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ApiKeyOrder || mongoose.model('ApiKeyOrder', ApiKeyOrderSchema);
