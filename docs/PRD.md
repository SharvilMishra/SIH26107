# PRD — SIH26107 Backend (Not Built Yet — Planning Doc)

> Status: **Not built.** This is the spec to vibecode against, not documentation of existing code.

## 1. Problem
BIS publishes thousands of Indian Standards + runs multiple schemes (ISI Mark,
CRS, FMCS, Hallmarking, LRS). Users (MSMEs, startups, artisans, consumers) can't
easily find which standard/scheme applies to their product, or the certification
steps/fees/labs involved. Info is scattered across disconnected PDFs/portals.

## 2. What the backend needs to do
The backend is the API + data layer behind an AI assistant (chat/voice) that:
1. Takes a natural-language product description or question
2. Retrieves the matching Indian Standard(s) and clause(s), with citation
3. Explains applicable certification scheme (ISI/CRS/FMCS/Hallmarking) + steps + fees
4. Finds nearby BIS-recognized testing labs for the product's test parameters
5. Answers in the user's chosen language

## 3. Backend scope (Sharvil's responsibility)
- REST API (FastAPI) consumed by frontend (Aditya T.) and AI/ML layer (Aditya S.)
- Data layer: standards, clauses, certification schemes, fee tables, lab directory
- Auth (basic — likely anonymous/session-based for hackathon scope, not full user accounts)
- Orchestration: routes call RAG service (retrieval) → firebase_service (data) → response
- NOT in backend scope: embedding model choice/training, frontend UI, voice STT/TTS
  (those belong to Aditya S. / Aditya T., backend just exposes endpoints for them)

## 4. Core endpoints (planned)
| Endpoint | Purpose |
|---|---|
| `POST /chat` | Main conversational query → answer + source clauses |
| `GET /standards` | Search/list standards (by keyword, product category) |
| `GET /standards/{id}` | Standard detail + clauses |
| `GET /certification/{scheme}` | Certification scheme steps, docs checklist, fee info |
| `GET /labs?lat=&lng=&product=` | Nearby labs for a product's test parameters |
| `GET /consumer/verify` | Consumer-facing hallmark/ISI mark verification lookup |

## 5. Out of scope for hackathon MVP
- Real-time BIS portal integration (data will be pre-loaded/scraped into our own DB)
- Full authentication/user accounts
- Payment processing for certification fees (display only, not transactional)

## 6. Open questions
- Exact source docs to seed the knowledge base (which standards/PDFs to prioritize for demo)
- Whether lab directory data is available as a clean dataset or needs scraping
- Language list for multilingual support (confirm with frontend/AI team — likely Hindi + English minimum for demo)
