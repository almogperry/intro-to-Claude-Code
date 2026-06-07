from ..connection import get_conn

def get_col(col_id):
  conn = get_conn()
  row = conn.execute("SELECT * FROM columns WHERE id = ?", (col_id,)).fetchone()
  conn.close()
  return dict(row) if row else None

def list_cols():
  conn = get_conn()
  rows = conn.execute("SELECT * FROM columns ORDER BY position").fetchall()
  conn.close()
  return [dict(r) for r in rows]

def create_col(name):
  conn = get_conn()
  c = conn.cursor()
  min_terminal_pos = c.execute("SELECT MIN(position) FROM columns WHERE is_terminal = 1").fetchone()[0]
  if min_terminal_pos is not None:
    c.execute("UPDATE columns SET position = position + 1 WHERE position >= ?", (min_terminal_pos,))
    pos = min_terminal_pos
  else:
    max_pos = c.execute("SELECT MAX(position) FROM columns").fetchone()[0] or -1
    pos = max_pos + 1
  c.execute("INSERT INTO columns (name, position, is_terminal) VALUES (?, ?, 0)", (name, pos))
  conn.commit()
  cid = c.lastrowid
  conn.close()
  return {'id': cid, 'name': name, 'position': pos, 'is_terminal': 0}

def update_col(col_id, **kw):
  conn = get_conn()
  for k, v in kw.items():
    conn.execute(f"UPDATE columns SET {k} = ? WHERE id = ?", (v, col_id))
  conn.commit()
  conn.close()

def delete_col(col_id):
  conn = get_conn()
  conn.execute("DELETE FROM columns WHERE id = ?", (col_id,))
  conn.commit()
  conn.close()
