from fastapi import APIRouter, HTTPException, Query, Request
from ..db.repos.columns import list_cols, create_col, update_col, delete_col
from ..domain.columns import delete_column_with_disposition
from ._schemas import ColumnOut, ColumnCreate
from typing import List

router = APIRouter()

@router.get("/columns", response_model=List[ColumnOut])
def get_columns():
  return list_cols()

@router.post("/columns", response_model=ColumnOut)
def post_column(col: ColumnCreate):
  return create_col(col.name)

@router.patch("/columns/{col_id}", response_model=ColumnOut)
async def patch_column(col_id: int, request: Request):
  print(f"[PATCH /columns/{col_id}] Request received")
  try:
    data = await request.json()
    print(f"[PATCH] Request body: {data}")
  except Exception as e:
    print(f"[PATCH] Error parsing JSON: {e}")
    raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

  kw = {}
  if 'name' in data and data['name'] is not None:
    kw['name'] = data['name']
    print(f"[PATCH] Will update name to: {data['name']}")
  if 'position' in data and data['position'] is not None:
    kw['position'] = data['position']
    print(f"[PATCH] Will update position to: {data['position']}")
  if 'is_terminal' in data and data['is_terminal'] is not None:
    kw['is_terminal'] = data['is_terminal']
    print(f"[PATCH] Will update is_terminal to: {data['is_terminal']}")

  print(f"[PATCH] Update dict: {kw}")
  if not kw:
    print("[PATCH] ERROR: No fields to update")
    raise HTTPException(status_code=400, detail="no fields to update")

  print(f"[PATCH] Calling update_col({col_id}, {kw})")
  update_col(col_id, **kw)
  rows = list_cols()
  found = [r for r in rows if r['id'] == col_id]
  result = found[0] if found else None
  print(f"[PATCH] Update complete, returning: {result}")
  return result

@router.delete("/columns/{col_id}")
def del_column(col_id: int, disposition: str = Query("delete")):
  if disposition == "delete":
    delete_column_with_disposition(col_id, "delete")
  elif disposition.startswith("move:"):
    delete_column_with_disposition(col_id, disposition)
  else:
    raise HTTPException(status_code=400, detail="invalid disposition")
  return {"ok": True}
