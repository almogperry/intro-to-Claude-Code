import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_board_returns_flat_with_ids_shape(client):
    resp = client.get("/api/board")
    assert resp.status_code == 200
    body = resp.json()

    assert set(body) == {
        "id",
        "terminalColumnId",
        "categories",
        "columns",
        "tasks",
        "subtasks",
    }

    columns = sorted(body["columns"], key=lambda c: c["position"])
    assert [c["name"] for c in columns] == ["To Do", "Doing", "Completed"]
    assert set(columns[0]) == {"id", "name", "isTerminal", "position"}

    terminal = columns[-1]
    assert terminal["isTerminal"] is True
    assert body["terminalColumnId"] == terminal["id"]

    assert sorted(c["name"] for c in body["categories"]) == ["personal", "work/study"]
    assert body["tasks"] == []
    assert body["subtasks"] == []


def test_get_board_reuses_same_board_across_calls(client):
    first = client.get("/api/board").json()
    second = client.get("/api/board").json()
    assert first["id"] == second["id"]


def _first_column_id(client):
    board = client.get("/api/board").json()
    return sorted(board["columns"], key=lambda c: c["position"])[0]["id"]


def test_post_task_returns_created_task(client):
    col_id = _first_column_id(client)
    resp = client.post("/api/tasks", json={"title": "New task", "columnId": col_id})
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "New task"
    assert body["columnId"] == col_id
    assert body["priority"] == "medium"
    assert "id" in body


def test_post_task_response_shape(client):
    col_id = _first_column_id(client)
    resp = client.post("/api/tasks", json={"title": "T", "columnId": col_id})
    body = resp.json()
    assert set(body) == {"id", "title", "columnId", "priority", "scope", "dueDate", "sortKey", "categoryId"}


def test_post_task_invalid_column_returns_400(client):
    resp = client.post("/api/tasks", json={"title": "T", "columnId": "bad-id"})
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_post_task_missing_title_returns_422(client):
    col_id = _first_column_id(client)
    resp = client.post("/api/tasks", json={"columnId": col_id})
    assert resp.status_code == 422


def test_get_board_includes_tasks_after_creation(client):
    col_id = _first_column_id(client)
    client.post("/api/tasks", json={"title": "Persisted", "columnId": col_id})
    board = client.get("/api/board").json()
    assert len(board["tasks"]) == 1
    assert board["tasks"][0]["title"] == "Persisted"


def _create_task(client):
    col_id = _first_column_id(client)
    return client.post("/api/tasks", json={"title": "Task", "columnId": col_id}).json()


def test_patch_task_title(client):
    task = _create_task(client)
    resp = client.patch(f"/api/tasks/{task['id']}", json={"title": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated"


def test_patch_task_priority(client):
    task = _create_task(client)
    resp = client.patch(f"/api/tasks/{task['id']}", json={"priority": "high"})
    assert resp.status_code == 200
    assert resp.json()["priority"] == "high"


def test_patch_task_scope_and_due_date(client):
    task = _create_task(client)
    resp = client.patch(f"/api/tasks/{task['id']}", json={"scope": "week", "dueDate": "2025-12-31"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["scope"] == "week"
    assert body["dueDate"] == "2025-12-31"


def test_patch_task_scope_without_due_date_returns_400(client):
    task = _create_task(client)
    resp = client.patch(f"/api/tasks/{task['id']}", json={"scope": "day"})
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_patch_task_due_date_without_scope_returns_400(client):
    task = _create_task(client)
    resp = client.patch(f"/api/tasks/{task['id']}", json={"dueDate": "2025-12-31"})
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_patch_task_not_found_returns_404(client):
    resp = client.patch("/api/tasks/nonexistent", json={"title": "X"})
    assert resp.status_code == 404


def test_patch_task_persists(client):
    task = _create_task(client)
    client.patch(f"/api/tasks/{task['id']}", json={"title": "Persisted"})
    board = client.get("/api/board").json()
    assert board["tasks"][0]["title"] == "Persisted"
