const crypto = require('crypto');

const ALGO = 'aes-256-gcm';

function getDerivedKey() {
  const passphrase = process.env.API_KEY_ENC_SECRET;
  if (!passphrase) {
    throw new Error('API_KEY_ENC_SECRET env var is not set');
  }
  return crypto.scryptSync(passphrase, 'kyyinfinite-apikey-salt', 32);
}

function encryptApiKey(plaintext) {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decryptApiKey(payload) {
  const key = getDerivedKey();
  const [ivHex, authTagHex, dataHex] = payload.split(':');
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('Malformed encrypted API key payload');
  }
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encryptApiKey, decryptApiKey };
