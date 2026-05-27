from ..db.repos.columns import get_col, update_col as update_col_repo, delete_col as delete_col_repo
from ..db.repos.tasks import list_tasks, update_task

def delete_column_with_disposition(col_id: int, disposition: str):
  """Delete column, handling tasks based on disposition.

  disposition: "delete" or "move:{target_col_id}"
  """
  col = get_col(col_id)
  if not col:
    raise ValueError(f"Column {col_id} not found")

  tasks = [t for t in list_tasks() if t['column_id'] == col_id]

  if disposition == "delete":
    # Delete all tasks in this column
    for task in tasks:
      from ..db.repos.tasks import delete_task
      delete_task(task['id'])
  elif disposition.startswith("move:"):
    # Move all tasks to another column
    target_col_id = int(disposition.split(":")[1])
    for task in tasks:
      update_task(task['id'], column_id=target_col_id)
  else:
    raise ValueError(f"Invalid disposition: {disposition}")

  delete_col_repo(col_id)
