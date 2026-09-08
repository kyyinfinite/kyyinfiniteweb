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

/** PATCH /api/admin/api-keys/:id — admin only. Edits label/owner/scopes/tier/status; never touches the secret. */
async function updateApiKey(req, res) {
  try {
    const { label, ownerEmail, scopes, rateLimitTier, status, expiresAt } = req.body;
    const updates = {};

    if (label !== undefined) updates.label = label;
    if (ownerEmail !== undefined) updates.ownerEmail = ownerEmail;
    if (rateLimitTier !== undefined) updates.rateLimitTier = rateLimitTier;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;
    if (status !== undefined) {
      if (!['active', 'revoked'].includes(status)) {
        return res.status(400).json({ message: 'status must be "active" or "revoked"' });
      }
      updates.status = status;
    }
    if (scopes !== undefined) {
      if (!Array.isArray(scopes) || scopes.length === 0) {
        return res.status(400).json({ message: 'scopes must be a non-empty array' });
      }
      updates.scopes = scopes;
    }

    const key = await ApiKey.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-hashedSecret');
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    return res.status(200).json(key);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update API key', error: error.message });
  }
}

/** DELETE /api/admin/api-keys/:id — admin only. Permanently removes the key record. */
async function deleteApiKey(req, res) {
  try {
    const key = await ApiKey.findByIdAndDelete(req.params.id);
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    return res.status(200).json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete API key', error: error.message });
  }
}

module.exports = { createApiKey, listApiKeys, revokeApiKey, updateApiKey, deleteApiKey };
