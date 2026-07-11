const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    guestEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    orderType: { type: String, enum: ['panel', 'asset'], default: 'panel', index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectAsset' },
    grossAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    midtransTransactionId: { type: String },
    rawWebhookData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

OrderSchema.pre('validate', function requireTarget(next) {
  if (this.orderType === 'panel' && !this.product) {
    return next(new Error('product is required for panel orders'));
  }
  if (this.orderType === 'asset' && !this.asset) {
    return next(new Error('asset is required for asset orders'));
  }
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
