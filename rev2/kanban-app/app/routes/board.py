from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Board
from app.services.board_service import BoardService

router = APIRouter()


def _serialize_task(t) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "columnId": t.column_id,
        "categoryId": t.category_id,
        "priority": t.priority,
        "scope": t.scope,
        "dueDate": t.due_date,
        "sortKey": t.sort_key,
    }


def serialize_board(board: Board) -> dict:
    tasks = [t for col in board.columns for t in col.tasks]
    return {
        "id": board.id,
        "terminalColumnId": board.terminal_column_id,
        "categories": [
            {"id": c.id, "name": c.name} for c in board.categories
        ],
        "columns": [
            {
                "id": c.id,
                "name": c.name,
                "isTerminal": c.is_terminal,
                "position": c.position,
            }
            for c in sorted(board.columns, key=lambda c: c.position)
        ],
        "tasks": [_serialize_task(t) for t in tasks],
        "subtasks": [],
    }


@router.get("/api/board")
def get_board(db: Session = Depends(get_db)):
    board = BoardService(db).get_board()
    db.commit()
    return serialize_board(board)
