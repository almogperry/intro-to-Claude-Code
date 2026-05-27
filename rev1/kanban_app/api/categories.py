from fastapi import APIRouter, Body, Query, HTTPException
from ..db.repos.categories import list_cats, create_cat, delete_cat, update_cat
from ..domain.categories import delete_category_with_disposition
from ._schemas import CategoryOut
from typing import List

router = APIRouter()

@router.get("/categories", response_model=List[CategoryOut])
def get_categories():
  return list_cats()

@router.post("/categories", response_model=CategoryOut)
def post_category(name: str = Body(...)):
  return create_cat(name)

@router.patch("/categories/{cat_id}", response_model=CategoryOut)
def patch_category(cat_id: int, name: str = None):
  if name is None:
    raise HTTPException(status_code=400, detail="no fields to update")
  update_cat(cat_id, name=name)
  cats = list_cats()
  found = [c for c in cats if c['id'] == cat_id]
  return found[0] if found else None

@router.delete("/categories/{cat_id}")
def del_category(cat_id: int, disposition: str = Query("delete")):
  if disposition == "delete":
    delete_category_with_disposition(cat_id, "delete")
  elif disposition.startswith("move:"):
    delete_category_with_disposition(cat_id, disposition)
  else:
    raise HTTPException(status_code=400, detail="invalid disposition")
  return {"ok": True}
