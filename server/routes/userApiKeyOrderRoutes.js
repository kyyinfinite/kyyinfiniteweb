const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const {
  createApiKeyOrder,
  getApiKeyOrderStatus,
  revealIssuedApiKey,
} = require('../controllers/apiKeyOrderController');

const router = express.Router();

router.post('/', userAuthMiddleware, createApiKeyOrder);
router.get('/:orderId', userAuthMiddleware, getApiKeyOrderStatus);
router.get('/:orderId/reveal', userAuthMiddleware, revealIssuedApiKey);

module.exports = router;
