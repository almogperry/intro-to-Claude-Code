from db.connection import get_conn

def list_cats():
  conn = get_conn()
  rows = conn.execute("SELECT * FROM categories ORDER BY id").fetchall()
  conn.close()
  return [dict(r) for r in rows]

def create_cat(name):
  conn = get_conn()
  conn.execute("INSERT INTO categories (name) VALUES (?)", (name,))
  conn.commit()
  cid = conn.lastrowid
  conn.close()
  return {'id': cid, 'name': name}

def delete_cat(cat_id):
  conn = get_conn()
  conn.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
  conn.commit()
  conn.close()
