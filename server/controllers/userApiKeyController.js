const ApiKey = require('../models/ApiKey');
const { generateApiKey } = require('../utils/apiKeyGenerator');

const MAX_KEYS_PER_USER = 2;
const ALLOWED_USER_SCOPES = [
  'tools:search',
  'tools:maker',
  'tools:downloader',
  'tools:utility',
  'tools:news',
  'tools:info',
  'tools:primbon',
];
const USER_RATE_LIMIT_TIER = 'default';
const FREE_PLAN_REQUEST_LIMIT = 40;

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

    const totalEverCreated = await ApiKey.countDocuments({ ownerUid: req.user.uid, ownerType: 'user' });
    if (totalEverCreated >= MAX_KEYS_PER_USER) {
      return res.status(429).json({
        message: `You've already created ${totalEverCreated} API key(s), which is the free limit of ${MAX_KEYS_PER_USER}. This limit counts every key you've ever created, including revoked ones — revoking a key does not free up a new slot. Purchase a premium key from your profile page to keep going.`,
        limitReached: true,
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
      plan: 'free',
      requestLimit: FREE_PLAN_REQUEST_LIMIT,
    });

    return res.status(201).json({ apiKey: plaintext, keyId, requestLimit: FREE_PLAN_REQUEST_LIMIT });
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
    return res.status(200).json({
      keys,
      limit: MAX_KEYS_PER_USER,
      allowedScopes: ALLOWED_USER_SCOPES,
      freePlanRequestLimit: FREE_PLAN_REQUEST_LIMIT,
    });
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
