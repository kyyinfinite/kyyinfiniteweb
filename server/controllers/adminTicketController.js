const SupportTicket = require('../models/SupportTicket');

/** GET /api/admin/tickets?status=open */
async function listAllTickets(req, res) {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const tickets = await SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .select('ticketNumber ownerEmail subject category status createdAt updatedAt')
      .lean();
    return res.status(200).json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list tickets', error: error.message });
  }
}

/** GET /api/admin/tickets/:id */
async function getTicket(req, res) {
  try {
    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load ticket', error: error.message });
  }
}

/** POST /api/admin/tickets/:id/reply */
async function replyToTicket(req, res) {
  try {
    const { message, status } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.replies.push({ authorType: 'admin', authorLabel: 'Support', message: message.trim() });
    ticket.status = ['open', 'in_progress', 'resolved', 'closed'].includes(status) ? status : 'in_progress';
    await ticket.save();

    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reply to ticket', error: error.message });
  }
}

/** PATCH /api/admin/tickets/:id/status */
async function updateTicketStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
}

module.exports = { listAllTickets, getTicket, replyToTicket, updateTicketStatus };
