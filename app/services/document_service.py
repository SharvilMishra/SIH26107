"""
Extracts plain text from an uploaded document (PDF, DOCX, or TXT) so it
can be passed as extra `context` to the chat endpoint.
"""

import io

from pypdf import PdfReader
from docx import Document

MAX_CHARS = 8000  # keep the extracted text bounded before it goes to the LLM


class DocumentService:
    def extract_text(self, filename: str, file_bytes: bytes) -> tuple[str, bool]:
        """Returns (text, was_truncated)."""
        lower_name = filename.lower()

        if lower_name.endswith(".pdf"):
            text = self._extract_pdf(file_bytes)
        elif lower_name.endswith(".docx"):
            text = self._extract_docx(file_bytes)
        elif lower_name.endswith(".txt"):
            text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise ValueError(
                f"Unsupported file type for '{filename}'. Use .pdf, .docx, or .txt."
            )

        truncated = len(text) > MAX_CHARS
        return text[:MAX_CHARS], truncated

    def _extract_pdf(self, file_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    def _extract_docx(self, file_bytes: bytes) -> str:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)