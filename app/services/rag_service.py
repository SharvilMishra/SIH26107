"""
Retrieval-Augmented Generation pipeline (technical guide, Phase 2).

Backend owns the RETRIEVAL plumbing (hybrid search over Supabase/pgvector,
re-ranking, assembling the cited answer). The actual embedding model call
(`embed()`) and the LLM call (`_synthesize()`) are Aditya Shukla's AI/ML
work -- they're stubbed here as the explicit plug-in points so the rest
of the pipeline can be built/tested independently of his model choice.

Hybrid scoring: HYBRID_DENSE_WEIGHT * vector_score + HYBRID_KEYWORD_WEIGHT
* keyword_score, per the PRD (0.6 dense / 0.4 keyword by default).
"""

from typing import Any

from app.core.config import (
    HYBRID_DENSE_WEIGHT,
    HYBRID_KEYWORD_WEIGHT,
    RERANK_TOP_K,
    RERANK_FINAL_K,
)
from app.services.supabase_service import SupabaseService

NO_CONTEXT_FALLBACK = (
    "I couldn't find a specific Indian Standard clause covering this in our "
    "knowledge base. Please rephrase, or consult the BIS portal directly."
)


class RAGService:
    def __init__(self, supabase_service: SupabaseService | None = None):
        self.db = supabase_service or SupabaseService()

    # ------------------------------------------------------------------
    # AI/ML plug-points -- Aditya Shukla implements these.
    # ------------------------------------------------------------------

    def embed(self, text: str) -> list[float]:
        """Generate a dense embedding for `text` using EMBEDDING_MODEL
        (BAAI/bge-m3 per the PRD). Backend calls this to get the vector
        it hands to SupabaseService.vector_search_clauses().
        """
        raise NotImplementedError("Wire up the bge-m3 embedding call here (AI/ML side).")

    def _synthesize(self, query: str, context_chunks: list[dict[str, Any]]) -> str:
        """Call the LLM with the retrieved, re-ranked clauses as context.
        Must enforce the zero-hallucination system prompt: ground answers
        ONLY in provided context, cite exact clause numbers, and return
        NO_CONTEXT_FALLBACK if context is empty/irrelevant.
        """
        raise NotImplementedError("Wire up the LLM synthesis call here (AI/ML side).")

    def _rerank(self, chunks: list[dict[str, Any]], query: str, top_n: int) -> list[dict[str, Any]]:
        """Re-rank retrieved chunks (FlashRank per the PRD) down to top_n.
        Placeholder passthrough until the re-ranker is wired up.
        """
        return chunks[:top_n]

    # ------------------------------------------------------------------
    # Backend-owned retrieval plumbing.
    # ------------------------------------------------------------------

    def retrieve(self, query: str) -> list[dict[str, Any]]:
        """Hybrid retrieval: dense (pgvector) + keyword (pg_trgm) search,
        merged and re-ranked to the final top-k clauses.
        """
        keyword_hits = self.db.keyword_search_clauses(query, limit=RERANK_TOP_K)

        try:
            embedding = self.embed(query)
            vector_hits = self.db.vector_search_clauses(embedding, limit=RERANK_TOP_K)
        except NotImplementedError:
            # AI/ML embedding not wired up yet -- fall back to keyword-only
            # retrieval so the rest of the API stays testable.
            vector_hits = []

        merged = self._merge_hybrid(vector_hits, keyword_hits)
        return self._rerank(merged, query, top_n=RERANK_FINAL_K)

    def _merge_hybrid(
        self, vector_hits: list[dict[str, Any]], keyword_hits: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Combine and weight the two retrieval sources by clause id,
        per HYBRID_DENSE_WEIGHT / HYBRID_KEYWORD_WEIGHT.
        """
        scores: dict[str, float] = {}
        clauses: dict[str, dict[str, Any]] = {}

        for rank, clause in enumerate(vector_hits):
            score = HYBRID_DENSE_WEIGHT * (1.0 / (rank + 1))
            scores[clause["id"]] = scores.get(clause["id"], 0.0) + score
            clauses[clause["id"]] = clause

        for rank, clause in enumerate(keyword_hits):
            score = HYBRID_KEYWORD_WEIGHT * (1.0 / (rank + 1))
            scores[clause["id"]] = scores.get(clause["id"], 0.0) + score
            clauses[clause["id"]] = clause

        ordered_ids = sorted(scores, key=lambda cid: scores[cid], reverse=True)
        return [clauses[cid] for cid in ordered_ids]

    def answer(self, query: str, language: str = "en", context: str | None = None) -> dict[str, Any]:
        """Full pipeline: retrieve -> synthesize -> log -> return
        {answer, sources}. This is what routes/chat.py calls.
        """
        chunks = self.retrieve(query)

        if context:
            # An uploaded document's extracted text, folded in as an
            # extra pseudo-chunk so it's available to _synthesize()
            # once the LLM call is wired up.
            chunks = [{
                "id": "uploaded-doc",
                "standard_id": "",
                "clause_number": "uploaded document",
                "text": context,
            }] + chunks

        if not chunks:
            answer_text = NO_CONTEXT_FALLBACK
        else:
            try:
                answer_text = self._synthesize(query, chunks)
            except NotImplementedError:
                answer_text = NO_CONTEXT_FALLBACK

        clause_ids = [c["id"] for c in chunks]
        self.db.log_query(query, language, answer_text, clause_ids)

        return {
            "answer": answer_text,
            "sources": [
                f"{c.get('standard_id', '')} clause {c.get('clause_number', '')}" for c in chunks
            ],
        }