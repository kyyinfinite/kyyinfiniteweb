const crypto = require('crypto');
const { encryptApiKey } = require('./apiKeyCrypto');

const KEY_PREFIX = 'kyy_';
const KEY_ID_LENGTH = 10;

function generateApiKey() {
  const keyId = crypto.randomBytes(8).toString('base64url').slice(0, KEY_ID_LENGTH);
  const secret = crypto.randomBytes(24).toString('base64url');
  const plaintext = `${KEY_PREFIX}${keyId}_${secret}`;
  const hashedSecret = crypto.createHash('sha256').update(secret).digest('hex');
  const encryptedKey = encryptApiKey(plaintext);
  return { plaintext, keyId, hashedSecret, encryptedKey };
}

module.exports = { generateApiKey, KEY_PREFIX, KEY_ID_LENGTH };
