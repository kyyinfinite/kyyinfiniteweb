const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    version: { type: String, required: true },
    linkUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Changelog || mongoose.model('Changelog', ChangelogSchema);
