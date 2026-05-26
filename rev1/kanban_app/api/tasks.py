from fastapi import APIRouter, HTTPException
from db.repos.tasks import list_tasks, create_task, update_task, delete_task
from db.repos.columns import list_cols
from db.repos.categories import list_cats
from api._schemas import StateOut, TaskIn, TaskOut, TaskUpdate
from domain.tasks import calc_insert_position
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
  all_tasks = list_tasks()
  col_tasks = [t for t in all_tasks if t['column_id'] == task.column_id]
  pos = calc_insert_position(col_tasks, task.priority, task.due_date)

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
  update_task(t['id'], position=pos)
  t['position'] = pos
  t['subtasks'] = []
  return TaskOut(**t)

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def patch_task(task_id: int, update: TaskUpdate):
  updates = {k: v for k, v in update.dict().items() if v is not None}
  if not updates:
    raise HTTPException(status_code=400, detail="no fields to update")

  # Enforce scope/due_date pairing: both set or both null
  if 'scope' in updates or 'due_date' in updates:
    tasks = list_tasks()
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task:
      scope = updates.get('scope', task.get('scope'))
      due_date = updates.get('due_date', task.get('due_date'))

      # If one is being set, both must be set; if one is null, both must be null
      if (scope is None) != (due_date is None):
        # Sync: if scope is set but due_date unset (or vice versa), unset the scope
        if scope and not due_date:
          updates['scope'] = None
        elif due_date and not scope:
          updates['due_date'] = None

  update_task(task_id, **updates)
  tasks = list_tasks()
  found = [t for t in tasks if t['id'] == task_id]
  return TaskOut(**found[0]) if found else None

@router.delete("/tasks/{task_id}")
def del_task(task_id: int):
  delete_task(task_id)
  return {"ok": True}
