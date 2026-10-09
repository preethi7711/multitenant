import os
import shutil

APP_DIR = "c:/Users/Preet/Desktop/Ac/CT/taskmanager/taskflow-main/app"

# 1. Update config.py
config_code = """from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List
import secrets

class Settings(BaseSettings):
    APP_NAME: str = "Task Management System"
    APP_ENV: str = "development"
    DEBUG: bool = False
    API_VERSION: str = "v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # MongoDB Database
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string (e.g. Atlas free tier)"
    )
    MONGODB_DB_NAME: str = "taskflow_cloud"

    JWT_SECRET_KEY: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="Secret key for JWT signing"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:8000"
    CORS_ALLOW_CREDENTIALS: bool = True

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, list):
            return ",".join(v)
        return v

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()
"""
with open(os.path.join(APP_DIR, "core", "config.py"), "w") as f:
    f.write(config_code)


# 2. Update database.py
db_code = """import structlog
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = structlog.get_logger()

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_client = Database()

async def init_db():
    try:
        db_client.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_client.db = db_client.client[settings.MONGODB_DB_NAME]
        
        # Create indexes
        await db_client.db.organizations.create_index("name")
        await db_client.db.users.create_index("email", unique=True)
        await db_client.db.users.create_index([("organization_id", 1)])
        await db_client.db.tasks.create_index([("organization_id", 1)])
        await db_client.db.tasks.create_index([("assigned_to", 1)])
        await db_client.db.audit_logs.create_index([("organization_id", 1), ("created_at", -1)])
        
        logger.info("database_initialized", db=settings.MONGODB_DB_NAME)
    except Exception as e:
        logger.error("database_initialization_failed", error=str(e))
        raise

async def close_db():
    if db_client.client:
        db_client.client.close()
        logger.info("database_connections_closed")

def get_db():
    return db_client.db
"""
with open(os.path.join(APP_DIR, "core", "database.py"), "w") as f:
    f.write(db_code)


# 3. Write purely Pydantic models for MongoDB (replace SQLAlchemy)
os.makedirs(os.path.join(APP_DIR, "models"), exist_ok=True)

models_base = """from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class MongoBaseModel(BaseModel):
    id: str = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True)
"""
with open(os.path.join(APP_DIR, "models", "base.py"), "w") as f:
    f.write(models_base)

models_domain = """from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.base import MongoBaseModel

class Organization(MongoBaseModel):
    name: str
    is_active: bool = True

class User(MongoBaseModel):
    organization_id: str
    email: str
    password_hash: str
    full_name: str
    role: str # 'admin' or 'member'
    is_active: bool = True

class Task(MongoBaseModel):
    organization_id: str
    assigned_to: str
    created_by: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None

class AuditLog(MongoBaseModel):
    organization_id: str
    user_id: Optional[str]
    action: str
    entity_type: str
    entity_id: str
"""
with open(os.path.join(APP_DIR, "models", "__init__.py"), "w") as f:
    f.write("from app.models.base import MongoBaseModel\\n")
with open(os.path.join(APP_DIR, "models", "domain.py"), "w") as f:
    f.write(models_domain)

print("Backend DB Layer replaced successfully.")
