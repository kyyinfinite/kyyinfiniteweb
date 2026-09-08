const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    language: { type: String, required: true, index: true },
    code: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: true, index: true },

    // Community submissions (see userSnippetController.js) vs. admin-authored
    // ones. Community snippets start life as 'pending' and only appear in the
    // public list once an admin flips status to 'approved' — code other
    // people will copy/paste shouldn't go live unreviewed.
    source: { type: String, enum: ['official', 'community'], default: 'official', index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    ownerUid: { type: String, default: null, index: true },
    ownerLabel: { type: String, default: null },
  },
  { timestamps: true }
);

SnippetSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { language_override: 'textIndexLanguage' }
);

module.exports = mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);
