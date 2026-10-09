from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskSchema(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
