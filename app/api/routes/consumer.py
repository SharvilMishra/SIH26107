"""
Routes for consumer-facing endpoints.

GET /consumer/verify - deterministic lookup for HUID (hallmark), CM/L,
                        or CRS identifiers (technical guide, Phase 3)
"""

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import VerificationResult
from app.services.verification_service import VerificationService

router = APIRouter()

_VERIFIERS = {"huid", "cml", "crs"}


@router.get("/verify", response_model=VerificationResult)
def verify_identifier(
    type: str = Query(..., description="One of: huid, cml, crs"),
    value: str = Query(..., description="The identifier to verify"),
):
    type_lower = type.lower()
    if type_lower not in _VERIFIERS:
        raise HTTPException(status_code=400, detail=f"type must be one of {sorted(_VERIFIERS)}")

    service = VerificationService()
    handler = {
        "huid": service.verify_huid,
        "cml": service.verify_cml,
        "crs": service.verify_crs,
    }[type_lower]
    return handler(value)
