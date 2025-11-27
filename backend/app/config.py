import json
from functools import lru_cache
from typing import List, Optional, Union

from pydantic import Field, HttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase - New API Keys Format Only
    supabase_url: HttpUrl = Field(..., description="Supabase project URL, e.g., https://xyzcompany.supabase.co")
    supabase_secret_key: str = Field(
        ..., 
        description="Supabase secret key (sb_secret_...) for server-side admin operations. Required format: sb_secret_..."
    )
    supabase_publishable_key: Optional[str] = Field(
        None, description="Supabase publishable key (sb_publishable_...) for client-side operations. Required format: sb_publishable_..."
    )

    # Google / LLM
    gemini_api_key: Optional[str] = Field(None, description="Server-side Gemini/ADK API key.")
    gcp_region: Optional[str] = Field(None, description="GCP region for Vertex AI (e.g., us-central1).")

    # CORS
    allowed_origins: List[str] = Field(default_factory=list, description="Allowed origins for CORS.")

    # Frontend serving (optional)
    frontend_dist_dir: Optional[str] = Field(None, description="Path to built frontend assets (for single-container deploy).")

    # GCP / BigQuery
    gcp_project_id: Optional[str] = Field(None, description="GCP project ID for BigQuery.")
    bigquery_dataset: Optional[str] = Field(None, description="BigQuery dataset for analytics events.")
    bigquery_table: Optional[str] = Field(None, description="BigQuery table for analytics events.")

    # Security headers
    csp_policy: Optional[str] = Field(
        None,
        description="Content-Security-Policy header value. Example: default-src 'self'; connect-src 'self' https://...;",
    )

    # Polar payments
    polar_api_key: Optional[str] = Field(None, description="Polar API key")
    polar_webhook_secret: Optional[str] = Field(None, description="Polar webhook secret for signature verification.")
    polar_organization_id: Optional[str] = Field(None, description="Polar organization ID")
    polar_product_price_id: Optional[str] = Field(
        None,
        description="Default Polar product price ID for checkout sessions (plan/variant).",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

    @field_validator("supabase_secret_key")
    @classmethod
    def _validate_secret_key_format(cls, key: str) -> str:
        key = key.strip()
        if not key:
            raise ValueError("Supabase secret key cannot be empty.")
        if not key.startswith("sb_secret_"):
            raise ValueError(
                "Supabase secret key must start with 'sb_secret_'. "
                "Legacy service_role keys are no longer supported. "
                "Get your new secret key from Supabase Dashboard → Project Settings → API → Secret Keys."
            )
        if "publishable" in key.lower():
            raise ValueError("Do not use a publishable key (sb_publishable_...) as the secret key. Use a secret key (sb_secret_...) for backend operations.")
        return key
    
    @field_validator("supabase_publishable_key")
    @classmethod
    def _validate_publishable_key_format(cls, key: Optional[str]) -> Optional[str]:
        if key is None:
            return None
        key = key.strip()
        if not key:
            return None  # treat empty/whitespace env vars as unset
        if not key.startswith("sb_publishable_"):
            raise ValueError(
                "Supabase publishable key must start with 'sb_publishable_'. "
                "Legacy anon keys are no longer supported. "
                "Get your new publishable key from Supabase Dashboard → Project Settings → API → Publishable Keys."
            )
        return key
    
    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """
        Parse allowed_origins from environment variable.
        Supports:
        - JSON format: ["https://example.com","https://another.com"]
        - Comma-separated: https://example.com,https://another.com
        - Single value: https://example.com
        - Empty string: returns empty list
        """
        if isinstance(v, list):
            return v
        if not v or not isinstance(v, str):
            return []
        
        v = v.strip()
        if not v:
            return []
        
        # Try parsing as JSON first
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if item]
            elif isinstance(parsed, str):
                # Single JSON string value
                return [parsed.strip()] if parsed.strip() else []
            else:
                return []
        except (json.JSONDecodeError, TypeError):
            # Not JSON, try comma-separated format
            origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
