/**
 * assetController.js
 * ---------------------------------------------------------------------------
 * Express controller untuk model ProjectAsset. Dipakai oleh route
 *   GET /api/assets
 *   GET /api/assets/latest/one
 *   GET /api/assets/:slug
 *
 * CARA INTEGRASI:
 *   Tambahkan ini di server/index.js (atau server/app.js) Anda:
 *
 *     const express = require('express');
 *     const { router: assetRouter } = require('./controllers/assetController');
 *     app.use('/api/assets', assetRouter);
 *
 *   Pastikan `connectDB()` di server/config/db.js sudah dipanggil saat
 *   bootstrap sebelum route ini di-hit.
 */

const express = require('express');
const ProjectAsset = require('../models/ProjectAsset.js');

const router = express.Router();

/**
 * GET /api/assets
 * Listing ringan untuk Marketplace & Landing grid.
 * Query opsional: ?category=whatsapp-bot|snippet|plugin
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const list = await ProjectAsset.listPublished(filter);
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('[assetController] list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list assets' });
  }
});

/**
 * GET /api/assets/latest/one
 * Ambil satu asset dengan updatedAt terbaru. Dipakai oleh route
 * /changelogs/latest di React Router.
 */
router.get('/latest/one', async (_req, res) => {
  try {
    const doc = await ProjectAsset.findOne({ isPublished: true })
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'No published asset found' });
    }

    // Sort changelogs desc agar konsisten dengan findPublishedBySlug
    if (Array.isArray(doc.changelogs)) {
      doc.changelogs.sort(
        (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
      );
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('[assetController] latest error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load latest asset' });
  }
});

/**
 * GET /api/assets/:slug
 * Detail produk berdasarkan slug, sudah include seluruh changelogs.
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await ProjectAsset.findPublishedBySlug(slug);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('[assetController] bySlug error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load asset' });
  }
});

module.exports = { router };
