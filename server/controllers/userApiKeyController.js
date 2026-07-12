const ApiKey = require('../models/ApiKey');
const { generateApiKey } = require('../utils/apiKeyGenerator');

const MAX_KEYS_PER_USER = 2;
const ALLOWED_USER_SCOPES = ['tools:search', 'tools:maker', 'tools:downloader'];
const USER_RATE_LIMIT_TIER = 'default';

/** POST /api/user/api-keys — bikin API key milik user sendiri, dibatasi jumlah dan scope. */
async function requestApiKey(req, res) {
  try {
    const { label, scopes } = req.body;

    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ message: 'label is required' });
    }

    const requestedScopes = Array.isArray(scopes) ? scopes.filter((s) => ALLOWED_USER_SCOPES.includes(s)) : [];
    if (requestedScopes.length === 0) {
      return res.status(400).json({ message: `Select at least one scope from: ${ALLOWED_USER_SCOPES.join(', ')}` });
    }

    const activeCount = await ApiKey.countDocuments({ ownerUid: req.user.uid, status: 'active' });
    if (activeCount >= MAX_KEYS_PER_USER) {
      return res.status(429).json({
        message: `You already have ${activeCount} active API key(s). Revoke one before creating another (limit: ${MAX_KEYS_PER_USER}).`,
      });
    }

    const { plaintext, keyId, hashedSecret } = generateApiKey();

    await ApiKey.create({
      keyId,
      hashedSecret,
      label: label.trim(),
      ownerEmail: req.user.email,
      ownerType: 'user',
      ownerUid: req.user.uid,
      scopes: requestedScopes,
      rateLimitTier: USER_RATE_LIMIT_TIER,
    });

    return res.status(201).json({ apiKey: plaintext, keyId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create API key', error: error.message });
  }
}

/** GET /api/user/api-keys — daftar key milik user yang sedang login saja. */
async function listMyApiKeys(req, res) {
  try {
    const keys = await ApiKey.find({ ownerUid: req.user.uid })
      .sort({ createdAt: -1 })
      .select('-hashedSecret')
      .lean();
    return res.status(200).json({ keys, limit: MAX_KEYS_PER_USER, allowedScopes: ALLOWED_USER_SCOPES });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list API keys', error: error.message });
  }
}

/** PATCH /api/user/api-keys/:id/revoke — user cuma boleh revoke key miliknya sendiri. */
async function revokeMyApiKey(req, res) {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, ownerUid: req.user.uid });
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    key.status = 'revoked';
    await key.save();
    return res.status(200).json(key);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke API key', error: error.message });
  }
}

module.exports = { requestApiKey, listMyApiKeys, revokeMyApiKey, MAX_KEYS_PER_USER, ALLOWED_USER_SCOPES };
