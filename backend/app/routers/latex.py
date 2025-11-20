from typing import Optional

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from app.deps.auth import CurrentUser
from app.services.latex import compile_markdown_to_pdf

router = APIRouter(prefix="/api/latex", tags=["latex"])


class CompileRequest(BaseModel):
    content: str
    filename: Optional[str] = None


@router.post("/compile")
async def compile_resume(req: CompileRequest, user: CurrentUser):
    """
    Compile markdown content into a PDF resume using Tectonic.
    """
    try:
        pdf_bytes = compile_markdown_to_pdf(req.content)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate PDF.")

    filename = req.filename or "resume.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
