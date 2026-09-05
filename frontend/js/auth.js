// Shared Firebase Authentication logic: email/password + Google sign-in,
// sign-out, auth-state tracking, and page protection.
//
// This is an ES module (uses import/export), so any <script> tag that
// loads it needs type="module". Since navigation.js and other existing
// scripts are plain (non-module) scripts, this file also exposes a
// window.ManakAIAuth object so they can call into it without themselves
// becoming modules.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Friendly messages for the Firebase error codes people actually hit.
const ERROR_MESSAGES = {
  "auth/email-already-in-use": "An account with that email already exists. Try signing in instead.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/network-request-failed": "Network error -- check your connection and try again.",
};

function friendlyError(error) {
  return ERROR_MESSAGES[error.code] || error.message || "Something went wrong. Please try again.";
}

export async function signUpWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: friendlyError(error) };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: friendlyError(error) };
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: friendlyError(error) };
  }
}

export async function signOutUser() {
  await signOut(auth);
}

// Resolves to the current user's Firebase ID token, or null if signed out.
// Use this to authenticate calls to the backend:
//   headers: { Authorization: `Bearer ${await getIdToken()}` }
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// Calls `callback(user)` immediately with the current auth state, and
// again every time it changes (sign-in, sign-out, token refresh).
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Call at the top of any page that should require sign-in. Redirects to
// login.html if no one is signed in. Returns the user once resolved, so
// callers can `const user = await requireAuth();` and then use it.
export function requireAuth(redirectTo = "login.html") {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = redirectTo;
        resolve(null);
      } else {
        resolve(user);
      }
    });
  });
}

// Bridge for non-module scripts (navigation.js, etc.) that can't `import`.
window.ManakAIAuth = {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  getIdToken,
  onAuthChange,
  requireAuth,
};