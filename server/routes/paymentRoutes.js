const express = require('express');
const { createOrder, handleWebhook, getOrderStatus } = require('../controllers/paymentController');

const router = express.Router();

router.post('/order', createOrder);
router.post('/webhook', handleWebhook);
router.get('/order/:orderId', getOrderStatus);

module.exports = router;
