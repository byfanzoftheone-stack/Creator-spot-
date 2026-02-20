from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..schemas.auth import RegisterIn, LoginIn, TokenOut, MeOut
from ..core.security import hash_password, verify_password, create_access_token
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(email=payload.email.lower(), hashed_password=hash_password(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_access_token(str(user.id))
    return TokenOut(access_token=token)

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return TokenOut(access_token=token)

@router.get("/me", response_model=MeOut)
def me(current: User = Depends(get_current_user)):
    return MeOut(id=current.id, email=current.email)
