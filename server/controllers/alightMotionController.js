const { sendActivationEmail, verifyActivationLink } = require('../services/jagomotionClient');
const ApiKeyUsageEvent = require('../models/ApiKeyUsageEvent');

// Every call here spends real quota on a paid upstream account, not just
// KyyInfinite's own request quota — this is a per-key safety net on top of
// whatever lifetime/rate limit the key already has, so one runaway script
// can't silently burn through your jagomotion balance.
const DAILY_CAP_PER_KEY = 10;

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function withinDailyCap(keyId, scope) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // requireApiKey already logged this call's own usage event before we get
  // here, so the count below includes it.
  const count = await ApiKeyUsageEvent.countDocuments({ keyId, scope, createdAt: { $gte: since } });
  return count <= DAILY_CAP_PER_KEY;
}

function handleUpstreamError(error, res) {
  if (error.message === 'jagomotion_not_configured') {
    return res.status(503).json({ status: false, creator: 'KyyInfinite', message: 'This feature is not configured yet.' });
  }
  if (error.name === 'AbortError') {
    return res.status(504).json({ status: false, creator: 'KyyInfinite', message: 'Upstream timeout' });
  }
  return res.status(500).json({ status: false, creator: 'KyyInfinite', message: 'Internal error' });
}

/** POST /api/v1/am/send — { email } — sends the customer an Alight Motion Pro verification link. */
async function sendActivation(req, res) {
  try {
    if (!(await withinDailyCap(req.apiKeyContext.keyId, 'am:premium'))) {
      return res.status(429).json({
        status: false,
        creator: 'KyyInfinite',
        message: `Daily limit (${DAILY_CAP_PER_KEY}) for this endpoint reached on this key. Try again tomorrow or use a different key.`,
      });
    }

    const { email } = req.body || {};
    if (!isValidEmail(email)) {
      return res.status(400).json({ status: false, creator: 'KyyInfinite', message: 'A valid email is required' });
    }

    const upstream = await sendActivationEmail(email);
    return res
      .status(upstream.status || 200)
      .json(upstream.data || { status: false, creator: 'KyyInfinite', message: 'No response from provider' });
  } catch (error) {
    return handleUpstreamError(error, res);
  }
}

/** POST /api/v1/am/verify — { email, link } — verifies the link and activates the customer's Pro account. */
async function verifyActivation(req, res) {
  try {
    if (!(await withinDailyCap(req.apiKeyContext.keyId, 'am:premium'))) {
      return res.status(429).json({
        status: false,
        creator: 'KyyInfinite',
        message: `Daily limit (${DAILY_CAP_PER_KEY}) for this endpoint reached on this key. Try again tomorrow or use a different key.`,
      });
    }

    const { email, link } = req.body || {};
    if (!isValidEmail(email) || !link || typeof link !== 'string') {
      return res.status(400).json({ status: false, creator: 'KyyInfinite', message: 'email and link are required' });
    }

    const upstream = await verifyActivationLink(email, link);
    return res
      .status(upstream.status || 200)
      .json(upstream.data || { status: false, creator: 'KyyInfinite', message: 'No response from provider' });
  } catch (error) {
    return handleUpstreamError(error, res);
  }
}

module.exports = { sendActivation, verifyActivation, DAILY_CAP_PER_KEY };
