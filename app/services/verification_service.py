"""
Deterministic verification service (technical guide, Phase 3).

Validates hallmark (HUID) and license (CM/L, CRS) identifiers WITHOUT
relying on LLM memory -- regex shape-check first, then (when
BIS_CARE_BASE_URL is configured) a live lookup against the BIS Care
public registry. This is the tool the LLM/RAG layer calls into via
function calling when a query mentions one of these identifiers.
"""

import re
from typing import Any, Literal

import httpx

from app.core.config import BIS_CARE_BASE_URL

HUID_PATTERN = re.compile(r"^[A-Z0-9]{6}$")
CML_PATTERN = re.compile(r"^\d{7,8}$")
CRS_PATTERN = re.compile(r"^\d{7,8}$")

VerificationType = Literal["huid", "cml", "crs"]


class VerificationService:
    """Shape-validates then (optionally) live-verifies BIS identifiers."""

    def __init__(self):
        self._client = httpx.Client(base_url=BIS_CARE_BASE_URL, timeout=10.0) if BIS_CARE_BASE_URL else None

    def verify_huid(self, huid: str) -> dict[str, Any]:
        return self._verify(huid.strip().upper(), HUID_PATTERN, "huid", "/huid/verify")

    def verify_cml(self, license_number: str) -> dict[str, Any]:
        return self._verify(license_number.strip(), CML_PATTERN, "cml", "/cml/verify")

    def verify_crs(self, registration_number: str) -> dict[str, Any]:
        return self._verify(registration_number.strip(), CRS_PATTERN, "crs", "/crs/verify")

    def _verify(
        self,
        value: str,
        pattern: re.Pattern,
        vtype: VerificationType,
        endpoint: str,
    ) -> dict[str, Any]:
        if not pattern.match(value):
            return {
                "type": vtype,
                "value": value,
                "valid_format": False,
                "verified": False,
                "detail": f"'{value}' does not match the expected {vtype.upper()} format.",
            }

        if self._client is None:
            # No registry endpoint configured -- format is valid, but we
            # cannot confirm it against the live BIS Care registry yet.
            return {
                "type": vtype,
                "value": value,
                "valid_format": True,
                "verified": None,
                "detail": "Format valid. Live registry check not configured (set BIS_CARE_BASE_URL).",
            }

        try:
            response = self._client.get(endpoint, params={"number": value})
            response.raise_for_status()
            data = response.json()
            return {
                "type": vtype,
                "value": value,
                "valid_format": True,
                "verified": bool(data.get("active", False)),
                "detail": data,
            }
        except httpx.HTTPError as exc:
            return {
                "type": vtype,
                "value": value,
                "valid_format": True,
                "verified": None,
                "detail": f"Registry lookup failed: {exc}",
            }
