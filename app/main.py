"""
Entry point for the SIH26107 backend (FastAPI).

Wires up the API routers and app-level middleware/config.
Run locally with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
