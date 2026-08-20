from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application configuration, sourced from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str
    gemini_model: str = "gemini-3.5-flash"

    supabase_url: str
    supabase_jwt_audience: str = "authenticated"

    cors_origins: str = "*"

    log_level: str = "INFO"
    log_json: bool = False

    weather_geocode_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    weather_forecast_url: str = "https://api.open-meteo.com/v1/forecast"
    http_timeout_seconds: float = 10.0
    geocode_cache_ttl_seconds: int = 3600
    geocode_cache_size: int = 256

    rate_limit_per_minute: int = 60

    api_prefix: str = "/api/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # fields are sourced from env/.env at runtime
