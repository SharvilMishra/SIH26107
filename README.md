# ManakAI — SIH26107

An AI-powered conversational assistant for Indian Standards and BIS (Bureau of Indian Standards) services, built for Smart India Hackathon problem statement **SIH26107** (Ministry of Consumer Affairs). ManakAI helps consumers and MSMEs understand standards, verify product certification (HUID / CM-L / CRS), find BIS-recognized testing labs, and get plain-language answers grounded in official BIS documentation — in their own language.

**Live app:** https://manakai-delta.vercel.app/

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, vanilla JavaScript, [Tailwind CSS](https://tailwindcss.com/) (CDN), Material Symbols, Google Fonts |
| Backend | Python, [FastAPI](https://fastapi.tiangolo.com/), Uvicorn |
| Database | [Supabase](https://supabase.com/) (Postgres) with `pgvector` (semantic search) and `pg_trgm` (keyword search) |
| Authentication | [Firebase Authentication](https://firebase.google.com/products/auth) (email/password + Google sign-in), verified server-side with the Firebase Admin SDK |
| LLM / answer generation | [Groq](https://groq.com/) (`openai/gpt-oss-120b`) |
| Multilingual | [Bhashini](https://bhashini.gov.in/) (Digital India / MeitY) translation pipeline |
| Document handling | Pillow, Tesseract OCR (`pytesseract`), `pypdf`, `python-docx` |
| Hosting | Frontend on [Vercel](https://vercel.com/); backend deployable on Render or similar |

---

## Architecture

```
┌─────────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│      Frontend        │      │       Backend          │      │      Database        │
│  HTML/CSS/JS (Tailwind)│ ───▶ │  FastAPI (Python)      │ ───▶ │  Supabase (Postgres)  │
│  Firebase Auth (client)│ ◀─── │  Firebase Admin (verify)│      │  pgvector + pg_trgm   │
└─────────────────────┘      └──────────────────────┘      └─────────────────────┘
                                        │
                          ┌─────────────┼──────────────┐
                          ▼             ▼              ▼
                       Groq LLM   Bhashini API    OCR / Document
                     (answer gen)  (translation)   parsing (scans)
```

The frontend is a static Tailwind/vanilla-JS app (no build step) that calls the FastAPI backend over HTTP. The backend handles retrieval-augmented generation over BIS documentation, deterministic certificate verification, lab lookup, and translation — all backed by a single Supabase Postgres database.

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI entry point, routers wired here
│   ├── api/routes/               # standards, certification, consumer, labs, chat
│   ├── core/
│   │   ├── config.py              # env-driven app config
│   │   └── firebase_auth.py       # verifies Firebase ID tokens server-side
│   ├── db/supabase_client.py     # Supabase client init
│   ├── models/schemas.py         # Pydantic request/response models
│   └── services/
│       ├── supabase_service.py     # all DB reads/writes go through here
│       ├── rag_service.py          # retrieval-augmented generation pipeline
│       ├── verification_service.py # HUID / CM-L / CRS validation
│       ├── bhashini_service.py     # multilingual translation (query + answer)
│       ├── document_service.py     # document upload/parsing
│       └── ocr_service.py          # OCR for scanned documents/images
├── sql/schema.sql                # Postgres schema — run in the Supabase SQL editor
├── scripts/bhashini_smoke_test.py# standalone Bhashini pipeline sanity check
├── tests/
├── docs/                         # PRD, schema notes, project memory
├── requirements.txt
├── .env.example
└── frontend/
    ├── index.html                # application entry point
    ├── screens/                  # one HTML file per screen (home, ask-ai, verify, ...)
    ├── js/                       # navigation, auth, chat, and per-feature scripts
    ├── css/                      # legacy shared styles
    └── design.md                 # design system reference
```

---

## Features

- **Ask AI** — retrieval-augmented chat grounded in official BIS documentation, with hybrid (semantic + keyword) search over standards and clauses
- **Verify** — HUID, ISI mark, and CM-L license authenticity checks, plus camera/document scanning
- **Standards Search** — searchable, plain-language explanations of Indian Standards
- **Laboratory Finder** — locate BIS-recognized testing labs
- **Certification Roadmap** — step-by-step certification guidance for MSMEs
- **Grievances / Complaints** — file and track consumer complaints
- **Consumer and Industry/MSME modes** — tailored views for individuals vs. businesses
- **Multilingual support** — ask and receive answers in Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Assamese, and more, via Bhashini; falls back to English if translation isn't configured or fails (fail-open by design)
- **Authentication** — email/password and Google sign-in via Firebase, with server-side token verification on protected API calls

---

## Database

Postgres via Supabase, with two extensions enabled:
- `vector` (pgvector) — semantic search over standard/clause embeddings
- `pg_trgm` — trigram-based keyword search, the BM25-style layer of the hybrid retriever

Core tables: `standards`, `clauses`, `certification_schemes`, `standard_schemes`, `labs`, `queries`. Full definitions are in `backend/sql/schema.sql`.

---

## Setup

### 1. Database (Supabase)
1. Create a Supabase project and grab the **Project URL** and **service_role key** from *Settings → API*.
2. Run `backend/sql/schema.sql` in the Supabase SQL editor to create the tables and extensions.

### 2. Authentication (Firebase)
1. Create a Firebase project and enable **Email/Password** and **Google** sign-in under *Authentication → Sign-in method*.
2. Generate a service account key: *Project Settings → Service Accounts → Generate new private key*.
3. Base64-encode it and set `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env`:
   - Linux/Mac: `base64 -i serviceAccountKey.json | tr -d '\n'`
   - PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))`
4. Set the matching client-side config in `backend/frontend/js/firebase-config.js`.

### 3. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase, Groq, Firebase, and (optionally) Bhashini values
uvicorn app.main:app --reload
```

### 4. LLM (Groq)
Set `GROQ_API_KEY` in `.env`. `GROQ_MODEL` defaults to `openai/gpt-oss-120b`.

### 5. Multilingual (Bhashini) — optional
1. Request an API key on the [Bhashini Udyat dashboard](https://dashboard.bhashini.co.in/).
2. From *My Profile*, grab both your **User ID** and **API key** — the pipeline config call needs both together, not the key alone.
3. Set `BHASHINI_USER_ID` and `BHASHINI_API_KEY` in `.env`.
4. Sanity-check with `python -m scripts.bhashini_smoke_test`.

If left unconfigured, the app continues to work in English — translation fails open rather than breaking the chat response.

### 6. Frontend
No build step. Open `backend/frontend/index.html` directly, or serve `backend/frontend/` with any static server (e.g. VS Code Live Server). Currently deployed on Vercel at the live URL above.

---

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/standards/` | List standards |
| GET | `/standards/{standard_id}` | Standard detail |
| GET | `/certification/{scheme}` | Certification scheme detail |
| GET | `/consumer/verify` | Verify HUID / ISI / CM-L |
| POST | `/consumer/scan` | Scan a product/document image |
| GET | `/labs/` | List BIS-recognized labs |
| POST | `/chat/` | Ask ManakAI a question (RAG + optional translation) |
| POST | `/chat/upload` | Upload a document for the chat context |

---

## Notes

- The frontend screens were originally generated from a Stitch UI export and later hand-extended; see `backend/frontend/README.md` for frontend-specific structure notes and `frontend/design.md` for the design system. `frontend/js/navigation.js` handles cross-screen routing, theming, and mobile navigation.
- The service_role Supabase key and Firebase service account are backend-only secrets — never exposed to the frontend.