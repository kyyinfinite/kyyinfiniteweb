const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const { getMetrics, listOrders, listPanels } = require('../controllers/adminController');

const router = express.Router();

router.get('/metrics', adminAuthMiddleware, getMetrics);
router.get('/orders', adminAuthMiddleware, listOrders);
router.get('/panels', adminAuthMiddleware, listPanels);

module.exports = router;
