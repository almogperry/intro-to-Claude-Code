CREATE TABLE IF NOT EXISTS columns (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_terminal INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  column_id INTEGER NOT NULL REFERENCES columns(id),
  priority TEXT NOT NULL CHECK (priority IN ('low','med','high')),
  scope TEXT CHECK (scope IN ('day','week','month','year')),
  due_date TEXT,
  due_time TEXT,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK ((scope IS NULL) = (due_date IS NULL))
);

CREATE TABLE IF NOT EXISTS subtasks (
  id INTEGER PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL
);
