import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _new_id() -> str:
    return uuid.uuid4().hex


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    title: Mapped[str] = mapped_column(String)
    column_id: Mapped[str] = mapped_column(ForeignKey("columns.id"))
    category_id: Mapped[str | None] = mapped_column(
        ForeignKey("categories.id"), nullable=True
    )
    priority: Mapped[str] = mapped_column(String, default="medium")
    scope: Mapped[str | None] = mapped_column(String, nullable=True)
    due_date: Mapped[str | None] = mapped_column(String, nullable=True)
    sort_key: Mapped[int] = mapped_column(Integer, default=0)

    column: Mapped["Column"] = relationship(back_populates="tasks")
