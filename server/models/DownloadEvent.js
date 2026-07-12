const mongoose = require('mongoose');

const DownloadEventSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectAsset', required: true, index: true },
    version: { type: String },
  },
  { timestamps: true }
);

DownloadEventSchema.index({ createdAt: 1 });

module.exports = mongoose.models.DownloadEvent || mongoose.model('DownloadEvent', DownloadEventSchema);
