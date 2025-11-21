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

    @field_validator("supabase_service_role_key")
    @classmethod
    def _service_role_not_publishable(cls, key: str) -> str:
        if "publishable" in key:
            raise ValueError("Use the service role key on the backend; do not supply a publishable key here.")
        return key


@lru_cache
def get_settings() -> Settings:
    return Settings()
