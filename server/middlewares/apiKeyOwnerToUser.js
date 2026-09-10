const UserAccount = require('../models/UserAccount');

/**
 * Runs after requireApiKey(...). Lets the same controllers that back the
 * logged-in-user routes (e.g. userSnippetController) be reused for
 * bot/API-key access — the key just needs to be linked to an account
 * (ownerUid), same as any self-serve key already is.
 */
async function apiKeyOwnerToUser(req, res, next) {
  try {
    const ownerUid = req.apiKeyContext?.ownerUid;
    if (!ownerUid) {
      return res.status(400).json({
        status: false,
        creator: 'KyyInfinite',
        message: 'This API key is not linked to a user account, so it cannot act on your behalf.',
      });
    }

    const account = await UserAccount.findOne({ uid: ownerUid }).lean();
    req.user = {
      uid: ownerUid,
      displayName: account?.displayName || null,
      username: account?.username || null,
      email: account?.email || null,
    };
    next();
  } catch (error) {
    return res.status(500).json({ status: false, creator: 'KyyInfinite', message: 'Internal error', error: error.message });
  }
}

module.exports = { apiKeyOwnerToUser };
