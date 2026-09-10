const Webhook = require('../models/Webhook');

const MAX_WEBHOOKS_PER_USER = 5;

async function listMyWebhooks(req, res) {
  try {
    const webhooks = await Webhook.find({ ownerUid: req.user.uid }).sort({ createdAt: -1 }).lean();
    // Never return the signing secret in a list response.
    const sanitized = webhooks.map(({ secret, ...rest }) => rest);
    return res.status(200).json({ webhooks: sanitized, limit: MAX_WEBHOOKS_PER_USER });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list webhooks', error: error.message });
  }
}

async function createWebhook(req, res) {
  try {
    const { url, events = [] } = req.body || {};

    if (!url || typeof url !== 'string' || !/^https:\/\//.test(url)) {
      return res.status(400).json({ message: 'url must be a valid https:// URL' });
    }
    const allowedEvents = Webhook.WEBHOOK_EVENTS;
    if (!Array.isArray(events) || events.length === 0 || events.some((event) => !allowedEvents.includes(event))) {
      return res.status(400).json({ message: `events must be a non-empty array from: ${allowedEvents.join(', ')}` });
    }

    const existingCount = await Webhook.countDocuments({ ownerUid: req.user.uid });
    if (existingCount >= MAX_WEBHOOKS_PER_USER) {
      return res.status(429).json({ message: `You've reached the limit of ${MAX_WEBHOOKS_PER_USER} webhooks.` });
    }

    const webhook = await Webhook.create({
      ownerUid: req.user.uid,
      url,
      events,
      secret: Webhook.generateSecret(),
    });

    // The secret is only ever shown once, right after creation — same
    // one-time-reveal pattern as a freshly created API key.
    return res.status(201).json({ webhook });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create webhook', error: error.message });
  }
}

async function toggleWebhook(req, res) {
  try {
    const webhook = await Webhook.findOneAndUpdate(
      { _id: req.params.id, ownerUid: req.user.uid },
      { isActive: req.body?.isActive !== false },
      { new: true }
    );
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    const { secret, ...rest } = webhook.toObject();
    return res.status(200).json({ webhook: rest });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update webhook', error: error.message });
  }
}

async function deleteWebhook(req, res) {
  try {
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, ownerUid: req.user.uid });
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    return res.status(200).json({ message: 'Webhook deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete webhook', error: error.message });
  }
}

module.exports = { listMyWebhooks, createWebhook, toggleWebhook, deleteWebhook, MAX_WEBHOOKS_PER_USER };
