# SIH26107 Backend — ManakAI

Python/FastAPI backend for the BIS AI Assistant. DB is Supabase (Postgres + pgvector).

## Structure
- `app/main.py` — entry point, routers wired up
- `app/api/routes/` — one router per domain (standards, certification, consumer, labs, chat)
- `app/services/supabase_service.py` — all DB reads/writes go through here, nowhere else
- `app/services/rag_service.py` — retrieval logic, `embed()`/`_synthesize()` are where Aditya's ML work plugs in
- `app/services/verification_service.py` — HUID / CM-L / CRS validation
- `app/db/supabase_client.py` — client init
- `app/models/` — Pydantic schemas
- `sql/schema.sql` — run this in the Supabase SQL editor, sets up tables + RPC functions
- `data/raw/` + `data/processed/` — BIS docs and their chunked versions
- `tests/`

## Setup
1. Make a Supabase project, grab the Project URL and service_role key from Settings → API
2. Run `sql/schema.sql` in the SQL editor
3. `cp .env.example .env` and fill in the URL + key
