"""
Routes for chat-related endpoints.

POST /chat - main conversational query -> cited answer + source clauses
"""

from fastapi import APIRouter

from app.models.schemas import ChatQuery, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(payload: ChatQuery):
    rag = RAGService()
    result = rag.answer(payload.query, language=payload.language)
    return result
