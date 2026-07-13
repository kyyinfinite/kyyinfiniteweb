const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const { createTicket, listMyTickets, getMyTicket, replyToMyTicket } = require('../controllers/ticketController');

const router = express.Router();

router.post('/', userAuthMiddleware, createTicket);
router.get('/', userAuthMiddleware, listMyTickets);
router.get('/:id', userAuthMiddleware, getMyTicket);
router.post('/:id/reply', userAuthMiddleware, replyToMyTicket);

module.exports = router;
