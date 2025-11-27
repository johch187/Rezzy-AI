"""LaTeX PDF generation service using Tectonic."""

import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Final

SAFE_CHAR_LIMIT: Final[int] = 20000


def _escape_latex(text: str) -> str:
    """Escape LaTeX control characters."""
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    escaped = "".join(replacements.get(ch, ch) for ch in text)
    # Remove potential security exploits
    escaped = re.sub(r"\\(write18|input|include)\b", "", escaped, flags=re.IGNORECASE)
    return escaped


def _markdown_to_latex(markdown: str) -> str:
    """Convert simple markdown to LaTeX."""
    lines = markdown.splitlines()
    body_parts = []
    list_buffer = []

    def flush_list():
        nonlocal list_buffer
        if list_buffer:
            items = "\n".join([f"\\item {_escape_latex(item)}" for item in list_buffer])
            body_parts.append("\\begin{itemize}\n" + items + "\n\\end{itemize}")
            list_buffer = []

    for raw in lines:
        line = raw.strip()
        if not line:
            flush_list()
            body_parts.append("")
            continue

        if line.startswith("# "):
            flush_list()
            body_parts.append(f"\\section*{{{_escape_latex(line[2:].strip())}}}")
        elif line.startswith("## "):
            flush_list()
            body_parts.append(f"\\subsection*{{{_escape_latex(line[3:].strip())}}}")
        elif line.startswith("- "):
            list_buffer.append(line[2:].strip())
        else:
            flush_list()
            body_parts.append(_escape_latex(line))

    flush_list()
    body = "\n\n".join(body_parts)

    return r"""
\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{hyperref}
\usepackage{enumitem}
\setlist[itemize]{leftmargin=*}
\begin{document}
%s
\end{document}
""" % body


def compile_markdown_to_pdf(markdown: str) -> bytes:
    """Compile markdown to PDF using Tectonic."""
    if not markdown:
        raise ValueError("No content provided.")
    if len(markdown) > SAFE_CHAR_LIMIT:
        raise ValueError(f"Content exceeds {SAFE_CHAR_LIMIT} character limit.")
    if shutil.which("tectonic") is None:
        raise RuntimeError("Tectonic not installed.")

    latex_source = _markdown_to_latex(markdown)

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = Path(tmpdir) / "resume.tex"
        tex_path.write_text(latex_source, encoding="utf-8")

        result = subprocess.run(
            ["tectonic", "-o", tmpdir, tex_path.name],
            cwd=tmpdir,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            raise RuntimeError(f"Tectonic failed: {result.stderr or result.stdout}")

        pdf_path = Path(tmpdir) / "resume.pdf"
        if not pdf_path.exists():
            raise RuntimeError("PDF not generated.")

        return pdf_path.read_bytes()
