const mongoose = require('mongoose');

const ChangelogEntrySchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    releaseDate: { type: Date, default: Date.now },
    notes: { type: [String], default: [] },
    fileUrl: { type: String, required: true },
  },
  { _id: true, timestamps: false }
);

const ProjectAssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['whatsapp-bot', 'snippet', 'plugin'],
      required: true,
      index: true,
    },
    currentVersion: { type: String, required: true, default: '1.0.0' },
    downloadUrl: { type: String, required: true },
    firebaseStoragePath: { type: String, required: true },
    downloadCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    changelogs: { type: [ChangelogEntrySchema], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProjectAssetSchema.index({ name: 'text', description: 'text', tags: 'text' });

ProjectAssetSchema.pre('validate', function assignSlug(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.models.ProjectAsset || mongoose.model('ProjectAsset', ProjectAssetSchema);
