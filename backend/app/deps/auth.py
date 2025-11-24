from typing import Annotated, Optional

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.config import get_settings


async def get_current_user(
    authorization: Optional[str] = Header(default=None, convert_underscores=False),
):
    """
    Validates the Supabase access token by calling the auth admin endpoint.
    Uses new secret key format (sb_secret_...) for admin operations.
    Returns minimal user info dict {id, email}.
    """
    settings = get_settings()
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token.")

    # Supabase Admin API: Use apikey header with secret key (sb_secret_...),
    # and Authorization header with the user's access token.
    # The apikey header authenticates the admin request,
    # while Authorization contains the user token to validate.
    headers = {
        "apikey": settings.supabase_secret_key,  # Secret key (sb_secret_...)
        "Authorization": f"Bearer {token}",  # User's access token
    }

    try:
        async with httpx.AsyncClient(base_url=str(settings.supabase_url), timeout=10) as client:
            resp = await client.get("/auth/v1/user", headers=headers)

        if resp.status_code != 200:
            error_detail = f"Supabase token validation failed (status {resp.status_code})"
            try:
                error_body = resp.json()
                if "message" in error_body:
                    error_detail = f"Supabase token validation failed: {error_body.get('message')}"
            except:
                error_text = resp.text[:200] if resp.text else ""
                if error_text:
                    error_detail = f"Supabase token validation failed: {error_text}"
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_detail)

        data = resp.json()
        user = {
            "id": data.get("id"),
            "email": data.get("email") or data.get("user_metadata", {}).get("email"),
        }
        if not user["id"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Supabase user not found.")
        return user
    except httpx.TimeoutException:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase authentication service timeout.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Supabase authentication service error: {str(e)}")


CurrentUser = Annotated[dict, Depends(get_current_user)]
