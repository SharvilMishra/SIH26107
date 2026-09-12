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

## Multilingual (Phase 5, Bhashini)
`app/services/bhashini_service.py` wraps Bhashini's translation pipeline
and `RAGService.answer()` uses it to translate the incoming query to
English before retrieval, then translate the answer back to the
caller's language. Both steps fail open: if Bhashini isn't configured
or a call errors, the pipeline just continues in whatever language it
already has rather than breaking the chat response.

Setup:
1. Create a project on the [Bhashini Udyat dashboard](https://dashboard.bhashini.co.in/) and generate an API key
2. From My Profile, grab both your **User ID** and the **API key** (the pipeline config call needs both, not just the key)
3. Add `BHASHINI_USER_ID` and `BHASHINI_API_KEY` to `.env`
4. Sanity-check with `python -m scripts.bhashini_smoke_test`

The frontend's language dropdown (`screens/ask-ai.html` / `js/chat.js`) sends the selected language code as `language` on `POST /chat/`.
