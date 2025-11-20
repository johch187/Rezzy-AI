# LaTeX PDF Generation

The backend exposes `POST /api/latex/compile` to render a small markdown payload into a PDF using **Tectonic**. The endpoint:

- Requires authentication (Supabase bearer token).
- Accepts JSON: `{ "content": "<markdown>", "filename": "resume.pdf" }`.
- Responds with `application/pdf` and a download filename.

### Local setup

1. Install the backend dependency: `pip install -r backend/requirements.txt` (includes `tectonic`).
2. Ensure the `tectonic` binary is available on `PATH` (the PyPI package installs it).
3. Run the FastAPI app; set `ALLOWED_ORIGINS` and Supabase keys in `backend/.env`.

### Frontend usage

The “Download PDF” button in the document editor calls this endpoint via `VITE_API_BASE_URL`. Make sure:
- `VITE_API_BASE_URL` points at your running backend.
- Users are signed in (so the Supabase access token is sent as `Authorization: Bearer ...`).
