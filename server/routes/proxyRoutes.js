const express = require('express');
const apiRegistry = require('../config/apiRegistry');
const { CUSTOM_ENDPOINTS_META } = require('../config/customEndpointsMeta');
const { createProxyHandler } = require('../controllers/proxyController');
const { requireApiKey } = require('../middlewares/apiKeyAuthMiddleware');

const router = express.Router();

router.get('/_meta/endpoints', (req, res) => {
  const registryEndpoints = apiRegistry.map((entry) => ({
    path: entry.path,
    method: entry.upstream.method,
    title: entry.title || entry.path,
    description: entry.description || '',
    responseType: entry.responseType,
    scope: entry.scope,
    cached: Boolean(entry.cache),
    params: entry.paramsInfo || Object.keys(entry.paramsMap || {}).map((name) => ({ name, required: true, description: '' })),
  }));
  const endpoints = [...registryEndpoints, ...CUSTOM_ENDPOINTS_META];
  return res.status(200).json({ endpoints });
});

apiRegistry.forEach((entry) => {
  router.get(entry.path, requireApiKey(entry.scope), createProxyHandler(entry));
});

module.exports = router;
