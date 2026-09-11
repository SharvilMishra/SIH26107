"""
App-wide config and environment variable loading.

Holds Supabase credentials, LLM/embedding API keys, and feature flags
(e.g. which embedding model is active for the RAG pipeline).
"""

import os

# --- Supabase (Postgres + pgvector) ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")  # service_role key for backend use, never expose to frontend
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL", "")  # direct Postgres connection string, for raw SQL if needed

# --- Groq (LLM synthesis for chat answers -- Sharvil's part) ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# --- Retrieval tuning (Phase 2 of technical guide: hybrid dense + BM25/keyword) ---
HYBRID_DENSE_WEIGHT = float(os.getenv("HYBRID_DENSE_WEIGHT", "0.6"))
HYBRID_KEYWORD_WEIGHT = float(os.getenv("HYBRID_KEYWORD_WEIGHT", "0.4"))
RERANK_TOP_K = int(os.getenv("RERANK_TOP_K", "15"))
RERANK_FINAL_K = int(os.getenv("RERANK_FINAL_K", "4"))

# --- External verification (Phase 3: HUID / CM-L / CRS) ---
BIS_CARE_BASE_URL = os.getenv("BIS_CARE_BASE_URL", "")

# --- Multilingual (Phase 5) ---
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "")
DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")
