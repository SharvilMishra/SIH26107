# Project Memory / Decision Log — SIH26107 Backend

> Running log of decisions so context isn't lost across vibecoding sessions.
> Add a new entry whenever a real decision gets made — keep it short.

## Team & roles
- Aditya Tiwari — frontend/UI-UX
- Sharvil — backend & database
- Aditya Shukla — research & problem analysis (originated the idea), also helping in AI/ML
- Roli Gupta — AI/ML & system integration
- Anushka Gupta — PPT/presentation/documentation
- Garima Dwivedi — testing, validation & team coordination

## Problem statement
SIH26107 — AI-powered conversational assistant for Indian Standards & BIS
services (standards lookup, certification/hallmarking guidance, lab directory,
multilingual support). Org: Ministry of Consumer Affairs / BIS.
(Switched from SIH26032.)

## Key decisions
- **2026-08-30** — Backend stack: Python (FastAPI).
- **2026-08-30** — Database: **Firebase/Firestore** for the hackathon build.
  Considered Supabase (Postgres) — better long-term fit since the data
  (standards → clauses → schemes → labs) is naturally relational, and
  pgvector would help RAG retrieval. But Firebase wins for hackathon speed
  (zero-config, already Sharvil's default stack). Data model kept flat/
  denormalized on purpose so a post-hackathon move to Supabase is a schema
  translation, not a redesign. **Do not switch mid-hackathon.**
- **2026-08-30** — DB access isolated behind `app/services/firebase_service.py`
  — routes/RAG never call Firestore directly, so the backend swap point stays
  in one file. (Superseded — see 2026-08-31 below.)
- **2026-08-31** — **Reversed the Firebase decision: moving to Supabase
  (Postgres + pgvector) instead.** Reasoning: the data is genuinely
  relational (standards → clauses → schemes → labs with real FKs), and
  Postgres + pgvector covers structured data, vector search, and
  keyword/BM25-ish search (`pg_trgm`) in ONE database — Firestore would've
  needed a second system (Chroma) just for RAG, two things to keep in sync.
  Clause-level citation is also a straightforward JOIN in SQL vs multiple
  round-trip reads in Firestore. Trade-off accepted: team has zero prior
  Supabase experience, so there's a small ramp-up cost — judged worth it
  since no DB code had been written yet (still all stubs) and migrating a
  live RAG pipeline later would've been riskier.
  DB access isolated behind `app/services/supabase_service.py` (replaces
  `firebase_service.py`); `app/db/supabase_client.py` replaces
  `firebase_client.py`. Full DDL in `sql/schema.sql`.

## Open threads
- Which BIS standards/PDFs to seed the knowledge base with for the demo
- Where lab directory data comes from (dataset vs scraping)
- Language list for multilingual support (confirm min. viable set for demo)
- Embedding pipeline (Phase 1 ingestion → `RAGService.embed()` → write to
  `clauses.embedding`) — pending alignment with Aditya S. on the ML side
- Team walkthrough of Supabase basics (dashboard, SQL editor, service_role
  vs anon key) — nobody's used it before
