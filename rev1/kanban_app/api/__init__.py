from fastapi import APIRouter
from api.columns import router as cols_router
from api.categories import router as cats_router
from api.tasks import router as tasks_router
from api.subtasks import router as subs_router

router = APIRouter(prefix="/api")
router.include_router(cols_router)
router.include_router(cats_router)
router.include_router(tasks_router)
router.include_router(subs_router)
