from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, func

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, nullable=False)

    title: str = Field(nullable=False, max_length=140)
    description: str = Field(default="", max_length=2000)
    status: str = Field(default="todo", max_length=16)  # todo|doing|done
    priority: int = Field(default=2, ge=1, le=3)  # 1 high, 2 med, 3 low
    due_date: Optional[date] = Field(default=None)

    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False))
