const { getAuthAdmin } = require('../config/firebase');
const UserAccount = require('../models/UserAccount');

/**
 * Beda dari adminAuthMiddleware: middleware ini menerima siapa saja yang
 * berhasil login lewat Firebase (Google/GitHub/dll), bukan cuma email admin.
 * Dipakai buat endpoint self-serve API key milik user biasa.
 */
async function userAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing authentication token' });
    }

    let decodedToken;
    try {
      decodedToken = await getAuthAdmin().verifyIdToken(token, true);
    } catch (verifyError) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: verifyError.message });
    }

    if (!decodedToken.email) {
      return res.status(403).json({ message: 'Account has no email on file' });
    }

    const provider = decodedToken.firebase?.sign_in_provider || 'other';

    let userRecord = await UserAccount.findOne({ uid: decodedToken.uid });
    if (!userRecord) {
      userRecord = await UserAccount.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || '',
        photoURL: decodedToken.picture || '',
        provider,
      });
    } else if (userRecord.email !== decodedToken.email) {
      userRecord.email = decodedToken.email;
      await userRecord.save();
    }

    req.user = userRecord;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
  }
}

module.exports = { userAuthMiddleware };
