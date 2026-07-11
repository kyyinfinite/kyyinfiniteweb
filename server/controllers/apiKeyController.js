const ApiKey = require('../models/ApiKey');
const { generateApiKey } = require('../utils/apiKeyGenerator');

/** POST /api/admin/api-keys — admin only. Plaintext key cuma dibalikin sekali di sini. */
async function createApiKey(req, res) {
  try {
    const { label, ownerEmail, scopes, rateLimitTier, expiresAt } = req.body;

    if (!label || !Array.isArray(scopes) || scopes.length === 0) {
      return res.status(400).json({ message: 'label and at least one scope are required' });
    }

    const { plaintext, keyId, hashedSecret } = generateApiKey();

    await ApiKey.create({
      keyId,
      hashedSecret,
      label,
      ownerEmail,
      scopes,
      rateLimitTier: rateLimitTier || 'default',
      expiresAt: expiresAt || null,
    });

    return res.status(201).json({ apiKey: plaintext, keyId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create API key', error: error.message });
  }
}

/** GET /api/admin/api-keys — admin only. Tidak pernah balikin hashedSecret. */
async function listApiKeys(req, res) {
  try {
    const keys = await ApiKey.find({}).sort({ createdAt: -1 }).select('-hashedSecret').lean();
    return res.status(200).json(keys);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list API keys', error: error.message });
  }
}

/** PATCH /api/admin/api-keys/:id/revoke — admin only */
async function revokeApiKey(req, res) {
  try {
    const key = await ApiKey.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true }).select(
      '-hashedSecret'
    );
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    return res.status(200).json(key);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke API key', error: error.message });
  }
}

module.exports = { createApiKey, listApiKeys, revokeApiKey };
