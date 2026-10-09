import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "taskflow_cloud"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", os.getenv("JWT_SECRET", "super-secret-key"))
    JWT_ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
    ALLOWED_ORIGIN_REGEX: str | None = os.getenv("ALLOWED_ORIGIN_REGEX")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    MAX_SIMULATION_ITEMS: int = int(os.getenv("MAX_SIMULATION_ITEMS", "100"))

settings = Settings()
