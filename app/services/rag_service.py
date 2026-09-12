"""
Retrieval-Augmented Generation pipeline (technical guide, Phase 2).

Backend owns the RETRIEVAL plumbing (hybrid search over Supabase/pgvector,
re-ranking, assembling the cited answer). The embedding model call
(`embed()`) is Aditya Shukla's AI/ML work -- stubbed here as the explicit
plug-in point so the rest of the pipeline can be built/tested
independently of his model choice. The LLM synthesis call
(`_synthesize()`) is wired up to Groq.

Hybrid scoring: HYBRID_DENSE_WEIGHT * vector_score + HYBRID_KEYWORD_WEIGHT
* keyword_score, per the PRD (0.6 dense / 0.4 keyword by default).
"""

from typing import Any

from groq import Groq

from app.core.config import (
    HYBRID_DENSE_WEIGHT,
    HYBRID_KEYWORD_WEIGHT,
    RERANK_TOP_K,
    RERANK_FINAL_K,
    GROQ_API_KEY,
    GROQ_MODEL,
)
from app.services.supabase_service import SupabaseService
from app.services.bhashini_service import BhashiniService, BhashiniError

NO_CONTEXT_FALLBACK = (
    "I couldn't find a specific Indian Standard clause covering this in our "
    "knowledge base. Please rephrase, or consult the BIS portal directly."
)


class RAGService:
    def __init__(
        self,
        supabase_service: SupabaseService | None = None,
        translator: BhashiniService | None = None,
    ):
        self.db = supabase_service or SupabaseService()
        # Retrieval/synthesis (embed(), _synthesize()'s system prompt, the
        # BIS clause corpus) are all English. Bhashini bridges that: the
        # query is translated to English before retrieval, and the answer
        # is translated back to the caller's language before it goes out.
        self.translator = translator or BhashiniService()

    # ------------------------------------------------------------------
    # AI/ML plug-points.
    # ------------------------------------------------------------------

    def embed(self, text: str) -> list[float]:
        """Generate a dense embedding for `text` using EMBEDDING_MODEL
        (BAAI/bge-m3 per the PRD). Backend calls this to get the vector
        it hands to SupabaseService.vector_search_clauses(). Still
        Aditya's part -- not touched here.
        """
        raise NotImplementedError("Wire up the bge-m3 embedding call here (AI/ML side).")

    def _synthesize(self, query: str, context_chunks: list[dict[str, Any]]) -> str:
        """Call the LLM (Groq) with the retrieved, re-ranked clauses as
        context. Enforces the zero-hallucination system prompt: ground
        answers ONLY in provided context, cite exact clause numbers, and
        return NO_CONTEXT_FALLBACK if the context doesn't actually cover
        the question.

        Note: retrieval (embed()/vector search) is separate from this --
        this only wires up answer generation. Until embeddings are wired
        up elsewhere, retrieve() falls back to keyword-only search, which
        this method still works correctly on top of.
        """
        if not GROQ_API_KEY:
            raise NotImplementedError("GROQ_API_KEY is not set.")

        context_text = "\n\n".join(
            f"[Clause {c.get('clause_number', '?')} of {c.get('standard_id') or 'unknown standard'}]\n{c.get('text', '')}"
            for c in context_chunks
        )

        system_prompt = (
            "You are ManakAI, a regulatory assistant for Indian Standards (BIS). "
            "Answer the user's question using ONLY the context clauses provided below. "
            "Do not use any outside knowledge, even if you are confident it is correct. "
            "Every factual claim in your answer must be traceable to one of the provided "
            "clauses. Cite the exact clause number and standard for every claim, e.g. "
            "'(IS 302-2-3, Clause 4.2.1)'. If the provided context does not actually answer "
            f"the question, respond with exactly: \"{NO_CONTEXT_FALLBACK}\" and nothing else. "
            "Do not guess or fill gaps with general knowledge.\n\n"
            f"Context:\n{context_text}"
        )

        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            temperature=0.1,  # low temperature: factual grounding over creativity
        )
        return response.choices[0].message.content

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

    def _to_english(self, text: str, language: str) -> str:
        """Best-effort translate to English for retrieval/synthesis.
        Falls back to the original text (in its own language) if
        Bhashini isn't configured or the call fails -- retrieval/LLM
        quality will suffer, but the request still completes."""
        if language == "en" or not self.translator.configured:
            return text
        try:
            return self.translator.translate(text, language, "en")
        except BhashiniError:
            return text

    def _from_english(self, text: str, language: str) -> str:
        """Best-effort translate the English answer back to the
        caller's language. Falls back to the English text if Bhashini
        isn't configured or the call fails."""
        if language == "en" or not self.translator.configured:
            return text
        try:
            return self.translator.translate(text, "en", language)
        except BhashiniError:
            return text

    def answer(self, query: str, language: str = "en", context: str | None = None) -> dict[str, Any]:
        """Full pipeline: translate -> retrieve -> synthesize -> translate
        back -> log -> return {answer, sources}. This is what
        routes/chat.py calls.
        """
        query_en = self._to_english(query, language)

        chunks = self.retrieve(query_en)

        if context:
            # An uploaded document's extracted text, folded in as an
            # extra pseudo-chunk so it's available to _synthesize().
            # Assumed already in English (extracted from a BIS/compliance
            # doc) -- not translated.
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
                answer_text = self._synthesize(query_en, chunks)
            except NotImplementedError:
                answer_text = NO_CONTEXT_FALLBACK

        answer_text = self._from_english(answer_text, language)

        clause_ids = [c["id"] for c in chunks]
        self.db.log_query(query, language, answer_text, clause_ids)

        return {
            "answer": answer_text,
            "sources": [
                f"{c.get('standard_id', '')} clause {c.get('clause_number', '')}" for c in chunks
            ],
        }