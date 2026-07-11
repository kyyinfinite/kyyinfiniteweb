const crypto = require('crypto');
const transformers = require('../transformers');
const ProxyCache = require('../models/ProxyCache');

const UPSTREAM_TIMEOUT_MS = 9000;

function buildUpstreamUrl(entry, query) {
  const url = new URL(entry.upstream.url);
  const paramsMap = entry.paramsMap || {};
  Object.entries(paramsMap).forEach(([publicParam, upstreamParam]) => {
    if (query[publicParam] !== undefined) {
      url.searchParams.set(upstreamParam, query[publicParam]);
    }
  });
  return url.toString();
}

function cacheKeyFor(entry, query) {
  const raw = `${entry.path}:${JSON.stringify(query)}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function fetchUpstream(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { method, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Menjalankan satu entry apiRegistry: fetch ke upstream, transform (kalau JSON),
 * atau stream apa adanya (kalau binary). Tidak pernah membocorkan upstream.url
 * ke caller — error diseragamkan di proxyController.
 */
async function runProxy(entry, query) {
  const upstreamUrl = buildUpstreamUrl(entry, query);

  if (entry.responseType === 'binary') {
    const response = await fetchUpstream(upstreamUrl, entry.upstream.method);
    if (!response.ok) {
      const error = new Error('upstream_error');
      error.upstreamStatus = response.status;
      throw error;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return { binary: true, contentType: response.headers.get('content-type') || 'application/octet-stream', buffer };
  }

  const cacheKey = entry.cache ? cacheKeyFor(entry, query) : null;

  if (cacheKey) {
    const cached = await ProxyCache.findOne({ cacheKey }).lean();
    if (cached) {
      return { binary: false, body: cached.body };
    }
  }

  const response = await fetchUpstream(upstreamUrl, entry.upstream.method);
  if (!response.ok) {
    const error = new Error('upstream_error');
    error.upstreamStatus = response.status;
    throw error;
  }

  const upstreamJson = await response.json();
  const transform = transformers[entry.transformer] || transformers.default;
  const body = transform(upstreamJson);

  if (cacheKey) {
    const expiresAt = new Date(Date.now() + entry.cache.ttlSeconds * 1000);
    await ProxyCache.findOneAndUpdate(
      { cacheKey },
      { cacheKey, body, expiresAt },
      { upsert: true }
    );
  }

  return { binary: false, body };
}

module.exports = { runProxy };
