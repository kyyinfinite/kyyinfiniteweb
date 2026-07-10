const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const {
  generateSignedUploadUrl,
  createAsset,
  listAssets,
  getAssetById,
  getAssetBySlug,
  listAssetsAdmin,
  updateAsset,
  deleteAsset,
  downloadAsset,
  addChangelogEntry,
  downloadChangelogVersion,
} = require('../controllers/storageController');

const router = express.Router();

router.get('/', listAssets);
router.get('/slug/:slug', getAssetBySlug);
router.post('/:id/download', downloadAsset);
router.post('/:id/changelog/:changelogId/download', downloadChangelogVersion);

router.post('/upload-url', adminAuthMiddleware, generateSignedUploadUrl);
router.post('/', adminAuthMiddleware, createAsset);
router.get('/admin/all', adminAuthMiddleware, listAssetsAdmin);
router.post('/:id/changelog', adminAuthMiddleware, addChangelogEntry);
router.get('/:id', getAssetById);
router.put('/:id', adminAuthMiddleware, updateAsset);
router.delete('/:id', adminAuthMiddleware, deleteAsset);

module.exports = router;
