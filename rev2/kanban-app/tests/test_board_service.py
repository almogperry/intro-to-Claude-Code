from app.models import Board
from app.services.board_service import BoardService


def test_first_get_board_seeds_columns_and_categories(session):
    board = BoardService(session).get_board()

    column_names = [c.name for c in sorted(board.columns, key=lambda c: c.position)]
    assert column_names == ["To Do", "Doing", "Completed"]

    category_names = sorted(c.name for c in board.categories)
    assert category_names == ["personal", "work/study"]


def test_rightmost_seeded_column_is_terminal(session):
    board = BoardService(session).get_board()

    rightmost = max(board.columns, key=lambda c: c.position)
    assert rightmost.name == "Completed"
    assert rightmost.is_terminal is True
    assert board.terminal_column_id == rightmost.id

    others = [c for c in board.columns if c.id != rightmost.id]
    assert all(c.is_terminal is False for c in others)


def test_second_call_reuses_same_board(session):
    service = BoardService(session)
    first = service.get_board()
    second = service.get_board()

    assert second.id == first.id
    assert session.query(Board).count() == 1
    assert len(second.columns) == 3
    assert len(second.categories) == 2
