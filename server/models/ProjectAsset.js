/**
 * ProjectAsset Model
 * ---------------------------------------------------------------------------
 * Represents a digital product sold / distributed through the Kyyinfinite
 * marketplace. Categories include:
 *   - whatsapp-bot   : Script bot WhatsApp siap pakai
 *   - snippet        : Code snippets reusable
 *   - plugin         : Game plugins (TheoTown, Minecraft, dll)
 *
 * Each asset embeds an array of `changelogs` sub-documents so the entire
 * release history of a product lives on a single document. The latest entry
 * (sorted by releaseDate desc) is treated as the `currentVersion`.
 *
 * Schema ini sengaja dibuat modular: jika kedepan ingin menambahkan field
 * pricing, licensing, atau tags, cukup tambahkan pada block fields di bawah.
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChangelogSchema = new Schema(
  {
    version: {
      type: String,
      required: [true, 'Changelog version is required'],
      trim: true,
      // e.g. "1.2.0", "v2.0.1-beta"
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: [String],
      default: [],
      // Array of bullet-point strings describing changes for this version
    },
    fileUrl: {
      type: String,
      default: '',
      // Direct download URL (Firebase Storage / S3 / CDN) for THIS version's
      // archive (.zip / .rar). Boleh kosong jika file lama sudah tidak disediakan.
    },
  },
  { _id: true, timestamps: false }
);

const ProjectAssetSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Slug dipakai untuk routing React Router: /changelogs/:slug
    },

    category: {
      type: String,
      enum: {
        values: ['whatsapp-bot', 'snippet', 'plugin'],
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
      index: true,
    },

    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: 180,
    },

    longDescription: {
      type: String,
      default: '',
    },

    // Latest published version (denormalized for fast listing queries).
    // Updated automatically by the controller whenever a new changelog
    // entry is appended.
    currentVersion: {
      type: String,
      default: '',
      trim: true,
    },

    // Primary download URL for the latest version. Convenience field so the
    // Landing / Marketplace grid doesn't need to dive into the changelogs
    // array just to surface a "Download" button.
    downloadUrl: {
      type: String,
      default: '',
    },

    // Optional cover image / thumbnail URL
    coverImageUrl: {
      type: String,
      default: '',
    },

    // Tech stack tags untuk filter & search
    tags: {
      type: [String],
      default: [],
    },

    // Game / platform target (e.g. "TheoTown", "Minecraft Java 1.20",
    // "WhatsApp BAILEYS"). Hanya relevan untuk kategori plugin & bot.
    platform: {
      type: String,
      default: '',
      trim: true,
    },

    // Embed seluruh riwayat rilis produk pada satu dokumen.
    // urutan paling akhir dianggap paling baru (sort by releaseDate desc).
    changelogs: {
      type: [ChangelogSchema],
      default: [],
    },

    // Soft-publish flag: produk draft tidak muncul di listing public.
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Virtuals ---------------------------------------------------------------

/**
 * Hitung jumlah total rilis (panjang changelogs). Dipakai di UI Listing.
 */
ProjectAssetSchema.virtual('releaseCount').get(function () {
  return Array.isArray(this.changelogs) ? this.changelogs.length : 0;
});

/**
 * Ambil changelog terbaru (releaseDate tertinggi) sebagai objek.
 * Dipakai oleh ChangelogsPage hero section.
 */
ProjectAssetSchema.virtual('latestChangelog').get(function () {
  if (!Array.isArray(this.changelogs) || this.changelogs.length === 0) {
    return null;
  }
  return [...this.changelogs].sort(
    (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
  )[0];
});

// --- Hooks ------------------------------------------------------------------

/**
 * Auto-sync `currentVersion` & `downloadUrl` whenever the document is saved,
 * supaya tidak perlu manual di controller. Sumber kebenaran tetap array
 * `changelogs` — field denormalized hanya untuk performa query listing.
 */
ProjectAssetSchema.pre('validate', function preSaveSync(next) {
  if (Array.isArray(this.changelogs) && this.changelogs.length > 0) {
    const sorted = [...this.changelogs].sort(
      (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
    );
    const latest = sorted[0];
    if (latest && (!this.currentVersion || this.currentVersion !== latest.version)) {
      this.currentVersion = latest.version;
    }
    if (latest && latest.fileUrl && this.downloadUrl !== latest.fileUrl) {
      this.downloadUrl = latest.fileUrl;
    }
  }
  next();
});

// --- Statics ----------------------------------------------------------------

/**
 * Helper: cari satu produk published berdasarkan slug, sudah include seluruh
 * changelogs diurutkan dari terbaru ke terlama. Dipakai oleh route
 * GET /api/assets/:slug -> ChangelogsPage.
 */
ProjectAssetSchema.statics.findPublishedBySlug = function findPublishedBySlug(slug) {
  return this.findOne({ slug, isPublished: true })
    .lean({ virtuals: true })
    .then((doc) => {
      if (!doc) return null;
      if (Array.isArray(doc.changelogs)) {
        doc.changelogs.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
      }
      return doc;
    });
};

/**
 * Helper: listing ringan untuk Landing / Marketplace. Hanya field yang
 * dibutuhkan card grid (tanpa seluruh body changelogs).
 */
ProjectAssetSchema.statics.listPublished = function listPublished(filter = {}) {
  return this.find({ isPublished: true, ...filter })
    .select('name slug category shortDescription currentVersion downloadUrl coverImageUrl platform tags updatedAt')
    .sort({ updatedAt: -1 })
    .lean({ virtuals: true });
};

module.exports = mongoose.model('ProjectAsset', ProjectAssetSchema);
module.exports.ChangelogSchema = ChangelogSchema;
