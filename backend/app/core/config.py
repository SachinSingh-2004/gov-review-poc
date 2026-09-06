import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "R&D Governance Portal"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Auth configuration
    AUTH_MODE: str = os.getenv("AUTH_MODE", "DEMO") # "DEMO" or "ENTRA_ID"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-governance-demo-key-2026-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Entra ID settings
    ENTRA_TENANT_ID: str = os.getenv("ENTRA_TENANT_ID", "00000000-0000-0000-0000-000000000000")
    ENTRA_CLIENT_ID: str = os.getenv("ENTRA_CLIENT_ID", "00000000-0000-0000-0000-000000000000")
    ENTRA_CLIENT_SECRET: str = os.getenv("ENTRA_CLIENT_SECRET", "mock-secret")

    # Database - default anchors to root workspace database file
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'rd_governance.db'))}")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
