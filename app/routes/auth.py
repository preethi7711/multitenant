from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.audit import record_event
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone

router = APIRouter()

class RegisterReq(BaseModel):
    email: str
    password: str
    full_name: str
    organization_name: str

class LoginReq(BaseModel):
    email: str
    password: str

def auth_payload(user: dict) -> dict:
    token = create_access_token({
        "sub": str(user["_id"]),
        "tenant_id": user["tenant_id"],
        "role": user["role"],
    })
    return {
        "data": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "tenant_id": user["tenant_id"],
            "role": user["role"],
            "tokens": {
                "access_token": token,
                "token_type": "bearer",
            },
        }
    }

@router.post("/register")
async def register(req: RegisterReq, db=Depends(get_db)):
    try:
        org = await db.organizations.insert_one({
            "name": req.organization_name,
            "created_at": datetime.now(timezone.utc),
        })
        tenant_id = str(org.inserted_id)
        user = {
            "email": req.email.lower().strip(),
            "password_hash": get_password_hash(req.password),
            "full_name": req.full_name.strip(),
            "tenant_id": tenant_id,
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        }
        res = await db.users.insert_one(user)
        user["_id"] = res.inserted_id
        await record_event(db, tenant_id=tenant_id, user_id=str(res.inserted_id),
                           action="TENANT_CREATED", resource="organization",
                           resource_id=tenant_id)
        return auth_payload(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

@router.post("/login")
async def login(req: LoginReq, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user["password_hash"]):
        if user:
            await record_event(db, tenant_id=user.get("tenant_id"), user_id=str(user["_id"]),
                               action="LOGIN_FAILED", resource="authentication", status="failure")
        raise HTTPException(status_code=400, detail="Invalid credentials")

    await record_event(db, tenant_id=user["tenant_id"], user_id=str(user["_id"]),
                       action="USER_LOGIN", resource="authentication")
    return auth_payload(user)
