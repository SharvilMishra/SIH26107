"""
OCR service for the "Scan & Verify" camera feature (verify.html).

Extracts a HUID / CM-L / CRS candidate from a photo of a BIS hallmark
or ISI mark, then hands it to VerificationService for the same
shape-check + registry lookup used by manual entry.

Requires the `tesseract-ocr` system binary to be installed alongside
the `pytesseract` pip package -- NOT available on Render's native
Python runtime without switching to a Docker-based deploy. Import and
usage are guarded so a missing binary degrades to a clear error
instead of crashing the app at startup or on every request.
"""

import re
from typing import Any

from app.services.verification_service import (
    VerificationService,
    HUID_PATTERN,
    CML_PATTERN,
)

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

import io


class OCRService:
    def __init__(self):
        self.verifier = VerificationService()

    def scan_and_verify(self, image_bytes: bytes) -> dict[str, Any]:
        if not OCR_AVAILABLE:
            return {
                "type": "unknown",
                "value": "",
                "valid_format": False,
                "verified": None,
                "detail": (
                    "OCR is not available on this deployment (tesseract-ocr "
                    "binary not installed). Use manual entry instead."
                ),
                "ocr_text": "",
                "ocr_available": False,
            }

        try:
            image = Image.open(io.BytesIO(image_bytes))
            ocr_text = pytesseract.image_to_string(image)
        except Exception as exc:
            return {
                "type": "unknown",
                "value": "",
                "valid_format": False,
                "verified": None,
                "detail": f"Could not read the image: {exc}",
                "ocr_text": "",
                "ocr_available": True,
            }

        candidate_type, candidate_value = self._find_candidate(ocr_text)

        if candidate_value is None:
            return {
                "type": "unknown",
                "value": "",
                "valid_format": False,
                "verified": None,
                "detail": "No HUID or license number pattern found in the image.",
                "ocr_text": ocr_text.strip(),
                "ocr_available": True,
            }

        handler = {
            "huid": self.verifier.verify_huid,
            "cml": self.verifier.verify_cml,
        }[candidate_type]
        result = handler(candidate_value)
        result["ocr_text"] = ocr_text.strip()
        result["ocr_available"] = True
        return result

    def _find_candidate(self, text: str) -> tuple[str | None, str | None]:
        """Scan OCR'd text line-by-line for something that looks like a
        HUID (6 alphanumeric) or CM-L/CRS number (7-8 digits)."""
        tokens = re.findall(r"[A-Za-z0-9]{5,8}", text)
        for token in tokens:
            upper = token.upper()
            if HUID_PATTERN.match(upper):
                return "huid", upper
        for token in tokens:
            if CML_PATTERN.match(token):
                return "cml", token
        return None, None