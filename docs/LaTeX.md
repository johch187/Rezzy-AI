# LaTeX PDF Generation

The backend exposes `POST /api/latex/compile` to render a small markdown payload into a PDF using **Tectonic**. The endpoint:

- Requires authentication (Supabase bearer token).
- Accepts JSON: `{ "content": "<markdown>", "filename": "resume.pdf" }`.
- Responds with `application/pdf` and a download filename.

### Installation

- Local: install the Tectonic binary via your OS package manager (e.g., `apt-get install tectonic`). It is not installed from `requirements.txt`.
- Docker: the provided Dockerfile installs Tectonic via `apt-get`.

### Frontend usage

The “Download PDF” button in the document editor calls this endpoint via `VITE_API_BASE_URL`. Make sure:
- `VITE_API_BASE_URL` points at your running backend.
- Users are signed in (so the Supabase access token is sent as `Authorization: Bearer ...`).
