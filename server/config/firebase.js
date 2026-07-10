const admin = require('firebase-admin');

let firebaseApp;

function getFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });

  return firebaseApp;
}

function getBucket() {
  getFirebaseAdmin();
  return admin.storage().bucket();
}

function getAuthAdmin() {
  getFirebaseAdmin();
  return admin.auth();
}

module.exports = { getFirebaseAdmin, getBucket, getAuthAdmin };
