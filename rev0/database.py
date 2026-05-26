import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "jobs.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    url TEXT,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK(status IN ('applied','phone_screen','interview','offer','rejected')),
    applied_date TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    linkedin TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS update_applications_updated_at
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    UPDATE applications SET updated_at = datetime('now') WHERE id = NEW.id;
END;
"""


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = _connect()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()


def get_db():
    conn = _connect()
    try:
        yield conn
    finally:
        conn.close()
