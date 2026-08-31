"""
Data-access layer sitting between routes and Supabase (Postgres).

Keep all reads/writes here (not scattered in route files) so the
storage backend stays swappable and routes never import the Supabase
SDK directly.

Table layout (see sql/schema.sql for full DDL):
    standards               - one row per Indian Standard
    clauses                 - clause-level text + embedding, FK -> standards
    certification_schemes   - ISI / CRS / FMCS / Hallmarking / LRS
    standard_schemes        - join table: standards <-> certification_schemes
    labs                    - BIS-recognized testing labs
    queries                 - chat query/answer log (optional, for demo analytics)
"""

from typing import Any, Optional

from app.db.supabase_client import get_client


class SupabaseService:
    """CRUD + search helpers for standards, schemes, labs, and query logs."""

    def __init__(self):
        self.client = get_client()

    # ------------------------------------------------------------------
    # Standards
    # ------------------------------------------------------------------

    def list_standards(
        self,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Search/list standards by free-text keyword and/or category."""
        query = self.client.table("standards").select("*")
        if category:
            query = query.eq("category", category)
        if keyword:
            # matches against title or the keywords[] array
            query = query.or_(f"title.ilike.%{keyword}%,keywords.cs.{{{keyword}}}")
        return query.limit(limit).execute().data

    def get_standard(self, standard_id: str) -> Optional[dict[str, Any]]:
        """Fetch a single standard plus its clauses and linked schemes."""
        standard = (
            self.client.table("standards")
            .select("*")
            .eq("id", standard_id)
            .maybe_single()
            .execute()
            .data
        )
        if not standard:
            return None
        standard["clauses"] = self.get_clauses_for_standard(standard_id)
        standard["schemes"] = self.get_schemes_for_standard(standard_id)
        return standard

    def create_standard(self, standard: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("standards").insert(standard).execute().data[0]

    # ------------------------------------------------------------------
    # Clauses (what RAG retrieves and cites)
    # ------------------------------------------------------------------

    def get_clauses_for_standard(self, standard_id: str) -> list[dict[str, Any]]:
        return (
            self.client.table("clauses")
            .select("id, clause_number, text, page_number")
            .eq("standard_id", standard_id)
            .execute()
            .data
        )

    def get_clauses_by_ids(self, clause_ids: list[str]) -> list[dict[str, Any]]:
        if not clause_ids:
            return []
        return (
            self.client.table("clauses")
            .select("id, standard_id, clause_number, text, page_number")
            .in_("id", clause_ids)
            .execute()
            .data
        )

    def keyword_search_clauses(self, query_text: str, limit: int = 15) -> list[dict[str, Any]]:
        """Keyword/BM25-style search over clause text (pg_trgm), used as the
        keyword half of the hybrid retriever in rag_service.py."""
        return (
            self.client.table("clauses")
            .select("id, standard_id, clause_number, text, page_number")
            .ilike("text", f"%{query_text}%")
            .limit(limit)
            .execute()
            .data
        )

    def vector_search_clauses(self, embedding: list[float], limit: int = 15) -> list[dict[str, Any]]:
        """Dense vector search over clause embeddings via a Postgres RPC
        function (see sql/schema.sql: match_clauses). The RPC wraps a
        pgvector `<=>` cosine-distance query, since supabase-py can't
        express vector ops through the query builder directly.
        """
        result = self.client.rpc(
            "match_clauses",
            {"query_embedding": embedding, "match_count": limit},
        ).execute()
        return result.data

    def insert_clause(self, clause: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("clauses").insert(clause).execute().data[0]

    # ------------------------------------------------------------------
    # Certification schemes
    # ------------------------------------------------------------------

    def get_scheme(self, scheme_name: str) -> Optional[dict[str, Any]]:
        return (
            self.client.table("certification_schemes")
            .select("*")
            .ilike("name", scheme_name)
            .maybe_single()
            .execute()
            .data
        )

    def get_schemes_for_standard(self, standard_id: str) -> list[dict[str, Any]]:
        links = (
            self.client.table("standard_schemes")
            .select("scheme_id")
            .eq("standard_id", standard_id)
            .execute()
            .data
        )
        scheme_ids = [row["scheme_id"] for row in links]
        if not scheme_ids:
            return []
        return (
            self.client.table("certification_schemes")
            .select("*")
            .in_("id", scheme_ids)
            .execute()
            .data
        )

    # ------------------------------------------------------------------
    # Labs
    # ------------------------------------------------------------------

    def find_labs(
        self,
        product_keyword: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_km: float = 50.0,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Find labs recognized for a product/test parameter, optionally
        filtered by proximity (via the nearby_labs RPC, which does the
        distance math in Postgres)."""
        if lat is not None and lng is not None:
            result = self.client.rpc(
                "nearby_labs",
                {"lat": lat, "lng": lng, "radius_km": radius_km, "keyword": product_keyword},
            ).execute()
            return result.data[:limit]

        query = self.client.table("labs").select("*")
        if product_keyword:
            query = query.contains("recognized_for", [product_keyword])
        return query.limit(limit).execute().data

    # ------------------------------------------------------------------
    # Consumer verification lookups (results of Phase 3 deterministic
    # verification get logged here for the demo/analytics trail)
    # ------------------------------------------------------------------

    def log_query(
        self,
        query_text: str,
        language: str,
        answer_text: str,
        matched_clause_ids: list[str],
    ) -> dict[str, Any]:
        return (
            self.client.table("queries")
            .insert(
                {
                    "query_text": query_text,
                    "language": language,
                    "answer_text": answer_text,
                    "matched_clause_ids": matched_clause_ids,
                }
            )
            .execute()
            .data[0]
        )
