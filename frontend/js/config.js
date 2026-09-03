/**
 * Single place to point the frontend at the FastAPI backend.
 *
 * Local dev (backend running via `uvicorn app.main:app --reload`,
 * default port 8000): leave this as-is.
 *
 * Deployed frontend + backend on different hosts: change the URL below
 * to your deployed backend's URL, e.g.
 *   window.MANAKAI_API_BASE = "https://your-backend.onrender.com";
 *
 * Frontend served BY the backend itself (see the optional static mount
 * in backend/app/main.py): set this to "" (relative/same-origin) instead.
 */
window.MANAKAI_API_BASE = window.MANAKAI_API_BASE || "";

/**
 * Small fetch helper shared by every page-specific script.
 * Throws a readable Error on non-2xx responses instead of failing silently.
 */
async function manakaiFetch(path, options) {
  const base = window.MANAKAI_API_BASE || "";
  const res = await fetch(base + path, options);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {
      /* response wasn't JSON, keep statusText */
    }
    throw new Error(`${res.status} ${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
