const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const { listMyWebhooks, createWebhook, toggleWebhook, deleteWebhook } = require('../controllers/userWebhookController');

const router = express.Router();

router.get('/', userAuthMiddleware, listMyWebhooks);
router.post('/', userAuthMiddleware, createWebhook);
router.patch('/:id', userAuthMiddleware, toggleWebhook);
router.delete('/:id', userAuthMiddleware, deleteWebhook);

module.exports = router;
