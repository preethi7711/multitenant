"""Seed repeatable MongoDB data for the classroom demonstration."""

import asyncio
from datetime import datetime, timezone

from app.core.database import close_mongo_connection, connect_to_mongo, get_db
from app.core.security import get_password_hash

PASSWORD = "Password123!"


async def upsert_user(db, *, email, full_name, role, tenant_id):
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "full_name": full_name,
                "role": role,
                "tenant_id": tenant_id,
                "password_hash": get_password_hash(PASSWORD),
                "demo": True,
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
        },
        upsert=True,
    )
    return await db.users.find_one({"email": email})


async def seed_demo_data():
    await connect_to_mongo()
    db = get_db()
    try:
        now = datetime.now(timezone.utc)
        tenants = {
            "Organization A": "admin_a@demo.com",
            "Organization B": "admin_b@demo.com",
        }
        tenant_ids = {}

        for name in tenants:
            await db.organizations.update_one(
                {"name": name},
                {"$set": {"demo": True}, "$setOnInsert": {"created_at": now}},
                upsert=True,
            )
            organization = await db.organizations.find_one({"name": name})
            tenant_ids[name] = str(organization["_id"])

        admin_a = await upsert_user(
            db, email="admin_a@demo.com", full_name="Admin A",
            role="admin", tenant_id=tenant_ids["Organization A"]
        )
        member_a = await upsert_user(
            db, email="member_a@demo.com", full_name="Member A",
            role="member", tenant_id=tenant_ids["Organization A"]
        )
        admin_b = await upsert_user(
            db, email="admin_b@demo.com", full_name="Admin B",
            role="admin", tenant_id=tenant_ids["Organization B"]
        )

        demo_tasks = [
            {
                "tenant_id": tenant_ids["Organization A"],
                "created_by": str(admin_a["_id"]),
                "assigned_to": str(admin_a["_id"]),
                "title": "Admin A Task",
                "description": "Created by Admin A for the tenant-isolation demonstration.",
                "status": "pending",
                "priority": "high",
            },
            {
                "tenant_id": tenant_ids["Organization A"],
                "created_by": str(admin_a["_id"]),
                "assigned_to": str(member_a["_id"]),
                "title": "Task for Member A",
                "description": "Assigned to Member A to demonstrate member permissions.",
                "status": "in_progress",
                "priority": "medium",
            },
            {
                "tenant_id": tenant_ids["Organization B"],
                "created_by": str(admin_b["_id"]),
                "assigned_to": str(admin_b["_id"]),
                "title": "Secret Org B Task",
                "description": "This must not be visible from Organization A.",
                "status": "completed",
                "priority": "urgent",
            },
        ]
        for task in demo_tasks:
            await db.tasks.update_one(
                {"tenant_id": task["tenant_id"], "title": task["title"]},
                {"$set": {**task, "updated_at": now}, "$setOnInsert": {"created_at": now}},
                upsert=True,
            )

        print("Demo data is ready.")
        print("All demo passwords:", PASSWORD)
        print("Admin A: admin_a@demo.com")
        print("Member A: member_a@demo.com")
        print("Admin B: admin_b@demo.com")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
