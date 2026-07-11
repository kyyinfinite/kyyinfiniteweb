const express = require('express');
const multer = require('multer');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const {
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = express.Router();

router.get('/', listAssets);
router.get('/slug/:slug', getAssetBySlug);
router.post('/:id/download', downloadAsset);
router.post('/:id/changelog/:changelogId/download', downloadChangelogVersion);

router.post('/', adminAuthMiddleware, upload.single('file'), createAsset);
router.get('/admin/all', adminAuthMiddleware, listAssetsAdmin);
router.post('/:id/changelog', adminAuthMiddleware, upload.single('file'), addChangelogEntry);
router.get('/:id', getAssetById);
router.put('/:id', adminAuthMiddleware, updateAsset);
router.delete('/:id', adminAuthMiddleware, deleteAsset);

module.exports = router;
