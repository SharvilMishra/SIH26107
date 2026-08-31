"""
Routes for standards-related endpoints.

GET /standards            - search/list standards (by keyword, category)
GET /standards/{id}       - standard detail + clauses + linked schemes
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import Standard, StandardDetail
from app.services.supabase_service import SupabaseService

router = APIRouter()


@router.get("/", response_model=list[Standard])
def list_standards(
    keyword: Optional[str] = Query(None, description="Free-text match against title/keywords"),
    category: Optional[str] = Query(None, description="e.g. 'packaging', 'electrical', 'toys'"),
    limit: int = Query(20, le=100),
):
    db = SupabaseService()
    return db.list_standards(keyword=keyword, category=category, limit=limit)


@router.get("/{standard_id}", response_model=StandardDetail)
def get_standard(standard_id: str):
    db = SupabaseService()
    standard = db.get_standard(standard_id)
    if not standard:
        raise HTTPException(status_code=404, detail=f"Standard '{standard_id}' not found.")
    return standard
