const ApiKey = require('../models/ApiKey');
const ApiKeyUsageEvent = require('../models/ApiKeyUsageEvent');

function buildLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

/** GET /api/user/profile — data ringkas buat header halaman profil. */
async function getProfile(req, res) {
  return res.status(200).json({
    uid: req.user.uid,
    username: req.user.username,
    displayName: req.user.displayName,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    photoURL: req.user.photoURL,
    provider: req.user.provider,
    joinedAt: req.user.createdAt,
  });
}

/** GET /api/user/usage — timeseries + ringkasan pemakaian API key milik user. */
async function getUsageStats(req, res) {
  try {
    const rangeDays = 14;
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (rangeDays - 1));

    const [dailyAgg, keys] = await Promise.all([
      ApiKeyUsageEvent.aggregate([
        { $match: { ownerUid: req.user.uid, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      ApiKey.find({ ownerUid: req.user.uid }).select('-hashedSecret').lean(),
    ]);

    const dayMap = new Map(dailyAgg.map((row) => [row._id, row.count]));
    const series = buildLastNDays(rangeDays).map((date) => ({ date, requests: dayMap.get(date) || 0 }));

    const activeKeys = keys.filter((k) => k.status === 'active').length;
    const totalRequests = keys.reduce((sum, k) => sum + (k.requestCount || 0), 0);
    const requestsLast14Days = series.reduce((sum, point) => sum + point.requests, 0);

    return res.status(200).json({
      series,
      totalRequests,
      requestsLast14Days,
      activeKeys,
      totalKeys: keys.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load usage stats', error: error.message });
  }
}

module.exports = { getProfile, getUsageStats };
