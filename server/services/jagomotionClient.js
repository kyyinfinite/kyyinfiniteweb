const JAGOMOTION_BASE = 'https://jagomotion.biz.id/api/v1/am';
const REQUEST_TIMEOUT_MS = 15000;

async function callJagomotion(path, body) {
  const apiKey = process.env.JAGOMOTION_API_KEY;
  if (!apiKey) {
    throw new Error('jagomotion_not_configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${JAGOMOTION_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  sendActivationEmail: (email) => callJagomotion('/send', { email }),
  verifyActivationLink: (email, link) => callJagomotion('/verify', { email, link }),
};
