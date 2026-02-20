from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from .core.config import settings
from .db.session import init_db
from .api.api import api_router

logger = logging.getLogger("saas.app")
logging.basicConfig()
logger.setLevel(logging.INFO)

app = FastAPI(title="By: FanzoftheOne — Productivity API", version="1.0.0")


class ExceptionLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception("Unhandled exception during request %s %s", request.method, request.url)
            raise


origins = [o.strip() for o in (settings.CORS_ORIGINS or "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception logging middleware so unhandled errors are logged with traceback
app.add_middleware(ExceptionLoggingMiddleware)


@app.on_event("startup")
def on_startup():
    logger.info("Starting application; CORS origins: %s", origins or ["*"])
    # init_db will raise if DATABASE_URL missing or connection fails — that's intentional
    init_db()


app.include_router(api_router)


@app.get("/health")
def root_health():
    return {"ok": True}
