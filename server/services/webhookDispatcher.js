const crypto = require('crypto');
const Webhook = require('../models/Webhook');

const DELIVERY_TIMEOUT_MS = 5000;

function sign(secret, body) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function deliver(webhook, event, data) {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  const signature = sign(webhook.secret, payload);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KyyInfinite-Event': event,
        'X-KyyInfinite-Signature': signature,
      },
      body: payload,
      signal: controller.signal,
    });
  } catch (error) {
    // Best-effort, no retries in v1 — a failed delivery just gets skipped.
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fires `event` at every active webhook subscribed to it. If `ownerUid` is
 * given, only that user's webhooks are notified (snippet/API-key events);
 * omit it for platform-wide events (e.g. incident.created) that go to
 * everyone who subscribed.
 */
async function dispatchEvent(event, data, { ownerUid = null } = {}) {
  try {
    const query = { isActive: true, events: event };
    if (ownerUid) query.ownerUid = ownerUid;

    const webhooks = await Webhook.find(query).lean();
    // Fire-and-forget — callers (request handlers, hot-path middleware)
    // should never await this and never have it affect their own response.
    webhooks.forEach((webhook) => {
      deliver(webhook, event, data).catch(() => {});
    });
  } catch (error) {
    // Never let a webhook lookup/dispatch failure break the caller.
  }
}

module.exports = { dispatchEvent };
