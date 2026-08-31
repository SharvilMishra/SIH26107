"""
Routes for certification-related endpoints.

GET /certification/{scheme} - certification scheme steps, docs checklist, fees
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import CertificationScheme
from app.services.supabase_service import SupabaseService

router = APIRouter()


@router.get("/{scheme}", response_model=CertificationScheme)
def get_certification_scheme(scheme: str):
    """`scheme` is the scheme name, e.g. 'ISI Mark', 'CRS', 'FMCS',
    'Hallmarking', 'LRS' (case-insensitive)."""
    db = SupabaseService()
    result = db.get_scheme(scheme)
    if not result:
        raise HTTPException(status_code=404, detail=f"Certification scheme '{scheme}' not found.")
    return result
