from ..connection import get_conn
from datetime import datetime

def list_tasks():
  conn = get_conn()
  tasks = conn.execute("SELECT * FROM tasks ORDER BY column_id, position").fetchall()
  result = []
  for t in tasks:
    task = dict(t)
    subs = conn.execute("SELECT * FROM subtasks WHERE task_id = ? ORDER BY position", (task['id'],)).fetchall()
    task['subtasks'] = [dict(s) for s in subs]
    result.append(task)
  conn.close()
  return result

def create_task(title, category_id, column_id, priority="med", desc=None, scope=None, due_date=None, due_time=None):
  conn = get_conn()
  c = conn.cursor()
  max_pos = c.execute("SELECT MAX(position) FROM tasks WHERE column_id = ?", (column_id,)).fetchone()[0] or -1
  pos = max_pos + 1
  now = datetime.utcnow().isoformat()
  c.execute(
    "INSERT INTO tasks (title, description, category_id, column_id, priority, scope, due_date, due_time, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    (title, desc, category_id, column_id, priority, scope, due_date, due_time, pos, now, now)
  )
  conn.commit()
  tid = c.lastrowid
  conn.close()
  return {
    'id': tid, 'title': title, 'description': desc, 'category_id': category_id, 'column_id': column_id,
    'priority': priority, 'scope': scope, 'due_date': due_date, 'due_time': due_time, 'position': pos,
    'created_at': now, 'updated_at': now, 'subtasks': []
  }

def update_task(task_id, **kw):
  conn = get_conn()
  kw['updated_at'] = datetime.utcnow().isoformat()
  for k, v in kw.items():
    if v is not None:
      conn.execute(f"UPDATE tasks SET {k} = ? WHERE id = ?", (v, task_id))
  conn.commit()
  conn.close()

def delete_task(task_id):
  conn = get_conn()
  conn.execute("DELETE FROM subtasks WHERE task_id = ?", (task_id,))
  conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
  conn.commit()
  conn.close()
