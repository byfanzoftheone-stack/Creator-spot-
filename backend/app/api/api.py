from fastapi import APIRouter
from .health import router as health
from .auth import router as auth
from .tasks import router as tasks
from .stats import router as stats

api_router = APIRouter(prefix="/api")
api_router.include_router(health)
api_router.include_router(auth)
api_router.include_router(tasks)
api_router.include_router(stats)
