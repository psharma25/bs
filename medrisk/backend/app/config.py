from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="MEDTECH_", extra="ignore")

    environment: str = "production"
    database_url: str = "postgresql+psycopg://medtech:medtech@db:5432/medtech"
    admin_token: str = "change-me"
    cors_origins: str = "http://localhost:8000"
    refresh_hours: int = 168


@lru_cache
def settings() -> Settings:
    return Settings()
