const LicenseKey = require('../models/LicenseKey');
const ProjectAsset = require('../models/ProjectAsset');
const { consumeRateLimit } = require('../utils/rateLimit');

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * POST /api/v1/license/verify
 * Body: { licenseKey, assetSlug, fingerprint }
 * Endpoint publik — dipanggil dari script premium yang didownload user, bukan dari browser.
 */
async function verifyLicense(req, res) {
  try {
    const { licenseKey, assetSlug, fingerprint } = req.body;

    if (!licenseKey || !assetSlug || !fingerprint) {
      return res.status(400).json({ valid: false, reason: 'missing_fields' });
    }

    const ip = clientIp(req);
    const ipLimit = await consumeRateLimit(`license-verify:ip:${ip}`, { limit: 60, windowMs: 60_000 });
    res.set('X-RateLimit-Limit', String(ipLimit.limit));
    res.set('X-RateLimit-Remaining', String(ipLimit.remaining));
    res.set('X-RateLimit-Reset', ipLimit.resetAt.toISOString());

    if (!ipLimit.allowed) {
      return res.status(429).json({ valid: false, reason: 'rate_limited' });
    }

    const license = await LicenseKey.findOne({ key: licenseKey.trim().toUpperCase() }).populate('asset');

    if (!license) {
      return res.status(404).json({ valid: false, reason: 'not_found' });
    }

    if (license.asset.slug !== assetSlug) {
      return res.status(403).json({ valid: false, reason: 'wrong_asset' });
    }

    if (license.status === 'revoked') {
      return res.status(403).json({ valid: false, reason: 'revoked' });
    }

    if (license.isExpired()) {
      if (license.status !== 'expired') {
        license.status = 'expired';
        await license.save();
      }
      return res.status(403).json({ valid: false, reason: 'expired' });
    }

    const existingActivation = license.activations.find((activation) => activation.fingerprint === fingerprint);

    if (existingActivation) {
      existingActivation.lastSeenAt = new Date();
      existingActivation.ip = ip;
    } else {
      if (license.activations.length >= license.maxActivations) {
        return res.status(403).json({ valid: false, reason: 'device_limit' });
      }
      license.activations.push({ fingerprint, ip, firstSeenAt: new Date(), lastSeenAt: new Date() });
    }

    await license.save();

    return res.status(200).json({
      valid: true,
      expiresAt: license.expiresAt,
      remainingActivations: license.maxActivations - license.activations.length,
    });
  } catch (error) {
    return res.status(500).json({ valid: false, reason: 'server_error', error: error.message });
  }
}

/** GET /api/admin/license-keys — admin only */
async function listLicenseKeysAdmin(req, res) {
  try {
    const { assetId, status } = req.query;
    const filter = {};
    if (assetId) filter.asset = assetId;
    if (status) filter.status = status;

    const licenses = await LicenseKey.find(filter)
      .populate('asset', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(licenses);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list license keys', error: error.message });
  }
}

/** PATCH /api/admin/license-keys/:id/revoke — admin only */
async function revokeLicenseKey(req, res) {
  try {
    const license = await LicenseKey.findByIdAndUpdate(
      req.params.id,
      { status: 'revoked' },
      { new: true }
    );
    if (!license) {
      return res.status(404).json({ message: 'License key not found' });
    }
    return res.status(200).json(license);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke license key', error: error.message });
  }
}

/** POST /api/admin/license-keys/:id/reset-activations — admin only */
async function resetActivations(req, res) {
  try {
    const license = await LicenseKey.findByIdAndUpdate(
      req.params.id,
      { activations: [] },
      { new: true }
    );
    if (!license) {
      return res.status(404).json({ message: 'License key not found' });
    }
    return res.status(200).json(license);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset activations', error: error.message });
  }
}

module.exports = { verifyLicense, listLicenseKeysAdmin, revokeLicenseKey, resetActivations };
