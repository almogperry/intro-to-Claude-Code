import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _new_id() -> str:
    return uuid.uuid4().hex


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    board_id: Mapped[str] = mapped_column(ForeignKey("boards.id"))
    name: Mapped[str] = mapped_column(String)

    board: Mapped["Board"] = relationship(back_populates="categories")
