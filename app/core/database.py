from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class DB:
    client = None
    db = None

db_ctx = DB()
logger = logging.getLogger(__name__)

async def connect_to_mongo():
    db_ctx.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_ctx.db = db_ctx.client[settings.MONGODB_DB_NAME]
    await db_ctx.client.admin.command("ping")
    await db_ctx.db.organizations.create_index("name")
    await db_ctx.db.users.create_index([("tenant_id", 1), ("email", 1)], unique=True)
    await db_ctx.db.tasks.create_index([("tenant_id", 1), ("status", 1)])
    await db_ctx.db.tasks.create_index([("tenant_id", 1), ("created_at", -1)])
    await db_ctx.db.tasks.create_index([("tenant_id", 1), ("project_id", 1)])
    await db_ctx.db.audit_logs.create_index([("tenant_id", 1), ("created_at", -1)])
    logger.info("MongoDB connected", extra={"database": settings.MONGODB_DB_NAME})
    
async def close_mongo_connection():
    if db_ctx.client:
        db_ctx.client.close()
        
def get_db():
    return db_ctx.db

async def check_database():
    if db_ctx.client is None or db_ctx.db is None:
        return False
    try:
        await db_ctx.client.admin.command("ping")
        return True
    except Exception:
        logger.exception("MongoDB health check failed")
        return False
