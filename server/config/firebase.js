const admin = require('firebase-admin');

let firebaseApp;

function getFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  return firebaseApp;
}

function getAuthAdmin() {
  getFirebaseAdmin();
  return admin.auth();
}

module.exports = { getFirebaseAdmin, getAuthAdmin };
