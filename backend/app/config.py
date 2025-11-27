"""Application configuration using pydantic-settings."""

import json
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, HttpUrl, field_validator, computed_field
from pydantic_settings import BaseSettings


def parse_origins(value: Optional[str]) -> List[str]:
    """Parse origins from JSON array, comma-separated, or single value."""
    if not value:
        return []
    value = value.strip()
    if not value:
        return []
    # Try JSON first
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if item]
        elif isinstance(parsed, str):
            return [parsed.strip()] if parsed.strip() else []
        return []
    except (json.JSONDecodeError, TypeError):
        # Comma-separated fallback
        return [origin.strip() for origin in value.split(",") if origin.strip()]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: HttpUrl = Field(..., description="Supabase project URL")
    supabase_secret_key: str = Field(..., description="Supabase secret key (sb_secret_...)")
    supabase_publishable_key: Optional[str] = Field(None, description="Supabase publishable key")

    # Google Cloud / Vertex AI
    gcp_project_id: Optional[str] = Field(None, description="GCP project ID")
    gcp_region: Optional[str] = Field(None, description="GCP region (default: europe-north1)")
    gemini_api_key: Optional[str] = Field(None, description="Gemini API key (dev fallback)")
    gemini_model_name: Optional[str] = Field(None, description="Gemini model (default: gemini-3-pro-preview)")

    # BigQuery Analytics
    bigquery_dataset: Optional[str] = Field(None, description="BigQuery dataset")
    bigquery_table: Optional[str] = Field(None, description="BigQuery table")

    # CORS - stored as string, parsed via property
    allowed_origins_raw: Optional[str] = Field(None, alias="allowed_origins", description="CORS allowed origins")
    
    @computed_field
    @property
    def allowed_origins(self) -> List[str]:
        """Parse allowed origins from raw string."""
        return parse_origins(self.allowed_origins_raw)

    # Frontend serving
    frontend_dist_dir: Optional[str] = Field(None, description="Path to built frontend assets")

    # Security headers
    csp_policy: Optional[str] = Field(None, description="Content-Security-Policy header")

    # Polar payments
    polar_api_key: Optional[str] = Field(None, description="Polar API key")
    polar_webhook_secret: Optional[str] = Field(None, description="Polar webhook secret")
    polar_organization_id: Optional[str] = Field(None, description="Polar organization ID")
    polar_product_price_id: Optional[str] = Field(None, description="Polar product price ID")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    @field_validator("supabase_secret_key")
    @classmethod
    def _validate_secret_key(cls, key: str) -> str:
        key = key.strip()
        if not key:
            raise ValueError("Supabase secret key cannot be empty.")
        if not key.startswith("sb_secret_"):
            raise ValueError(
                "Supabase secret key must start with 'sb_secret_'. "
                "Get it from: Supabase Dashboard → Project Settings → API → Secret Keys"
            )
        return key

    @field_validator("supabase_publishable_key")
    @classmethod
    def _validate_publishable_key(cls, key: Optional[str]) -> Optional[str]:
        if not key:
            return None
        key = key.strip()
        if not key:
            return None
        if not key.startswith("sb_publishable_"):
            raise ValueError("Supabase publishable key must start with 'sb_publishable_'")
        return key



@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
