const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    language: { type: String, required: true, index: true },
    code: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

SnippetSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { language_override: 'textIndexLanguage' }
);

module.exports = mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);
