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

    def patch_task(self, task_id: str, fields: dict) -> Task:
        task = self.session.get(Task, task_id)
        if task is None:
            raise ValueError(f"task {task_id!r} not found")

        # Compute effective scope/due_date after patch
        new_scope = fields["scope"] if "scope" in fields else task.scope
        new_due = fields["dueDate"] if "dueDate" in fields else task.due_date
        if (new_scope is None) != (new_due is None):
            raise ValueError("scope and dueDate must both be set or both be null")

        if "title" in fields:
            task.title = fields["title"]
        if "priority" in fields:
            task.priority = fields["priority"]
        if "categoryId" in fields:
            task.category_id = fields["categoryId"]
        if "scope" in fields:
            task.scope = fields["scope"]
        if "dueDate" in fields:
            task.due_date = fields["dueDate"]

        self.session.flush()
        self.session.refresh(task)
        return task
