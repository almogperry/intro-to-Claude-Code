from fastapi import APIRouter, Body
from ..db.repos.categories import list_cats, create_cat, delete_cat
from ._schemas import CategoryOut
from typing import List

router = APIRouter()

@router.get("/categories", response_model=List[CategoryOut])
def get_categories():
  return list_cats()

@router.post("/categories", response_model=CategoryOut)
def post_category(name: str = Body(...)):
  return create_cat(name)

@router.delete("/categories/{cat_id}")
def del_category(cat_id: int):
  delete_cat(cat_id)
  return {"ok": True}
