from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Board
from app.services.board_service import BoardService

router = APIRouter()


def serialize_board(board: Board) -> dict:
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
        "tasks": [],
        "subtasks": [],
    }


@router.get("/api/board")
def get_board(db: Session = Depends(get_db)):
    board = BoardService(db).get_board()
    db.commit()
    return serialize_board(board)
