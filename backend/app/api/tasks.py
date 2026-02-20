from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.task import Task
from ..models.activity import ActivityLog
from ..models.user import User
from ..schemas.task import TaskCreate, TaskUpdate, TaskOut
from .deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

def _validate_status(status_str: str) -> str:
    allowed = {"todo", "doing", "done"}
    if status_str not in allowed:
        raise HTTPException(status_code=400, detail="status must be todo|doing|done")
    return status_str

@router.get("", response_model=list[TaskOut])
def list_tasks(
    session: Session = Depends(get_session),
    current: User = Depends(get_current_user),
):
    tasks = session.exec(select(Task).where(Task.user_id == current.id).order_by(Task.created_at.desc())).all()
    return [
        TaskOut(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            created_at=t.created_at.isoformat(),
            updated_at=t.updated_at.isoformat(),
        )
        for t in tasks
    ]

@router.post("", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    session: Session = Depends(get_session),
    current: User = Depends(get_current_user),
):
    status_str = _validate_status(payload.status)
    task = Task(
        user_id=current.id,
        title=payload.title.strip(),
        description=(payload.description or "").strip(),
        status=status_str,
        priority=int(payload.priority),
        due_date=payload.due_date,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    session.add(ActivityLog(user_id=current.id, action=f"Created task: {task.title}", task_id=task.id))
    session.commit()
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat(),
    )

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    session: Session = Depends(get_session),
    current: User = Depends(get_current_user),
):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.description is not None:
        task.description = payload.description.strip()
    if payload.status is not None:
        task.status = _validate_status(payload.status)
    if payload.priority is not None:
        task.priority = int(payload.priority)
    if payload.due_date is not None or payload.due_date is None:
        task.due_date = payload.due_date

    session.add(task)
    session.commit()
    session.refresh(task)

    session.add(ActivityLog(user_id=current.id, action=f"Updated task: {task.title}", task_id=task.id))
    session.commit()

    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat(),
    )

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current: User = Depends(get_current_user),
):
    task = session.exec(select(Task).where(Task.id == task_id, Task.user_id == current.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.add(ActivityLog(user_id=current.id, action=f"Deleted task: {task.title}", task_id=task.id))
    session.commit()
    return {"ok": True}
