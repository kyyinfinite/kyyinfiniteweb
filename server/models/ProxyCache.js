const mongoose = require('mongoose');

const ProxyCacheSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  body: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
});

ProxyCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.ProxyCache || mongoose.model('ProxyCache', ProxyCacheSchema);
