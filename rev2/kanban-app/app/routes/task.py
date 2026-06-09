from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.task_service import TaskService

router = APIRouter()


class CreateTaskBody(BaseModel):
    title: str
    columnId: str
    categoryId: str | None = None


def serialize_task(task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "columnId": task.column_id,
        "categoryId": task.category_id,
        "priority": task.priority,
        "scope": task.scope,
        "dueDate": task.due_date,
        "sortKey": task.sort_key,
    }


@router.post("/api/tasks", status_code=201)
def create_task(body: CreateTaskBody, db: Session = Depends(get_db)):
    try:
        task = TaskService(db).create_task(
            title=body.title,
            column_id=body.columnId,
            category_id=body.categoryId,
        )
        db.commit()
        return serialize_task(task)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


class PatchTaskBody(BaseModel):
    title: str | None = None
    priority: str | None = None
    scope: str | None = None
    dueDate: str | None = None
    categoryId: str | None = None

    model_config = {"extra": "forbid"}


@router.patch("/api/tasks/{task_id}")
def patch_task(task_id: str, body: PatchTaskBody, db: Session = Depends(get_db)):
    fields = {k: v for k, v in body.model_dump(exclude_unset=True).items()}
    try:
        task = TaskService(db).patch_task(task_id, fields)
        db.commit()
        return serialize_task(task)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg:
            return JSONResponse(status_code=404, content={"error": msg})
        return JSONResponse(status_code=400, content={"error": msg})
