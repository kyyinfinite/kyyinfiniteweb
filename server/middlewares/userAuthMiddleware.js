const { getAuthAdmin } = require('../config/firebase');
const UserAccount = require('../models/UserAccount');

/**
 * Ambil 2 huruf pertama dari bagian sebelum '@' di email (atau dari nama),
 * dipakai sebagai handle singkat pas pertama kali akun dibuat.
 * Contoh: "kyyinfinite@gmail.com" -> "ky"
 */
function deriveUsername(decodedToken) {
  const source = decodedToken.email?.split('@')[0] || decodedToken.name || decodedToken.uid;
  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toLowerCase() || 'us';
}

/**
 * Beda dari adminAuthMiddleware: middleware ini menerima siapa saja yang
 * berhasil login lewat Firebase (Google/GitHub/Email/Phone), bukan cuma
 * email admin. Dipakai buat endpoint self-serve API key & profile user biasa.
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

    if (!decodedToken.email && !decodedToken.phone_number) {
      return res.status(403).json({ message: 'Account has no email or phone number on file' });
    }

    const provider = decodedToken.firebase?.sign_in_provider || 'other';

    let userRecord = await UserAccount.findOne({ uid: decodedToken.uid });
    if (!userRecord) {
      userRecord = await UserAccount.create({
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        phoneNumber: decodedToken.phone_number || null,
        username: deriveUsername(decodedToken),
        displayName: decodedToken.name || '',
        photoURL: decodedToken.picture || '',
        provider,
      });
    } else {
      let dirty = false;
      if (decodedToken.email && userRecord.email !== decodedToken.email) {
        userRecord.email = decodedToken.email;
        dirty = true;
      }
      if (decodedToken.phone_number && userRecord.phoneNumber !== decodedToken.phone_number) {
        userRecord.phoneNumber = decodedToken.phone_number;
        dirty = true;
      }
      if (dirty) await userRecord.save();
    }

    req.user = userRecord;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
  }
}

module.exports = { userAuthMiddleware };
