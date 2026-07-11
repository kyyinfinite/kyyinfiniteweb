import os from 'node:os';
import crypto from 'node:crypto';

const LICENSE_API = 'https://kyyinfinite.my.id/api/v1/license/verify';
const ASSET_SLUG = 'ganti-sesuai-slug-produk-ini';
const LICENSE_KEY = process.env.KYY_LICENSE_KEY || 'PASTE_LICENSE_KEY_DISINI';

function getFingerprint() {
  const raw = `${os.hostname()}-${os.platform()}-${os.arch()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function verifyLicense() {
  try {
    const response = await fetch(LICENSE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: LICENSE_KEY,
        assetSlug: ASSET_SLUG,
        fingerprint: getFingerprint(),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.valid) {
      console.error(`[kyyinfinite] License check failed: ${data.reason || 'unknown'}`);
      console.error('Get a valid license at https://kyyinfinite.my.id');
      process.exit(1);
    }
  } catch (error) {
    console.error('[kyyinfinite] Could not reach license server:', error.message);
    process.exit(1);
  }
}

await verifyLicense();

// ==== kode script premium kamu mulai dari sini ====
