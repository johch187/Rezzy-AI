from functools import lru_cache
from typing import List, Optional

from pydantic import Field, HttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: HttpUrl = Field(..., description="Supabase project URL, e.g., https://xyzcompany.supabase.co")
    supabase_service_role_key: str = Field(..., description="Supabase service role key (server-side only).")
    supabase_publishable_key: Optional[str] = Field(
        None, description="Supabase publishable key (client-facing replacement for anon key)."
    )

    # Google / LLM
    gemini_api_key: Optional[str] = Field(None, description="Server-side Gemini/ADK API key.")

    # CORS
    allowed_origins: List[str] = Field(default_factory=list, description="Allowed origins for CORS.")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

    @field_validator("supabase_service_role_key")
    @classmethod
    def _service_role_not_publishable(cls, key: str) -> str:
        if "publishable" in key:
            raise ValueError("Use the service role key on the backend; do not supply a publishable key here.")
        return key


@lru_cache
def get_settings() -> Settings:
    return Settings()
