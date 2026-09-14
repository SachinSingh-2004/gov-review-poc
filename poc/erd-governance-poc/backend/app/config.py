import os

class Settings:
    PROJECT_NAME: str = "R&D Governance Portal POC"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    # Default to SQLite for easy execution, configurable via ENV
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./poc_governance.db")

settings = Settings()
