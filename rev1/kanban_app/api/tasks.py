from fastapi import APIRouter, HTTPException
from db.repos.tasks import list_tasks, create_task, update_task, delete_task
from db.repos.columns import list_cols
from db.repos.categories import list_cats
from api._schemas import StateOut, TaskIn, TaskOut
from typing import Optional

router = APIRouter()

@router.get("/state", response_model=StateOut)
def get_state():
  cols = list_cols()
  cats = list_cats()
  tasks = list_tasks()
  return StateOut(columns=cols, categories=cats, tasks=tasks)

@router.post("/tasks", response_model=TaskOut)
def post_task(task: TaskIn):
  t = create_task(
    title=task.title,
    category_id=task.category_id,
    column_id=task.column_id,
    priority=task.priority,
    desc=task.description,
    scope=task.scope,
    due_date=task.due_date,
    due_time=task.due_time
  )
  return TaskOut(**t)

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def patch_task(task_id: int, title: Optional[str] = None, description: Optional[str] = None,
               category_id: Optional[int] = None, column_id: Optional[int] = None,
               priority: Optional[str] = None, scope: Optional[str] = None,
               due_date: Optional[str] = None, due_time: Optional[str] = None, position: Optional[int] = None):
  kw = {k: v for k, v in [('title', title), ('description', description), ('category_id', category_id),
                          ('column_id', column_id), ('priority', priority), ('scope', scope),
                          ('due_date', due_date), ('due_time', due_time), ('position', position)] if v is not None}
  if not kw:
    raise HTTPException(status_code=400, detail="no fields to update")
  update_task(task_id, **kw)
  tasks = list_tasks()
  found = [t for t in tasks if t['id'] == task_id]
  return TaskOut(**found[0]) if found else None

@router.delete("/tasks/{task_id}")
def del_task(task_id: int):
  delete_task(task_id)
  return {"ok": True}
