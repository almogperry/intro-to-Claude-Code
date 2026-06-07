from sqlalchemy.orm import Session

from app.models import Board, Category, Column

SEED_COLUMNS = ["To Do", "Doing", "Completed"]
SEED_CATEGORIES = ["personal", "work/study"]


class BoardService:
    def __init__(self, session: Session):
        self.session = session

    def get_board(self) -> Board:
        existing = self.session.query(Board).first()
        if existing is not None:
            return existing

        board = Board()
        self.session.add(board)
        self.session.flush()

        columns = []
        for position, name in enumerate(SEED_COLUMNS):
            column = Column(board_id=board.id, name=name, position=position)
            self.session.add(column)
            columns.append(column)
        for name in SEED_CATEGORIES:
            self.session.add(Category(board_id=board.id, name=name))

        self.session.flush()
        terminal = max(columns, key=lambda c: c.position)
        terminal.is_terminal = True
        board.terminal_column_id = terminal.id

        self.session.flush()
        self.session.refresh(board)
        return board
