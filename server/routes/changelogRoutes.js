const express = require('express');
const Changelog = require('../models/Changelog');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const entries = await Changelog.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list changelog', error: error.message });
  }
});

router.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const entry = await Changelog.create(req.body);
    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create changelog entry', error: error.message });
  }
});

module.exports = router;
