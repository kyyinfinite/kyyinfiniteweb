const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const {
  generateSignedUploadUrl,
  createAsset,
  listAssets,
  getAssetById,
  listAssetsAdmin,
  updateAsset,
  deleteAsset,
  downloadAsset,
} = require('../controllers/storageController');

const router = express.Router();

router.get('/', listAssets);
router.post('/:id/download', downloadAsset);

router.post('/upload-url', adminAuthMiddleware, generateSignedUploadUrl);
router.post('/', adminAuthMiddleware, createAsset);
router.get('/admin/all', adminAuthMiddleware, listAssetsAdmin);
router.get('/:id', getAssetById);
router.put('/:id', adminAuthMiddleware, updateAsset);
router.delete('/:id', adminAuthMiddleware, deleteAsset);

module.exports = router;
