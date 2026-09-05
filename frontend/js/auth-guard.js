// Site-wide auth gate.
//
// Add these two lines near the top of <head> on every page that should
// require sign-in (every page EXCEPT login.html and signup.html):
//
//   <style>html{visibility:hidden}</style>
//   <script type="module" src="../js/auth-guard.js"></script>
//
// (screens/*.html use "../js/auth-guard.js"; frontend/index.html itself
// uses "js/auth-guard.js" without "../", since it lives one directory
// above screens/)
//
// The inline style hides the page instantly so there's no flash of
// protected content before the check finishes. This script then checks
// Firebase's auth state and either reveals the page or redirects to
// login.html. Importing auth.js here also means protected pages don't
// need their own separate <script src="auth.js"> tag -- this pulls it
// in as a dependency.

import { onAuthChange } from './auth.js';

const inScreensDir = window.location.pathname.includes('/screens/');
const loginPath = inScreensDir ? 'login.html' : 'screens/login.html';

onAuthChange((user) => {
  if (user) {
    document.documentElement.style.visibility = 'visible';
  } else {
    window.location.href = loginPath;
  }
});