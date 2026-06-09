import pytest

from app.services.board_service import BoardService
from app.services.task_service import TaskService


def test_create_task_returns_only_created_task(session):
    board = BoardService(session).get_board()
    col = board.columns[0]
    task = TaskService(session).create_task(title="My task", column_id=col.id)
    assert task.id is not None
    assert task.title == "My task"
    assert task.column_id == col.id


def test_create_task_default_values(session):
    board = BoardService(session).get_board()
    col = board.columns[0]
    task = TaskService(session).create_task(title="T", column_id=col.id)
    assert task.priority == "medium"
    assert task.scope is None
    assert task.due_date is None
    assert task.sort_key == 0


def test_create_task_with_category(session):
    board = BoardService(session).get_board()
    col = board.columns[0]
    cat = board.categories[0]
    task = TaskService(session).create_task(
        title="T", column_id=col.id, category_id=cat.id
    )
    assert task.category_id == cat.id


def test_create_task_invalid_column_raises(session):
    with pytest.raises(ValueError, match="column"):
        TaskService(session).create_task(title="T", column_id="nonexistent")
