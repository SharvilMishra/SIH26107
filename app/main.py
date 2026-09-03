"""
Entry point for the SIH26107 backend (FastAPI).

Wires up the API routers and app-level middleware/config.
Run locally with: uvicorn app.main:app --reload
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import standards, certification, consumer, labs, chat

app = FastAPI(title="BIS Intelligent Assistant - Backend (ManakAI)", version="0.2.0")

# Wide open for hackathon dev; tighten allow_origins before any public demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(standards.router, prefix="/standards", tags=["Standards"])
app.include_router(certification.router, prefix="/certification", tags=["Certification"])
app.include_router(consumer.router, prefix="/consumer", tags=["Consumer"])
app.include_router(labs.router, prefix="/labs", tags=["Labs"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------
# Optional: serve the ManakAI frontend directly from this backend.
#
# frontend/ sits next to app/ inside backend/, so http://localhost:8000/
# serves index.html and everything under /screens, /js, /css, /assets --
# same-origin, no CORS/API-base configuration needed.
#
# Added LAST and after all API routers above, so specific API routes
# (/standards, /chat, etc.) are always matched first; the static mount
# only ever serves paths that aren't already an API route.
# ---------------------------------------------------------------------
_frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if _frontend_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(_frontend_dir), html=True), name="frontend")