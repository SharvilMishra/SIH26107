"""
Pydantic request/response schemas shared across routes.

One block per domain, matching the collections/tables in
docs/schema.md and the endpoint table in docs/PRD.md.
"""

from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------

class ChatQuery(BaseModel):
    query: str
    language: str = "en"
    context: Optional[str] = None  # extracted text from an uploaded document, if any


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []


class DocumentUploadResponse(BaseModel):
    filename: str
    extracted_text: str
    truncated: bool


# ---------------------------------------------------------------------
# Standards
# ---------------------------------------------------------------------

class Clause(BaseModel):
    id: str
    standard_id: Optional[str] = None
    clause_number: str
    text: str
    page_number: Optional[int] = None


class CertificationSchemeSummary(BaseModel):
    id: str
    name: str


class Standard(BaseModel):
    id: str
    standard_number: str
    title: str
    category: Optional[str] = None
    keywords: list[str] = []
    source_pdf_url: Optional[str] = None


class StandardDetail(Standard):
    clauses: list[Clause] = []
    schemes: list[CertificationSchemeSummary] = []


# ---------------------------------------------------------------------
# Certification schemes
# ---------------------------------------------------------------------

class FeeItem(BaseModel):
    label: str
    amount: float
    unit: str


class SchemeStep(BaseModel):
    step_number: int
    title: str
    description: str


class CertificationScheme(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    steps: list[SchemeStep] = []
    documents_required: list[str] = []
    fee_structure: list[FeeItem] = []


# ---------------------------------------------------------------------
# Labs
# ---------------------------------------------------------------------

class Lab(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    recognized_for: list[str] = []
    contact: Optional[str] = None
    distance_km: Optional[float] = None  # populated only for proximity search


# ---------------------------------------------------------------------
# Consumer verification (HUID / CM-L / CRS)
# ---------------------------------------------------------------------

class VerificationRequest(BaseModel):
    type: str  # "huid" | "cml" | "crs"
    value: str


class VerificationResult(BaseModel):
    type: str
    value: str
    valid_format: bool
    verified: Optional[bool] = None
    detail: str | dict = ""


class ScanResult(BaseModel):
    type: str
    value: str
    valid_format: bool
    verified: Optional[bool] = None
    detail: str | dict = ""
    ocr_text: str = ""
    ocr_available: bool = True