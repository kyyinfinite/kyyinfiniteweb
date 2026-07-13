const mongoose = require('mongoose');

const TicketReplySchema = new mongoose.Schema(
  {
    authorType: { type: String, enum: ['user', 'admin'], required: true },
    authorLabel: { type: String, trim: true }, // username/email atau "Support" buat admin
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    ownerUid: { type: String, required: true, index: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['billing', 'api', 'technical', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    replies: { type: [TicketReplySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
