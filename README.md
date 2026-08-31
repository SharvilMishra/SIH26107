# SIH26107 Backend — ManakAI

Python (FastAPI) backend for the BIS AI Assistant. Database: **Supabase
(Postgres + pgvector)**.

## Structure
- `app/main.py` – FastAPI app entry point, routers wired up
- `app/api/routes/` – one router per domain (standards, certification, consumer, labs, chat)
- `app/services/` –
  - `supabase_service.py` – all DB reads/writes (routes never call Supabase directly)
  - `rag_service.py` – hybrid retrieval orchestration; `embed()`/`_synthesize()` are AI/ML plug-points (Aditya S.)
  - `verification_service.py` – HUID / CM-L / CRS deterministic validation
- `app/db/supabase_client.py` – Supabase client init (the swap point if the backend ever changes)
- `app/models/` – Pydantic schemas
- `app/core/config.py` – env loading
- `sql/schema.sql` – full Postgres DDL (tables, indexes, RPC functions) — run this in Supabase
- `data/raw/` – raw BIS standards docs/PDFs for the knowledge base
- `data/processed/` – chunked versions used to seed `clauses`
- `tests/` – backend tests

## Setup

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once it's provisioned, go to **Project Settings → API** and copy the
   **Project URL** and the **service_role key** (not the anon key — the
   backend needs full read/write access).
3. Go to the **SQL Editor** in the dashboard, paste the contents of
   `sql/schema.sql`, and run it. This creates all tables, indexes, and
   the two RPC functions (`match_clauses`, `nearby_labs`) the backend calls.

### 2. Configure the backend
```
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_KEY from step 1
```

### 3. Install & run
```
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Visit `http://localhost:8000/docs` for the interactive API docs, and
`http://localhost:8000/health` to confirm it's up.

## Notes
- `SUPABASE_KEY` is the **service_role** key — full DB access, server-side
  only. Never ship it to the frontend/browser.
- The RAG pipeline (`rag_service.py`) works with keyword-only retrieval
  today (`clauses` table + `pg_trgm`). Vector search activates once
  `RAGService.embed()` is implemented and `clauses.embedding` is populated.
- See `docs/PRD.md` and `docs/schema.md` for the fuller spec.
