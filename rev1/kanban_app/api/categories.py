from fastapi import APIRouter, Query, HTTPException, Request
from ..db.repos.categories import list_cats, create_cat, delete_cat, update_cat
from ..domain.categories import delete_category_with_disposition
from ._schemas import CategoryOut, CategoryCreate
from typing import List

router = APIRouter()

@router.get("/categories", response_model=List[CategoryOut])
def get_categories():
  return list_cats()

@router.post("/categories", response_model=CategoryOut)
def post_category(cat: CategoryCreate):
  return create_cat(cat.name)

@router.patch("/categories/{cat_id}", response_model=CategoryOut)
async def patch_category(cat_id: int, request: Request):
  print(f"[PATCH /categories/{cat_id}] Request received")
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

  print(f"[PATCH] Update dict: {kw}")
  if not kw:
    print("[PATCH] ERROR: No fields to update")
    raise HTTPException(status_code=400, detail="no fields to update")

  print(f"[PATCH] Calling update_cat({cat_id}, {kw})")
  update_cat(cat_id, **kw)
  cats = list_cats()
  found = [c for c in cats if c['id'] == cat_id]
  result = found[0] if found else None
  print(f"[PATCH] Update complete, returning: {result}")
  return result

@router.delete("/categories/{cat_id}")
def del_category(cat_id: int, disposition: str = Query("delete")):
  if disposition == "delete":
    delete_category_with_disposition(cat_id, "delete")
  elif disposition.startswith("move:"):
    delete_category_with_disposition(cat_id, disposition)
  else:
    raise HTTPException(status_code=400, detail="invalid disposition")
  return {"ok": True}
