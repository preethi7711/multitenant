import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

async def record_event(db, *, tenant_id, user_id, action, resource, resource_id=None, status="success", **details):
    event = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "action": action,
        "resource": resource,
        "resource_id": resource_id,
        "status": status,
        "created_at": datetime.now(timezone.utc),
        **details,
    }
    await db.audit_logs.insert_one(event)
    logger.info(action, extra={"tenant_id": tenant_id, "user_id": user_id, "resource": resource, "status": status})
