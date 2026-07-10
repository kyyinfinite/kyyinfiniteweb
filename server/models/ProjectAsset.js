const mongoose = require('mongoose');

/**
 * Sub-document schema for an individual release entry.
 * Each changelog entry represents one historical version of the parent asset.
 */
const ChangelogEntrySchema = new mongoose.Schema(
  {
    version: { type: String, required: true, trim: true },
    releaseDate: { type: Date, default: Date.now },
    notes: { type: [String], default: [] },
    fileUrl: { type: String, trim: true },
  },
  { _id: true }
);

const ProjectAssetSchema = new mongoose.Schema(
  {
    /**
     * Display name of the asset, e.g. "Aurora WhatsApp Bot".
     */
    name: { type: String, required: true, trim: true, index: true },

    /**
     * Legacy alias kept for backwards-compatibility with existing controllers
     * that still reference `title`. Auto-synced from `name` via pre-validate hook.
     */
    title: { type: String, trim: true },

    /**
     * Short marketing description shown on cards and the changelog hero.
     */
    description: { type: String, default: '' },

    /**
     * High-level product category. The blueprint expects three primary
     * verticals: WhatsApp bot scripts, reusable code snippets, and game plugins.
     */
    category: {
      type: String,
      enum: ['whatsapp-bot', 'snippet', 'plugin'],
      required: true,
      index: true,
    },

    /**
     * Legacy `assetType` field — kept for backwards compatibility with older
     * controllers. The pre-validate hook below keeps it in sync with `category`.
     */
    assetType: { type: String, enum: ['plugin', 'script', 'whatsapp-bot', 'snippet'] },

    /**
     * Semantic version of the most recently published release.
     * Acts as the canonical "currentVersion" referenced by the changelog hero.
     */
    currentVersion: { type: String, default: '1.0.0' },

    /**
     * Legacy `version` field — kept in sync with `currentVersion` so existing
     * controllers (showcase cards, asset detail, download counter) keep working.
     */
    version: { type: String, default: '1.0.0' },

    /**
     * Primary download URL for the LATEST build. This is what the big
     * "Download Latest Version" button on ChangelogsPage points to.
     */
    downloadUrl: { type: String, default: '' },

    /**
     * Legacy Firebase CDN URL — kept so older controllers continue to resolve.
     * Pre-validate hook mirrors `downloadUrl` into this field automatically.
     */
    firebaseCdnUrl: { type: String, default: '' },
    firebaseStoragePath: { type: String, default: '' },

    /**
     * Embedded release history. The newest entry SHOULD mirror `currentVersion`.
     * The ChangelogsPage UI iterates this array to render the Git-style timeline.
     */
    changelogs: {
      type: [ChangelogEntrySchema],
      default: [],
      validate: {
        validator: (entries) => Array.isArray(entries),
        message: 'changelogs must be an array',
      },
    },

    downloadCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/**
 * Pre-validate hook that keeps legacy fields (`title`, `version`, `assetType`,
 * `firebaseCdnUrl`) in sync with the new blueprint fields so existing
 * controllers/routes/admin dashboard continue to work without changes.
 */
ProjectAssetSchema.pre('validate', function preValidateSync(next) {
  if (this.name && !this.title) this.title = this.name;
  if (this.title && !this.name) this.name = this.title;

  if (this.currentVersion && !this.version) this.version = this.currentVersion;
  if (this.version && !this.currentVersion) this.currentVersion = this.version;

  if (this.downloadUrl && !this.firebaseCdnUrl) this.firebaseCdnUrl = this.downloadUrl;
  if (this.firebaseCdnUrl && !this.downloadUrl) this.downloadUrl = this.firebaseCdnUrl;

  // Map the new `category` value onto the legacy `assetType` enum.
  if (this.category) {
    if (this.category === 'whatsapp-bot') this.assetType = 'whatsapp-bot';
    else if (this.category === 'snippet') this.assetType = 'snippet';
    else if (this.category === 'plugin') this.assetType = 'plugin';
  } else if (this.assetType) {
    if (this.assetType === 'whatsapp-bot') this.category = 'whatsapp-bot';
    else if (this.assetType === 'snippet') this.category = 'snippet';
    else if (this.assetType === 'plugin' || this.assetType === 'script') this.category = 'plugin';
  }

  next();
});

/**
 * Helper used by the storage controller when an admin publishes a new version.
 * It unshifts a new entry to the front of the changelogs array and updates
 * `currentVersion` / `downloadUrl` atomically.
 */
ProjectAssetSchema.statics.publishVersion = async function publishVersion(
  assetId,
  { version, notes, fileUrl, releaseDate }
) {
  const update = {
    $inc: { __v: 1 },
    $set: { currentVersion: version },
    $unshift: {
      changelogs: {
        version,
        releaseDate: releaseDate || new Date(),
        notes: Array.isArray(notes) ? notes : [],
        fileUrl: fileUrl || '',
      },
    },
  };
  if (fileUrl) update.$set.downloadUrl = fileUrl;
  return this.findByIdAndUpdate(assetId, update, { new: true });
};

ProjectAssetSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.models.ProjectAsset || mongoose.model('ProjectAsset', ProjectAssetSchema);
