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
