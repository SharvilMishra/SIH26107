"""
Supabase (Postgres) client initialization.

Single point where the Supabase client is created. Services import
`get_client()` from here -- nothing outside this file (and
`app/services/supabase_service.py`) should touch the Supabase SDK
directly. That keeps the storage backend swappable later if needed.

Uses the service_role key because this runs entirely server-side
(FastAPI backend) -- never expose SUPABASE_KEY to the frontend.
"""

from functools import lru_cache

from supabase import create_client, Client

from app.core.config import SUPABASE_URL, SUPABASE_KEY


@lru_cache
def get_client() -> Client:
    """Return a cached Supabase client instance."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_KEY are not set. Copy .env.example to .env "
            "and fill in your Supabase project's URL and service_role key "
            "(Project Settings -> API in the Supabase dashboard)."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)
