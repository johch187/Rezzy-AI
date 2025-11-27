"""Document generation request/response models."""

from typing import Any, Optional

from pydantic import BaseModel

from app.schemas.profile import ProfileData


class GenerationOptions(BaseModel):
    jobDescription: str
    generateResume: bool
    generateCoverLetter: bool
    resumeLength: str
    coverLetterLength: str
    includeSummary: bool
    tone: str
    technicality: int
    thinkingMode: bool
    uploadedResume: Optional[str] = None
    uploadedCoverLetter: Optional[str] = None


class GeneratedDocuments(BaseModel):
    resume: Optional[str] = None
    coverLetter: Optional[str] = None
    analysis: Optional[Any] = None


class GenerateDocumentsRequest(BaseModel):
    profile: ProfileData
    options: GenerationOptions
