const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const ApiKeyUsageEvent = require('../models/ApiKeyUsageEvent');
const { consumeRateLimit } = require('../utils/rateLimit');
const { KEY_PREFIX, KEY_ID_LENGTH } = require('../utils/apiKeyGenerator');

function parseApiKey(rawKey) {
  if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) return null;
  const rest = rawKey.slice(KEY_PREFIX.length);
  const keyId = rest.slice(0, KEY_ID_LENGTH);
  const separator = rest[KEY_ID_LENGTH];
  const secret = rest.slice(KEY_ID_LENGTH + 1);
  if (separator !== '_' || !keyId || !secret) return null;
  return { keyId, secret };
}

function hashSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Factory middleware — dipakai per-route dengan scope yang wajib dimiliki key.
 * requireApiKey('tools:search') => cuma key dengan scope 'tools:search' atau '*' yang lolos.
 */
function requireApiKey(scope) {
  return async function apiKeyAuthMiddleware(req, res, next) {
    try {
      const header = req.headers.authorization || '';
      const rawKey = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-api-key'];

      const parsed = parseApiKey(rawKey);
      if (!parsed) {
        return res.status(401).json({ status: false, creator: 'KyyInfinite', message: 'Missing or malformed API key' });
      }

      const apiKey = await ApiKey.findOne({ keyId: parsed.keyId, status: 'active' });
      if (!apiKey) {
        return res.status(401).json({ status: false, creator: 'KyyInfinite', message: 'Invalid API key' });
      }

      if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
        return res.status(401).json({ status: false, creator: 'KyyInfinite', message: 'API key expired' });
      }

      const providedHash = hashSecret(parsed.secret);
      const storedHash = Buffer.from(apiKey.hashedSecret, 'hex');
      const isValid =
        providedHash.length === storedHash.length && crypto.timingSafeEqual(providedHash, storedHash);

      if (!isValid) {
        return res.status(401).json({ status: false, creator: 'KyyInfinite', message: 'Invalid API key' });
      }

      const hasScope = apiKey.scopes.includes('*') || apiKey.scopes.includes(scope);
      if (!hasScope) {
        return res.status(403).json({ status: false, creator: 'KyyInfinite', message: 'API key not authorized for this endpoint' });
      }

      if (apiKey.requestLimit !== null && apiKey.requestLimit !== undefined && apiKey.requestCount >= apiKey.requestLimit) {
        return res.status(403).json({
          status: false,
          creator: 'KyyInfinite',
          message: `This API key has used all ${apiKey.requestLimit} lifetime requests. Purchase a new key to keep using this API.`,
        });
      }

      const limit = apiKey.rateLimitTier === 'pro' ? 120 : 30;
      const rateResult = await consumeRateLimit(`apikey:${apiKey.keyId}`, { limit, windowMs: 60_000 });
      res.set('X-RateLimit-Limit', String(rateResult.limit));
      res.set('X-RateLimit-Remaining', String(rateResult.remaining));
      res.set('X-RateLimit-Reset', rateResult.resetAt.toISOString());

      if (!rateResult.allowed) {
        return res.status(429).json({ status: false, creator: 'KyyInfinite', message: 'Rate limit exceeded' });
      }

      apiKey.requestCount += 1;
      apiKey.lastUsedAt = new Date();
      apiKey.lastUsedIp = clientIp(req);
      apiKey.save().catch(() => null); // fire-and-forget, jangan blocking response

      ApiKeyUsageEvent.create({ keyId: apiKey.keyId, ownerUid: apiKey.ownerUid || null, scope }).catch(() => null);

      req.apiKeyContext = { keyId: apiKey.keyId, scopes: apiKey.scopes };
      next();
    } catch (error) {
      return res.status(500).json({ status: false, creator: 'KyyInfinite', message: 'Internal error', error: error.message });
    }
  };
}

module.exports = { requireApiKey };
