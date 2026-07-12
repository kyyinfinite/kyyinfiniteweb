const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const { requestApiKey, listMyApiKeys, revokeMyApiKey } = require('../controllers/userApiKeyController');

const router = express.Router();

router.post('/', userAuthMiddleware, requestApiKey);
router.get('/', userAuthMiddleware, listMyApiKeys);
router.patch('/:id/revoke', userAuthMiddleware, revokeMyApiKey);

module.exports = router;
