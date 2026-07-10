const express = require('express');
const Snippet = require('../models/Snippet');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { language, search } = req.query;
    const query = { isPublished: true };
    if (language) query.language = language;
    if (search) query.$text = { $search: search };

    const snippets = await Snippet.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json(snippets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list snippets', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).lean();
    if (!snippet || !snippet.isPublished) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    return res.status(200).json(snippet);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load snippet', error: error.message });
  }
});

router.get('/admin/all', adminAuthMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(snippets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list snippets', error: error.message });
  }
});

router.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.create(req.body);
    return res.status(201).json(snippet);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create snippet', error: error.message });
  }
});

router.put('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    return res.status(200).json(snippet);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update snippet', error: error.message });
  }
});

router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    return res.status(200).json({ message: 'Snippet deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete snippet', error: error.message });
  }
});

module.exports = router;
