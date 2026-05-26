from pydantic import BaseModel
from typing import Optional, List

class ColumnOut(BaseModel):
  id: int
  name: str
  position: int
  is_terminal: int

class CategoryOut(BaseModel):
  id: int
  name: str

class SubtaskOut(BaseModel):
  id: int
  task_id: int
  body: str
  checked: int
  position: int

class TaskOut(BaseModel):
  id: int
  title: str
  description: Optional[str]
  category_id: int
  column_id: int
  priority: str
  scope: Optional[str]
  due_date: Optional[str]
  due_time: Optional[str]
  position: int
  created_at: str
  updated_at: str
  subtasks: List[SubtaskOut] = []

class StateOut(BaseModel):
  columns: List[ColumnOut]
  categories: List[CategoryOut]
  tasks: List[TaskOut]

class TaskIn(BaseModel):
  title: str
  description: Optional[str] = None
  category_id: int
  column_id: int
  priority: str = "med"
  scope: Optional[str] = None
  due_date: Optional[str] = None
  due_time: Optional[str] = None
