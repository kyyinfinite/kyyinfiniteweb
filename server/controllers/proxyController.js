const { runProxy } = require('../services/proxyEngine');

function createProxyHandler(entry) {
  return async function proxyHandler(req, res) {
    try {
      const result = await runProxy(entry, req.query);

      if (result.binary) {
        res.set('Content-Type', result.contentType);
        return res.status(200).send(result.buffer);
      }

      return res.status(200).json(result.body);
    } catch (error) {
      if (error.name === 'AbortError') {
        return res.status(504).json({ status: false, creator: 'KyyInfinite', message: 'Upstream timeout' });
      }
      if (error.message === 'upstream_error') {
        return res.status(502).json({ status: false, creator: 'KyyInfinite', message: 'Service unavailable' });
      }
      return res.status(500).json({ status: false, creator: 'KyyInfinite', message: 'Internal error' });
    }
  };
}

module.exports = { createProxyHandler };
