from ..connection import get_conn

def get_cat(cat_id):
  conn = get_conn()
  row = conn.execute("SELECT * FROM categories WHERE id = ?", (cat_id,)).fetchone()
  conn.close()
  return dict(row) if row else None

def list_cats():
  conn = get_conn()
  rows = conn.execute("SELECT * FROM categories ORDER BY id").fetchall()
  conn.close()
  return [dict(r) for r in rows]

def create_cat(name):
  conn = get_conn()
  c = conn.cursor()
  c.execute("INSERT INTO categories (name) VALUES (?)", (name,))
  conn.commit()
  cid = c.lastrowid
  conn.close()
  return {'id': cid, 'name': name}

def update_cat(cat_id, **kw):
  conn = get_conn()
  for k, v in kw.items():
    conn.execute(f"UPDATE categories SET {k} = ? WHERE id = ?", (v, cat_id))
  conn.commit()
  conn.close()

def delete_cat(cat_id):
  conn = get_conn()
  conn.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
  conn.commit()
  conn.close()
