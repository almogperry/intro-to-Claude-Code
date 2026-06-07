from datetime import datetime
from .connection import get_conn
import sqlite3
from pathlib import Path

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

  # seed example tasks
  c.execute("DELETE FROM tasks")
  now = datetime.now().isoformat()
  c.executemany("INSERT INTO tasks (title, description, category_id, column_id, priority, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    ("[Example] Design new feature", "Create mockups and get feedback", 2, 1, "high", 0, now, now),
    ("[Example] Review pull requests", None, 2, 1, "med", 1, now, now),
    ("[Example] Fix login bug", "Users report session timeout", 2, 0, "high", 0, now, now),
    ("[Example] Update documentation", None, 2, 0, "low", 1, now, now),
  ])

  conn.commit()
  conn.close()

def init_db():
  conn = get_conn()
  c = conn.cursor()

  # check if tables exist
  c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='columns'")
  if not c.fetchone():
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path) as f:
      c.executescript(f.read())

  conn.commit()
  conn.close()

  seed_defaults()
