import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _new_id() -> str:
    return uuid.uuid4().hex


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    terminal_column_id: Mapped[str | None] = mapped_column(String, nullable=True)

    columns: Mapped[list["Column"]] = relationship(back_populates="board")
    categories: Mapped[list["Category"]] = relationship(back_populates="board")
