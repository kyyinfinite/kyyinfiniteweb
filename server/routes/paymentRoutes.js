const express = require('express');
const { createOrder, handleWebhook, getOrderStatus } = require('../controllers/paymentController');

const router = express.Router();

router.post('/order', createOrder);

// Midtrans's dashboard "Tes URL notifikasi" button pings this URL with a plain
// GET to check reachability before saving it — it doesn't send real transaction
// data. Real payment notifications always arrive as POST (handled below).
router.get('/webhook', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Webhook endpoint is reachable. Use POST for real notifications.' });
});
router.post('/webhook', handleWebhook);

router.get('/order/:orderId', getOrderStatus);

module.exports = router;
