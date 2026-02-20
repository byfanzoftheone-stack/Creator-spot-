from datetime import datetime, timezone, date as date_type
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.task import Task
from ..models.user import User
from ..schemas.stats import StatsOut
from .deps import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("", response_model=StatsOut)
def stats(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
    tasks = session.exec(select(Task).where(Task.user_id == current.id)).all()
    total = len(tasks)
    todo = sum(1 for t in tasks if t.status == "todo")
    doing = sum(1 for t in tasks if t.status == "doing")
    done = sum(1 for t in tasks if t.status == "done")

    today = datetime.now(timezone.utc).date()
    done_today = 0
    for t in tasks:
        if t.status == "done":
            # approximate: if updated today
            try:
                if t.updated_at.astimezone(timezone.utc).date() == today:
                    done_today += 1
            except Exception:
                pass

    # simple score: 10 points per done today + 2 points per doing - 1 per todo (min 0 max 100)
    score = max(0, min(100, done_today * 10 + doing * 2 - todo * 1))
    return StatsOut(total=total, todo=todo, doing=doing, done=done, done_today=done_today, productivity_score=score)
