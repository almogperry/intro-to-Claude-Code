from fastapi import APIRouter, HTTPException
from db.repos.columns import list_cols, create_col, update_col, delete_col
from api._schemas import ColumnOut
from typing import List

router = APIRouter()

@router.get("/columns", response_model=List[ColumnOut])
def get_columns():
  return list_cols()

@router.post("/columns", response_model=ColumnOut)
def post_column(name: str):
  return create_col(name)

@router.patch("/columns/{col_id}", response_model=ColumnOut)
def patch_column(col_id: int, name: str = None, position: int = None, is_terminal: int = None):
  kw = {k: v for k, v in [('name', name), ('position', position), ('is_terminal', is_terminal)] if v is not None}
  if not kw:
    raise HTTPException(status_code=400, detail="no fields to update")
  update_col(col_id, **kw)
  rows = list_cols()
  found = [r for r in rows if r['id'] == col_id]
  return found[0] if found else None

@router.delete("/columns/{col_id}")
def del_column(col_id: int):
  delete_col(col_id)
  return {"ok": True}
