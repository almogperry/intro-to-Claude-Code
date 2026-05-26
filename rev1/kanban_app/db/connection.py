import sqlite3
from config import DB_PATH

def get_conn():
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  return conn

def init_db():
  conn = get_conn()
  with open(DB_PATH.parent / "db" / "schema.sql") as f:
    conn.executescript(f.read())
  conn.commit()
  conn.close()
