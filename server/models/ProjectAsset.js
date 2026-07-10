const mongoose = require('mongoose');

const ProjectAssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    version: { type: String, required: true, default: '1.0.0' },
    assetType: { type: String, enum: ['plugin', 'script'], required: true, index: true },
    firebaseCdnUrl: { type: String, required: true },
    firebaseStoragePath: { type: String, required: true },
    downloadCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProjectAssetSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.models.ProjectAsset || mongoose.model('ProjectAsset', ProjectAssetSchema);
