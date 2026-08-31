# Data Schema — SIH26107 Backend

> **Supabase (Postgres + pgvector).** Switched from the original
> Firebase/Firestore plan — see `memory.md` for the decision and reasoning.
> This file is the readable spec; the actual DDL lives in `sql/schema.sql`
> and is what you run in the Supabase SQL editor.

## Tables

### `standards`
One row per Indian Standard.
```
standards
  id: uuid (pk)
  standard_number: text unique      # e.g. "IS 1293:2019"
  title: text
  category: text                    # e.g. "packaging", "electrical", "toys"
  keywords: text[]                  # for matching product descriptions
  source_pdf_url: text
  last_updated: timestamptz
```

### `clauses`
Clause-level rows — what RAG actually retrieves/cites. Kept in its own
table (not nested JSON) so clause-level citation is a first-class,
independently queryable unit.
```
clauses
  id: uuid (pk)
  standard_id: uuid -> standards.id
  clause_number: text               # e.g. "4.2"
  text: text
  page_number: int
  embedding: vector(1024)           # BAAI/bge-m3 output dim
```

### `certification_schemes`
```
certification_schemes
  id: uuid (pk)
  name: text unique                 # "ISI Mark" | "CRS" | "FMCS" | "Hallmarking" | "LRS"
  description: text
  steps: jsonb                      # [{ step_number, title, description }]
  documents_required: text[]
  fee_structure: jsonb              # [{ label, amount, unit }]
```

### `standard_schemes`
Join table — a standard can map to multiple certification schemes.
```
standard_schemes
  standard_id: uuid -> standards.id
  scheme_id: uuid -> certification_schemes.id
  (standard_id, scheme_id) as primary key
```

### `labs`
```
labs
  id: uuid (pk)
  name: text
  address: text
  lat, lng: double precision
  recognized_for: text[]            # test parameters / standard_ids it can test
  contact: text
```

### `queries` (optional — logging for demo/analytics)
```
queries
  id: uuid (pk)
  query_text: text
  language: text
  answer_text: text
  matched_clause_ids: uuid[]
  created_at: timestamptz
```

## RPC functions (in `sql/schema.sql`)
- **`match_clauses(query_embedding, match_count)`** — cosine-distance
  vector search over `clauses.embedding`, called by
  `SupabaseService.vector_search_clauses()`. Needed because pgvector's
  `<=>` operator isn't expressible through the Supabase query builder.
- **`nearby_labs(lat, lng, radius_km, keyword)`** — haversine-distance
  proximity search over `labs`, called by `SupabaseService.find_labs()`.

## Notes
- Real foreign keys now (this was the whole point of moving off
  Firestore) — `clauses.standard_id`, `standard_schemes.*` are proper FKs
  with `on delete cascade`.
- `pg_trgm` (`clauses_text_trgm_idx`) is the keyword/BM25-ish half of the
  hybrid retriever; `pgvector` (`clauses_embedding_idx`, ivfflat) is the
  dense half. Both live in the same database — no separate vector store
  to keep in sync.
- Embeddings are populated once the ingestion pipeline (Phase 1, AI/ML
  side) runs `RAGService.embed()` over each clause and writes the result
  back via `SupabaseService.insert_clause()` / an update.
