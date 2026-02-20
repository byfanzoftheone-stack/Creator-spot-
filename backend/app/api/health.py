from fastapi import APIRouter, HTTPException
import os
import traceback
from sqlalchemy import text

from ..db import session as db_session

router = APIRouter()


@router.get("/health")
def health():
    return {"ok": True}


# Diagnostic DB check: only enabled when DIAGNOSTIC=1 in env to avoid leaking in prod
@router.get("/__internal/db-check")
def db_check():
    if os.getenv("DIAGNOSTIC", "0") != "1":
        raise HTTPException(status_code=404, detail="Not found")
    try:
        if db_session.engine is None:
            raise RuntimeError("DATABASE_URL is not set")
        with db_session.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "detail": "DB connection successful"}
    except Exception as e:
        # Return full traceback so deployment logs and client can see exact failure
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail={"error": str(e), "trace": tb})
