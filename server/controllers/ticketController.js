const SupportTicket = require('../models/SupportTicket');

const CATEGORIES = ['billing', 'api', 'technical', 'other'];

function generateTicketNumber() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TKT-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

/** POST /api/user/tickets */
async function createTicket(req, res) {
  try {
    const { subject, category, message } = req.body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ message: 'subject is required' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }
    const finalCategory = CATEGORIES.includes(category) ? category : 'other';

    const ticket = await SupportTicket.create({
      ticketNumber: generateTicketNumber(),
      ownerUid: req.user.uid,
      ownerEmail: req.user.email,
      subject: subject.trim(),
      category: finalCategory,
      status: 'open',
      replies: [
        {
          authorType: 'user',
          authorLabel: req.user.username || req.user.email || 'You',
          message: message.trim(),
        },
      ],
    });

    return res.status(201).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
}

/** GET /api/user/tickets */
async function listMyTickets(req, res) {
  try {
    const tickets = await SupportTicket.find({ ownerUid: req.user.uid })
      .sort({ updatedAt: -1 })
      .select('ticketNumber subject category status createdAt updatedAt')
      .lean();
    return res.status(200).json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list tickets', error: error.message });
  }
}

/** GET /api/user/tickets/:id */
async function getMyTicket(req, res) {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, ownerUid: req.user.uid }).lean();
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load ticket', error: error.message });
  }
}

/** POST /api/user/tickets/:id/reply */
async function replyToMyTicket(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const ticket = await SupportTicket.findOne({ _id: req.params.id, ownerUid: req.user.uid });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.status === 'closed') {
      return res.status(400).json({ message: 'This ticket is closed. Please open a new one.' });
    }

    ticket.replies.push({
      authorType: 'user',
      authorLabel: req.user.username || req.user.email || 'You',
      message: message.trim(),
    });
    if (ticket.status === 'resolved') ticket.status = 'open'; // user balas lagi -> buka ulang
    await ticket.save();

    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reply to ticket', error: error.message });
  }
}

module.exports = { createTicket, listMyTickets, getMyTicket, replyToMyTicket, CATEGORIES };
