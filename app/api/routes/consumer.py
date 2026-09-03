"""
Routes for consumer-facing endpoints.

GET /consumer/verify - deterministic lookup for HUID (hallmark), CM/L,
                        or CRS identifiers (technical guide, Phase 3)
POST /consumer/scan  - OCR a photo of a hallmark/ISI mark, extract a
                        candidate identifier, then run it through the
                        same verification as /verify (Scan & Verify
                        feature on verify.html)
"""

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.models.schemas import ScanResult, VerificationResult
from app.services.ocr_service import OCRService
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


@router.post("/scan", response_model=ScanResult)
async def scan_identifier(file: UploadFile = File(...)):
    image_bytes = await file.read()
    service = OCRService()
    return service.scan_and_verify(image_bytes)