from pathlib import Path

PORT = 8000

_DB_PATH = Path(__file__).resolve().parents[1] / "kanban.db"
DATABASE_URL = f"sqlite:///{_DB_PATH}"
