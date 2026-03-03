const admin = require("firebase-admin");

let db;
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    admin.initializeApp();
  }

  db = admin.firestore();
} catch (err) {
  db = {
    collection() {
      throw new Error("Firebase is not configured. Set FIREBASE_* env vars.");
    },
  };
}

module.exports = { db };
