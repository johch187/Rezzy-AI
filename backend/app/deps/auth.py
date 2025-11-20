from typing import Annotated, Optional

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.config import get_settings


async def get_current_user(
    authorization: Optional[str] = Header(default=None, convert_underscores=False),
):
    """
    Validates the Supabase access token by calling the auth admin endpoint with the service role key.
    Returns minimal user info dict {id, email}.
    """
    settings = get_settings()
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token.")

    # Supabase Admin: GET /auth/v1/user with the access token
    admin_headers = {
        "apiKey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    user_headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(base_url=str(settings.supabase_url), headers=admin_headers, timeout=10) as client:
        resp = await client.get("/auth/v1/user", headers=user_headers)

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Supabase token validation failed.")

    data = resp.json()
    user = {
        "id": data.get("id"),
        "email": data.get("email") or data.get("user_metadata", {}).get("email"),
    }
    if not user["id"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Supabase user not found.")
    return user


CurrentUser = Annotated[dict, Depends(get_current_user)]
