import os
import shutil

APP_DIR = "c:/Users/Preet/Desktop/Ac/CT/taskmanager/taskflow-main/app"
shutil.rmtree(APP_DIR, ignore_errors=True)
os.makedirs(APP_DIR, exist_ok=True)
os.makedirs(os.path.join(APP_DIR, "core"), exist_ok=True)
os.makedirs(os.path.join(APP_DIR, "models"), exist_ok=True)
os.makedirs(os.path.join(APP_DIR, "routes"), exist_ok=True)

# 1. config.py
with open(os.path.join(APP_DIR, "core", "config.py"), "w") as f:
    f.write("""import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "taskflow_cloud"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key")
    JWT_ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")

settings = Settings()
""")

# 2. database.py
with open(os.path.join(APP_DIR, "core", "database.py"), "w") as f:
    f.write("""from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class DB:
    client = None
    db = None

db_ctx = DB()

async def connect_to_mongo():
    db_ctx.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_ctx.db = db_ctx.client[settings.MONGODB_DB_NAME]
    
async def close_mongo_connection():
    if db_ctx.client:
        db_ctx.client.close()
        
def get_db():
    return db_ctx.db
""")

# 3. security.py
with open(os.path.join(APP_DIR, "core", "security.py"), "w") as f:
    f.write("""from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        role = payload.get("role")
        if user_id is None or tenant_id is None:
            raise HTTPException(status_code=401)
        return {"user_id": user_id, "tenant_id": tenant_id, "role": role}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
""")

# 4. models
with open(os.path.join(APP_DIR, "models", "__init__.py"), "w") as f:
    f.write("""from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskSchema(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
""")

# 5. routes/auth.py
with open(os.path.join(APP_DIR, "routes", "auth.py"), "w") as f:
    f.write("""from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from bson import ObjectId

router = APIRouter()

class RegisterReq(BaseModel):
    email: str
    password: str
    full_name: str
    organization_name: str

class LoginReq(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterReq, db=Depends(get_db)):
    org = await db.organizations.insert_one({"name": req.organization_name})
    tenant_id = str(org.inserted_id)
    
    user = {
        "email": req.email,
        "password_hash": get_password_hash(req.password),
        "full_name": req.full_name,
        "tenant_id": tenant_id,
        "role": "admin"
    }
    res = await db.users.insert_one(user)
    return {"message": "Registered", "user_id": str(res.inserted_id)}

@router.post("/login")
async def login(req: LoginReq, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user["_id"]), "tenant_id": user["tenant_id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": {"id": str(user["_id"]), "tenant_id": user["tenant_id"], "role": user["role"]}}
""")

# 6. routes/tasks.py
with open(os.path.join(APP_DIR, "routes", "tasks.py"), "w") as f:
    f.write("""from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import TaskSchema
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_tasks(user=Depends(get_current_user), db=Depends(get_db)):
    tasks = []
    async for t in db.tasks.find({"tenant_id": user["tenant_id"]}):
        t["_id"] = str(t["_id"])
        tasks.append(t)
    return {"tasks": tasks}

@router.post("/")
async def create_task(task: TaskSchema, user=Depends(get_current_user), db=Depends(get_db)):
    task_dict = task.model_dump()
    task_dict["tenant_id"] = user["tenant_id"]
    task_dict["created_by"] = user["user_id"]
    res = await db.tasks.insert_one(task_dict)
    
    await db.audit_logs.insert_one({
        "tenant_id": user["tenant_id"],
        "action": "TASK_CREATED",
        "user_id": user["user_id"],
        "task_id": str(res.inserted_id)
    })
    
    return {"id": str(res.inserted_id)}

@router.get("/{task_id}")
async def get_task(task_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    t = await db.tasks.find_one({"_id": ObjectId(task_id), "tenant_id": user["tenant_id"]})
    if not t:
        raise HTTPException(status_code=404)
    t["_id"] = str(t["_id"])
    return t
""")

# 7. routes/cloud.py (Cloud Control Center)
with open(os.path.join(APP_DIR, "routes", "cloud.py"), "w") as f:
    f.write("""from fastapi import APIRouter, Depends
from app.core.database import get_db

router = APIRouter()

@router.get("/metrics")
async def get_metrics(db=Depends(get_db)):
    tenants = await db.organizations.count_documents({})
    users = await db.users.count_documents({})
    tasks = await db.tasks.count_documents({})
    
    return {
        "status": "healthy",
        "metrics": {
            "active_tenants": tenants,
            "active_users": users,
            "tasks": tasks,
            "backend": "HEALTHY",
            "database": "CONNECTED",
            "latency_ms": 45 # simulated
        }
    }
    
@router.post("/simulate")
async def simulate(db=Depends(get_db)):
    # Generate a demo tenant
    res = await db.organizations.insert_one({"name": "Demo Cloud Corp"})
    t_id = str(res.inserted_id)
    
    await db.users.insert_one({"email": "demo@cloud.com", "password_hash": "test", "full_name": "Demo", "tenant_id": t_id, "role": "admin"})
    
    for i in range(10):
        await db.tasks.insert_one({"title": f"Demo task {i}", "tenant_id": t_id, "status": "pending"})
        
    return {"message": "Simulation executed", "tenant_id": t_id}
""")

print("Simplified app created successfully")
