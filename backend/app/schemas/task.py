from datetime import date
from typing import Optional
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: int = 2
    due_date: Optional[date] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[date] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: int
    due_date: Optional[date]
    created_at: str
    updated_at: str
