from ..db.repos.categories import get_cat, delete_cat as delete_cat_repo
from ..db.repos.tasks import list_tasks, update_task

def delete_category_with_disposition(cat_id: int, disposition: str):
  """Delete category, handling tasks based on disposition.

  disposition: "delete" or "move:{target_cat_id}"
  """
  cat = get_cat(cat_id)
  if not cat:
    raise ValueError(f"Category {cat_id} not found")

  tasks = [t for t in list_tasks() if t['category_id'] == cat_id]

  if disposition == "delete":
    # Delete all tasks in this category
    for task in tasks:
      from ..db.repos.tasks import delete_task
      delete_task(task['id'])
  elif disposition.startswith("move:"):
    # Move all tasks to another category
    target_cat_id = int(disposition.split(":")[1])
    for task in tasks:
      update_task(task['id'], category_id=target_cat_id)
  else:
    raise ValueError(f"Invalid disposition: {disposition}")

  delete_cat_repo(cat_id)
