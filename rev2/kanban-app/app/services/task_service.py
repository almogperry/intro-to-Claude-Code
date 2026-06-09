from sqlalchemy.orm import Session

from app.models import Column, Task


class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def create_task(
        self,
        title: str,
        column_id: str,
        category_id: str | None = None,
        priority: str = "medium",
        scope: str | None = None,
        due_date: str | None = None,
        sort_key: int = 0,
    ) -> Task:
        col = self.session.get(Column, column_id)
        if col is None:
            raise ValueError(f"column {column_id!r} not found")
        task = Task(
            title=title,
            column_id=column_id,
            category_id=category_id,
            priority=priority,
            scope=scope,
            due_date=due_date,
            sort_key=sort_key,
        )
        self.session.add(task)
        self.session.flush()
        self.session.refresh(task)
        return task
