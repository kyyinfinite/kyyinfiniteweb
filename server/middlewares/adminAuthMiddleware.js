const { getAuthAdmin } = require('../config/firebase');
const Admin = require('../models/Admin');

const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_ALLOWED_EMAIL;

async function adminAuthMiddleware(req, res, next) {
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
      console.error('Firebase token verification failed:', verifyError.message);
      return res.status(401).json({
        message: 'Invalid or expired authentication token',
        error: verifyError.message,
        hint: 'Usually means FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY on Vercel belong to a different Firebase project than the one used by VITE_FIREBASE_* on the client, or the private key was pasted with broken formatting.',
      });
    }

    if (!decodedToken.email || decodedToken.email !== ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'This account is not authorized as admin' });
    }

    if (!decodedToken.email_verified) {
      return res.status(403).json({ message: 'Admin email is not verified' });
    }

    let adminRecord = await Admin.findOne({ uid: decodedToken.uid });
    if (!adminRecord) {
      adminRecord = await Admin.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: 'superadmin',
      });
    }

    req.admin = adminRecord;
    next();
  } catch (error) {
    console.error('adminAuthMiddleware unexpected error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired authentication token', error: error.message });
  }
}

module.exports = { adminAuthMiddleware };
