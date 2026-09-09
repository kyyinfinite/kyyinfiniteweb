const Incident = require('../models/Incident');

async function listIncidents(req, res) {
  try {
    const incidents = await Incident.find({}).sort({ createdAt: -1 }).limit(30).lean();
    return res.status(200).json(incidents);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load incidents', error: error.message });
  }
}

async function createIncident(req, res) {
  try {
    const { title, description = '', severity = 'minor', status = 'investigating' } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }
    const incident = await Incident.create({ title: title.trim(), description, severity, status });
    return res.status(201).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create incident', error: error.message });
  }
}

async function updateIncident(req, res) {
  try {
    const updates = { ...req.body };
    if (updates.status === 'resolved' && !updates.resolvedAt) {
      updates.resolvedAt = new Date();
    }
    const incident = await Incident.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update incident', error: error.message });
  }
}

async function deleteIncident(req, res) {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    return res.status(200).json({ message: 'Incident deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete incident', error: error.message });
  }
}

module.exports = { listIncidents, createIncident, updateIncident, deleteIncident };
