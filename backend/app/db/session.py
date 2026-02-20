from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.engine import Engine
from sqlalchemy import text
import logging
from ..core.config import settings

logger = logging.getLogger("saas.db")

def _normalize_db_url(url: str) -> str:
    # Railway sometimes provides postgres:// which SQLAlchemy wants as postgresql://
    if not url:
        return ""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = _normalize_db_url(settings.DATABASE_URL)


# Create engine and verify connectivity at import/startup so failures are explicit
engine: Engine | None
if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)  # type: ignore
        # Try a short lived connection to validate credentials/host
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database engine created and connection test succeeded")
    except Exception:
        # Log full traceback so deployment logs include the actual DB error
        logger.exception("Failed creating DB engine or connecting to database")
        # Re-raise so startup fails loudly and caller sees exact exception
        raise
else:
    engine = None
    logger.error("DATABASE_URL is not set or empty")


def init_db() -> None:
    if engine is None:
        raise RuntimeError("DATABASE_URL is not set")
    SQLModel.metadata.create_all(engine)


def get_session():
    if engine is None:
        raise RuntimeError("DATABASE_URL is not set")
    with Session(engine) as session:
        yield session
