const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'minor' },
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
      index: true,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
