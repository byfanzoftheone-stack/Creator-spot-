from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel import Session

from ..db.session import get_session
from ..models.activity import ActivityLog
from ..models.user import User
from .deps import get_current_user


router = APIRouter(tags=["overseer"])


class OverseerIn(BaseModel):
    idea: str = Field(min_length=1, max_length=5000)


class OverseerOut(BaseModel):
    approval: str


def _review_idea(idea: str) -> str:
    text = idea.strip()
    # Lightweight, deterministic reviewer so the feature works without external AI keys.
    # (You can swap this later with an LLM call behind a feature flag.)
    score = 0
    if len(text) >= 80:
        score += 1
    if any(k in text.lower() for k in ["user", "customer", "client", "tenant", "admin"]):
        score += 1
    if any(k in text.lower() for k in ["stripe", "billing", "payment", "subscription"]):
        score += 1
    if any(k in text.lower() for k in ["mvp", "scope", "phase", "milestone"]):
        score += 1

    if score >= 3:
        verdict = "APPROVED"
        tone = "Strong signal. This is clear enough to break into tasks and ship."
    elif score == 2:
        verdict = "CONDITIONAL"
        tone = "Close. Add acceptance criteria + data model changes, then we can greenlight."
    else:
        verdict = "REJECTED"
        tone = "Too vague. Add: who it's for, what screen/flow changes, and what success looks like."

    return (
        f"{verdict}\n\n"
        f"{tone}\n\n"
        "Checklist:\n"
        "- Who is the user (role)?\n"
        "- What is the exact workflow?\n"
        "- What data is created/updated?\n"
        "- What are the edge cases?\n"
        "- What does success look like (metrics)?\n"
    )


@router.post("/oversee", response_model=OverseerOut)
def oversee(
    payload: OverseerIn,
    session: Session = Depends(get_session),
    current: User = Depends(get_current_user),
):
    approval = _review_idea(payload.idea)
    # Log usage for traceability.
    session.add(ActivityLog(user_id=current.id, action="Submitted idea to Overseer"))
    session.commit()
    return OverseerOut(approval=approval)
