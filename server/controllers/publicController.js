const UserAccount = require('../models/UserAccount');
const Snippet = require('../models/Snippet');

/** GET /api/public/contributors/:uid — public, non-sensitive profile + their approved community snippets. */
async function getContributor(req, res) {
  try {
    const account = await UserAccount.findOne({ uid: req.params.uid })
      .select('uid username displayName photoURL createdAt')
      .lean();

    if (!account) {
      return res.status(404).json({ message: 'Contributor not found' });
    }

    const snippets = await Snippet.find({
      ownerUid: req.params.uid,
      source: 'community',
      status: 'approved',
      isPublished: true,
    })
      .select('-code')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      uid: account.uid,
      username: account.username,
      displayName: account.displayName,
      photoURL: account.photoURL,
      joinedAt: account.createdAt,
      snippets,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load contributor', error: error.message });
  }
}

module.exports = { getContributor };
