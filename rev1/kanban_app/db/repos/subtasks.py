from db.connection import get_conn

def create_sub(task_id, body, position):
  conn = get_conn()
  c = conn.cursor()
  c.execute(
    "INSERT INTO subtasks (task_id, body, checked, position) VALUES (?, ?, 0, ?)",
    (task_id, body, position)
  )
  conn.commit()
  sub_id = c.lastrowid
  conn.close()
  return {'id': sub_id, 'task_id': task_id, 'body': body, 'checked': 0, 'position': position}

def update_sub(sub_id, **kw):
  conn = get_conn()
  for k, v in kw.items():
    conn.execute(f"UPDATE subtasks SET {k} = ? WHERE id = ?", (v, sub_id))
  conn.commit()
  conn.close()

def delete_sub(sub_id):
  conn = get_conn()
  conn.execute("DELETE FROM subtasks WHERE id = ?", (sub_id,))
  conn.commit()
  conn.close()
