const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const { getMetrics, getMetricsTimeseries, listOrders, listPanels } = require('../controllers/adminController');
const { listAllTickets, getTicket, replyToTicket, updateTicketStatus } = require('../controllers/adminTicketController');

const router = express.Router();

router.get('/metrics', adminAuthMiddleware, getMetrics);
router.get('/metrics/timeseries', adminAuthMiddleware, getMetricsTimeseries);
router.get('/orders', adminAuthMiddleware, listOrders);
router.get('/panels', adminAuthMiddleware, listPanels);

router.get('/tickets', adminAuthMiddleware, listAllTickets);
router.get('/tickets/:id', adminAuthMiddleware, getTicket);
router.post('/tickets/:id/reply', adminAuthMiddleware, replyToTicket);
router.patch('/tickets/:id/status', adminAuthMiddleware, updateTicketStatus);

module.exports = router;
