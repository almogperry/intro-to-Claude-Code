from fastapi import APIRouter, HTTPException
from ..db.repos.tasks import list_tasks, create_task, update_task, delete_task
from ..db.repos.columns import list_cols
from ..db.repos.categories import list_cats
from ._schemas import StateOut, TaskIn, TaskOut, TaskUpdate
from ..domain.tasks import calc_insert_position, get_default_due_date
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
  # Auto-populate due_date if scope is set but due_date is not
  due_date = task.due_date
  due_time = task.due_time
  if task.scope and not due_date:
    due_date, due_time = get_default_due_date(task.scope)

  # Validate: if scope is set, both due_date and due_time must be set
  if task.scope and (not due_date or not due_time):
    raise HTTPException(status_code=400, detail="scope requires due_date and due_time")

  all_tasks = list_tasks()
  col_tasks = [t for t in all_tasks if t['column_id'] == task.column_id]
  pos = calc_insert_position(col_tasks, task.priority, due_date)

  t = create_task(
    title=task.title,
    category_id=task.category_id,
    column_id=task.column_id,
    priority=task.priority,
    desc=task.description,
    scope=task.scope,
    due_date=due_date,
    due_time=due_time
  )
  update_task(t['id'], position=pos)
  t['position'] = pos
  t['subtasks'] = []
  return TaskOut(**t)

@router.patch("/tasks/{task_id}", response_model=TaskOut)
def patch_task(task_id: int, update: TaskUpdate):
  updates = update.model_dump(exclude_unset=True)
  if not updates:
    raise HTTPException(status_code=400, detail="no fields to update")

  # Auto-populate due_date if scope is set but due_date is not
  tasks = list_tasks()
  task = next((t for t in tasks if t['id'] == task_id), None)
  if task and 'scope' in updates:
    scope = updates['scope']
    due_date = updates.get('due_date', task.get('due_date'))

    if scope and not due_date:
      # Auto-populate due_date based on scope
      new_due_date, new_due_time = get_default_due_date(scope)
      updates['due_date'] = new_due_date
      updates['due_time'] = new_due_time
    elif not scope:
      # If clearing scope, also clear due_date
      updates['due_date'] = None
      updates['due_time'] = None

  # Validate: if scope is set, both due_date and due_time must be set
  final_scope = updates.get('scope', task.get('scope') if task else None)
  final_due_date = updates.get('due_date', task.get('due_date') if task else None)
  final_due_time = updates.get('due_time', task.get('due_time') if task else None)

  if final_scope and (not final_due_date or not final_due_time):
    raise HTTPException(status_code=400, detail="scope requires due_date and due_time")

  update_task(task_id, **updates)
  tasks = list_tasks()
  found = [t for t in tasks if t['id'] == task_id]
  return TaskOut(**found[0]) if found else None

@router.delete("/tasks/{task_id}")
def del_task(task_id: int):
  delete_task(task_id)
  return {"ok": True}
