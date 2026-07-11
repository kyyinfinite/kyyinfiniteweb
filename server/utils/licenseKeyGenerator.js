const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I biar nggak ambigu dibaca manusia

function randomSegment(length) {
  const bytes = crypto.randomBytes(length);
  let segment = '';
  for (let i = 0; i < length; i += 1) {
    segment += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return segment;
}

function generateLicenseKey() {
  const segments = [randomSegment(4), randomSegment(4), randomSegment(4), randomSegment(4)];
  return `KYY-${segments.join('-')}`;
}

module.exports = { generateLicenseKey };
