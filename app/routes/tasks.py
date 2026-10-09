from datetime import datetime, timezone
import math

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.audit import record_event
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import TaskSchema

router = APIRouter()


def valid_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=404, detail="Task not found")
    return ObjectId(value)


async def same_tenant_user(db, user_id: str, tenant_id: str) -> bool:
    return ObjectId.is_valid(user_id) and bool(
        await db.users.find_one({"_id": ObjectId(user_id), "tenant_id": tenant_id}, {"_id": 1})
    )


@router.get("/")
async def get_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: str = None,
    priority: str = None,
    search: str = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    query = {"tenant_id": user["tenant_id"]}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    total = await db.tasks.count_documents(query)
    sort_dir = -1 if sort_order == "desc" else 1
    sort_field = sort_by if sort_by in ["created_at", "title", "status", "priority", "due_date"] else "_id"
    cursor = db.tasks.find(query).sort(sort_field, sort_dir).skip((page - 1) * limit).limit(limit)
    tasks = []
    async for task in cursor:
        task["id"] = str(task.pop("_id"))
        tasks.append(task)
    return {
        "success": True,
        "data": tasks,
        "pagination": {
            "page": page,
            "page_size": limit,
            "total_items": total,
            "total_pages": math.ceil(total / limit) if total else 0,
        },
    }


@router.post("/")
async def create_task(task: TaskSchema, user=Depends(get_current_user), db=Depends(get_db)):
    task_dict = task.model_dump()
    assigned_to = task_dict.get("assigned_to")
    if assigned_to and not await same_tenant_user(db, assigned_to, user["tenant_id"]):
        raise HTTPException(status_code=403, detail="Assignee must belong to your organization")
    now = datetime.now(timezone.utc)
    task_dict.update({
        "tenant_id": user["tenant_id"],
        "created_by": user["user_id"],
        "created_at": now,
        "updated_at": now,
    })
    result = await db.tasks.insert_one(task_dict)
    task_id = str(result.inserted_id)
    task_dict.pop("_id", None)
    await record_event(db, tenant_id=user["tenant_id"], user_id=user["user_id"],
                       action="TASK_CREATED", resource="task", resource_id=task_id)
    task_dict["id"] = task_id
    return {"success": True, "data": task_dict}


@router.get("/audit-logs")
async def audit_logs(
    action: str = None,
    user_id: str = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    user=Depends(require_roles("admin")),
    db=Depends(get_db),
):
    query = {"tenant_id": user["tenant_id"]}
    if action:
        query["action"] = action
    if user_id:
        query["user_id"] = user_id
    total = await db.audit_logs.count_documents(query)
    cursor = db.audit_logs.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    logs = [log async for log in cursor]
    return {"success": True, "data": logs, "pagination": {"page": page, "page_size": limit, "total_items": total}}


@router.get("/{task_id}")
async def get_task(task_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    task = await db.tasks.find_one({"_id": valid_object_id(task_id), "tenant_id": user["tenant_id"]})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task["id"] = str(task.pop("_id"))
    return {"success": True, "data": task}


@router.put("/{task_id}")
async def update_task(task_id: str, task: TaskSchema, user=Depends(get_current_user), db=Depends(get_db)):
    object_id = valid_object_id(task_id)
    existing = await db.tasks.find_one({"_id": object_id, "tenant_id": user["tenant_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    if user["role"] == "member" and existing.get("created_by") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Members can update only tasks they created")
    changes = task.model_dump(exclude_unset=True)
    assigned_to = changes.get("assigned_to")
    if assigned_to and not await same_tenant_user(db, assigned_to, user["tenant_id"]):
        raise HTTPException(status_code=403, detail="Assignee must belong to your organization")
    changes["updated_at"] = datetime.now(timezone.utc)
    await db.tasks.update_one({"_id": object_id}, {"$set": changes})
    await record_event(db, tenant_id=user["tenant_id"], user_id=user["user_id"],
                       action="TASK_UPDATED", resource="task", resource_id=task_id)
    return {"success": True, "data": {**existing, **changes, "id": task_id, "_id": None}}


@router.delete("/{task_id}")
async def delete_task(task_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    object_id = valid_object_id(task_id)
    existing = await db.tasks.find_one({"_id": object_id, "tenant_id": user["tenant_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    if user["role"] == "member" and existing.get("created_by") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Members can delete only tasks they created")
    await db.tasks.delete_one({"_id": object_id, "tenant_id": user["tenant_id"]})
    await record_event(db, tenant_id=user["tenant_id"], user_id=user["user_id"],
                       action="TASK_DELETED", resource="task", resource_id=task_id)
    return {"success": True, "data": None}
