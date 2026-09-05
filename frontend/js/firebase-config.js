// Firebase project configuration.
//
// Get these values from: Firebase Console -> Project Settings (gear icon)
// -> General tab -> "Your apps" -> Web app -> SDK setup and configuration.
//
// These ARE meant to be public and committed -- they're client identifiers,
// not secrets. Firebase access control comes from Authentication rules and
// (for Firestore/Storage) Security Rules, not from hiding this object.
// The real secret is the backend's service account key -- that one goes in
// an environment variable, never in this file. See backend/.env.example.
export const firebaseConfig = {
  apiKey: "AIzaSyCtOjxB3SgLmShp7ok1RultdC4SjDnYIW4",
  authDomain: "sih26032.firebaseapp.com",
  projectId: "sih26032",
  storageBucket: "sih26032.firebasestorage.app",
  messagingSenderId: "771485003169",
  appId: "1:771485003169:web:fe69699bc82e8ad9ee6fe0",
};