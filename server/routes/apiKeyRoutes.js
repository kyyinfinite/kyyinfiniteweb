const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  updateApiKey,
  deleteApiKey,
} = require('../controllers/apiKeyController');

const router = express.Router();

router.post('/', adminAuthMiddleware, createApiKey);
router.get('/', adminAuthMiddleware, listApiKeys);
router.patch('/:id/revoke', adminAuthMiddleware, revokeApiKey);
router.patch('/:id', adminAuthMiddleware, updateApiKey);
router.delete('/:id', adminAuthMiddleware, deleteApiKey);

module.exports = router;
