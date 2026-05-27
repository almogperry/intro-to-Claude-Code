from fastapi import APIRouter, HTTPException, Body, Query
from ..db.repos.columns import list_cols, create_col, update_col, delete_col
from ..domain.columns import delete_column_with_disposition
from ._schemas import ColumnOut, ColumnCreate, ColumnUpdate
from typing import List

router = APIRouter()

@router.get("/columns", response_model=List[ColumnOut])
def get_columns():
  return list_cols()

@router.post("/columns", response_model=ColumnOut)
def post_column(col: ColumnCreate):
  return create_col(col.name)

@router.patch("/columns/{col_id}", response_model=ColumnOut)
def patch_column(col_id: int, col: ColumnUpdate):
  kw = col.model_dump(exclude_unset=True)
  if not kw:
    raise HTTPException(status_code=400, detail="no fields to update")
  update_col(col_id, **kw)
  rows = list_cols()
  found = [r for r in rows if r['id'] == col_id]
  return found[0] if found else None

@router.delete("/columns/{col_id}")
def del_column(col_id: int, disposition: str = Query("delete")):
  if disposition == "delete":
    delete_column_with_disposition(col_id, "delete")
  elif disposition.startswith("move:"):
    delete_column_with_disposition(col_id, disposition)
  else:
    raise HTTPException(status_code=400, detail="invalid disposition")
  return {"ok": True}
