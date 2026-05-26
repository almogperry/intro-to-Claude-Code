from datetime import datetime
from db.connection import get_conn
import sqlite3

def seed_defaults():
  conn = get_conn()
  c = conn.cursor()

  # seed columns
  c.execute("DELETE FROM columns")
  c.executemany("INSERT INTO columns (name, position, is_terminal) VALUES (?, ?, ?)", [
    ("To Do", 0, 0),
    ("Doing", 1, 0),
    ("Completed", 2, 1),
  ])

  # seed categories
  c.execute("DELETE FROM categories")
  c.executemany("INSERT INTO categories (name) VALUES (?)", [
    ("personal",),
    ("work/study",),
  ])

  conn.commit()
  conn.close()

def init_db():
  conn = get_conn()
  c = conn.cursor()

  # check if tables exist
  c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='columns'")
  if not c.fetchone():
    with open("db/schema.sql") as f:
      c.executescript(f.read())

  conn.commit()
  conn.close()

  seed_defaults()
