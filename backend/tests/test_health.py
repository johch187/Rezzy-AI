import anyio
from httpx import ASGITransport, AsyncClient

from app.main import app


def test_health():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/healthz")
        assert resp.status_code == 200
        assert resp.json().get("status") == "ok"

    anyio.run(_run)
