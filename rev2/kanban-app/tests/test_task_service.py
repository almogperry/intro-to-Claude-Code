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


def _make_task(session):
    board = BoardService(session).get_board()
    col = board.columns[0]
    return TaskService(session).create_task(title="Original", column_id=col.id)


def test_patch_task_title(session):
    task = _make_task(session)
    updated = TaskService(session).patch_task(task.id, {"title": "New title"})
    assert updated.title == "New title"


def test_patch_task_priority(session):
    task = _make_task(session)
    updated = TaskService(session).patch_task(task.id, {"priority": "high"})
    assert updated.priority == "high"


def test_patch_task_scope_and_due_date(session):
    task = _make_task(session)
    updated = TaskService(session).patch_task(task.id, {"scope": "week", "dueDate": "2025-12-31"})
    assert updated.scope == "week"
    assert updated.due_date == "2025-12-31"


def test_patch_task_clear_scope_and_due_date(session):
    board = BoardService(session).get_board()
    col = board.columns[0]
    task = TaskService(session).create_task(
        title="T", column_id=col.id, scope="week", due_date="2025-12-31"
    )
    updated = TaskService(session).patch_task(task.id, {"scope": None, "dueDate": None})
    assert updated.scope is None
    assert updated.due_date is None


def test_patch_task_scope_without_due_date_raises(session):
    task = _make_task(session)
    with pytest.raises(ValueError, match="scope"):
        TaskService(session).patch_task(task.id, {"scope": "day"})


def test_patch_task_due_date_without_scope_raises(session):
    task = _make_task(session)
    with pytest.raises(ValueError, match="scope"):
        TaskService(session).patch_task(task.id, {"dueDate": "2025-12-31"})


def test_patch_task_not_found_raises(session):
    with pytest.raises(ValueError, match="task"):
        TaskService(session).patch_task("nonexistent", {"title": "X"})
