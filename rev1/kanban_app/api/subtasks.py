from fastapi import APIRouter, Body
from ..db.repos.tasks import list_tasks
from ..db.repos.subtasks import create_sub, update_sub, delete_sub
from ._schemas import SubtaskOut
from typing import Optional

router = APIRouter()

@router.post("/tasks/{task_id}/subtasks", response_model=SubtaskOut)
def post_subtask(task_id: int, body: str = Body(...)):
  all_tasks = list_tasks()
  task_subs = next((t['subtasks'] for t in all_tasks if t['id'] == task_id), [])
  pos = len(task_subs)
  sub = create_sub(task_id, body, pos)
  return SubtaskOut(**sub)

@router.patch("/subtasks/{sub_id}")
def patch_subtask(sub_id: int, checked: Optional[int] = None):
  if checked is not None:
    update_sub(sub_id, checked=checked)
  return {"ok": True}

@router.delete("/subtasks/{sub_id}")
def del_subtask(sub_id: int):
  delete_sub(sub_id)
  return {"ok": True}
