from fastapi import APIRouter
from .columns import router as cols_router
from .categories import router as cats_router
from .tasks import router as tasks_router
from .subtasks import router as subs_router

router = APIRouter(prefix="/api")
router.include_router(cols_router)
router.include_router(cats_router)
router.include_router(tasks_router)
router.include_router(subs_router)
