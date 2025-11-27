"""Authentication dependency for FastAPI routes."""

from typing import Annotated, Optional

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.config import get_settings


async def get_current_user(
    authorization: Optional[str] = Header(default=None, convert_underscores=False),
) -> dict:
    """
    Validate Supabase access token and return user info.
    
    Returns: {"id": str, "email": str | None}
    """
    settings = get_settings()

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token.",
        )

    headers = {
        "apikey": settings.supabase_secret_key,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(
            base_url=str(settings.supabase_url),
            timeout=10,
        ) as client:
            resp = await client.get("/auth/v1/user", headers=headers)

        if resp.status_code != 200:
            detail = "Token validation failed"
            try:
                error_body = resp.json()
                if "message" in error_body:
                    detail = f"Token validation failed: {error_body['message']}"
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail,
            )

        data = resp.json()
        user = {
            "id": data.get("id"),
            "email": data.get("email") or data.get("user_metadata", {}).get("email"),
        }

        if not user["id"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
            )

        return user

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service timeout.",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Authentication service error: {e}",
        )


CurrentUser = Annotated[dict, Depends(get_current_user)]
