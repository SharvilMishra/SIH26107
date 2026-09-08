-- SIH26107 / ManakAI -- Supabase (Postgres) schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once
-- your project is created. Safe to re-run (uses IF NOT EXISTS guards).

create extension if not exists vector;      -- pgvector, for clause embeddings
create extension if not exists pg_trgm;     -- trigram search, our BM25-ish keyword layer

-- ---------------------------------------------------------------------
-- standards: one row per Indian Standard
-- ---------------------------------------------------------------------
create table if not exists standards (
  id uuid primary key default gen_random_uuid(),
  standard_number text unique not null,      -- e.g. "IS 1293:2019"
  title text not null,
  category text,                             -- e.g. "packaging", "electrical", "toys"
  keywords text[] default '{}',
  source_pdf_url text,
  last_updated timestamptz default now()
);

create index if not exists standards_keywords_idx on standards using gin (keywords);
create index if not exists standards_category_idx on standards (category);

-- ---------------------------------------------------------------------
-- clauses: clause-level text + embedding -- what RAG actually retrieves/cites
-- ---------------------------------------------------------------------
create table if not exists clauses (
  id uuid primary key default gen_random_uuid(),
  standard_id uuid references standards(id) on delete cascade,
  clause_number text not null,               -- e.g. "4.2"
  text text not null,
  page_number int,
  embedding vector(1024)                     -- BAAI/bge-m3 output dimension
);

create index if not exists clauses_standard_id_idx on clauses (standard_id);
create index if not exists clauses_text_trgm_idx on clauses using gin (text gin_trgm_ops);
-- ivfflat needs data present + ANALYZE to be effective; fine to add after seeding
create index if not exists clauses_embedding_idx
  on clauses using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------------
-- certification_schemes: ISI Mark | CRS | FMCS | Hallmarking | LRS
-- ---------------------------------------------------------------------
create table if not exists certification_schemes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  steps jsonb default '[]',                  -- [{step_number, title, description}]
  documents_required text[] default '{}',
  fee_structure jsonb default '[]'            -- [{label, amount, unit}]
);

-- join table: a standard can map to multiple schemes and vice versa
create table if not exists standard_schemes (
  standard_id uuid references standards(id) on delete cascade,
  scheme_id uuid references certification_schemes(id) on delete cascade,
  primary key (standard_id, scheme_id)
);

-- ---------------------------------------------------------------------
-- labs: BIS-recognized testing labs
-- ---------------------------------------------------------------------
create table if not exists labs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  recognized_for text[] default '{}',        -- test parameters / standard_ids
  contact text
);

create index if not exists labs_recognized_for_idx on labs using gin (recognized_for);

-- ---------------------------------------------------------------------
-- queries: chat query/answer log (demo analytics, optional)
-- ---------------------------------------------------------------------
create table if not exists queries (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  language text default 'en',
  answer_text text,
  matched_clause_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- RPC: match_clauses -- dense vector search (cosine distance)
-- called by SupabaseService.vector_search_clauses()
-- ---------------------------------------------------------------------
create or replace function match_clauses(
  query_embedding vector(1024),
  match_count int default 15
)
returns table (
  id uuid,
  standard_id uuid,
  clause_number text,
  text text,
  page_number int,
  similarity float
)
language sql stable
as $$
  select
    clauses.id,
    clauses.standard_id,
    clauses.clause_number,
    clauses.text,
    clauses.page_number,
    1 - (clauses.embedding <=> query_embedding) as similarity
  from clauses
  where clauses.embedding is not null
  order by clauses.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------
-- RPC: nearby_labs -- haversine-distance proximity search
-- called by SupabaseService.find_labs() when lat/lng are given
-- ---------------------------------------------------------------------
create or replace function nearby_labs(
  lat double precision,
  lng double precision,
  radius_km double precision default 50.0,
  keyword text default null
)
returns table (
  id uuid,
  name text,
  address text,
  lat double precision,
  lng double precision,
  recognized_for text[],
  contact text,
  distance_km double precision
)
language sql stable
as $$
  select * from (
    select
      labs.id, labs.name, labs.address, labs.lat, labs.lng,
      labs.recognized_for, labs.contact,
      ( 6371 * acos(
          cos(radians(lat)) * cos(radians(labs.lat)) *
          cos(radians(labs.lng) - radians(lng)) +
          sin(radians(lat)) * sin(radians(labs.lat))
        )
      ) as distance_km
    from labs
    where (keyword is null or keyword = any(labs.recognized_for))
  ) with_distance
  where distance_km <= radius_km
  order by distance_km asc;
$$;
