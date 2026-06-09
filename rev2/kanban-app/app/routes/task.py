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
