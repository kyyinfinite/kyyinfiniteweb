const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const { createApiKey, listApiKeys, revokeApiKey } = require('../controllers/apiKeyController');

const router = express.Router();

router.post('/', adminAuthMiddleware, createApiKey);
router.get('/', adminAuthMiddleware, listApiKeys);
router.patch('/:id/revoke', adminAuthMiddleware, revokeApiKey);

module.exports = router;
