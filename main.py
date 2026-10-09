from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from time import perf_counter
import uvicorn
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.database import check_database
from app.routes import auth, tasks, cloud
from app.core.metrics import record_request

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Task Management Cloud Platform", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip().rstrip('/') for o in settings.ALLOWED_ORIGINS.split(',') if o.strip()],
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def collect_api_metrics(request, call_next):
    started = perf_counter()
    response = await call_next(request)
    record_request(
        status_code=response.status_code,
        latency_ms=(perf_counter() - started) * 1000,
    )
    return response

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(cloud.router, prefix="/api/v1/cloud", tags=["cloud control center"])

@app.get("/")
def root():
    return {"message": "Cloud Backend API Online"}

@app.get("/health")
async def health():
    database = "connected" if await check_database() else "unavailable"
    return {"status": "healthy" if database == "connected" else "degraded", "database": database}

@app.get("/health/database")
async def database_health():
    connected = await check_database()
    return {"status": "connected" if connected else "unavailable"}

@app.get("/health/services")
async def services_health():
    connected = await check_database()
    return {
        "backend": "healthy",
        "database": "connected" if connected else "unavailable",
        "authentication": "operational",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
