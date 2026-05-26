import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "kanban.db"
PORT = 8000
TITLE_MAX = 200