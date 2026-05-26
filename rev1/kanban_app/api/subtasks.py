from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from ..db.repos.tasks import list_tasks
from ..db.repos.subtasks import create_sub, update_sub, delete_sub
from ._schemas import SubtaskOut
from typing import Optional

class SubtaskCreate(BaseModel):
  body: str

class SubtaskUpdate(BaseModel):
  checked: Optional[int] = None

router = APIRouter()

@router.post("/tasks/{task_id}/subtasks", response_model=SubtaskOut)
def post_subtask(task_id: int, payload: SubtaskCreate):
  all_tasks = list_tasks()
  task_subs = next((t['subtasks'] for t in all_tasks if t['id'] == task_id), [])
  if any(s['body'] == payload.body for s in task_subs):
    raise HTTPException(status_code=400, detail="Subtask already exist")
  pos = len(task_subs)
  sub = create_sub(task_id, payload.body, pos)
  return SubtaskOut(**sub)

@router.patch("/subtasks/{sub_id}")
def patch_subtask(sub_id: int, payload: SubtaskUpdate):
  if payload.checked is not None:
    update_sub(sub_id, checked=payload.checked)
  return {"ok": True}

@router.delete("/subtasks/{sub_id}")
def del_subtask(sub_id: int):
  delete_sub(sub_id)
  return {"ok": True}
