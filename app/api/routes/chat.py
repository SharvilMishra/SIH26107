"""
Routes for chat-related endpoints.

POST /chat - main conversational query -> cited answer + source clauses
POST /chat/upload - extract text from an uploaded document, to pass as
                     `context` on the next /chat/ call
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import ChatQuery, ChatResponse, DocumentUploadResponse
from app.services.rag_service import RAGService
from app.services.document_service import DocumentService

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(payload: ChatQuery):
    rag = RAGService()
    result = rag.answer(payload.query, language=payload.language, context=payload.context)
    return result


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    service = DocumentService()
    file_bytes = await file.read()
    try:
        text, truncated = service.extract_text(file.filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return DocumentUploadResponse(
        filename=file.filename, extracted_text=text, truncated=truncated
    )