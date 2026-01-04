"""
Database Base - SQLAlchemy declarative base

This module provides the declarative base for all database models.
"""

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base class for all database models.

    Provides common functionality:
    - UUID primary keys
    - Created/updated timestamps
    """

    pass


class TimestampMixin:
    """
    Mixin for created_at and updated_at timestamps.

    Usage:
        class User(Base, TimestampMixin):
            __tablename__ = "users"
            ...
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class UUIDMixin:
    """
    Mixin for UUID primary keys.

    Usage:
        class User(Base, UUIDMixin, TimestampMixin):
            __tablename__ = "users"
            ...
    """

    id: Mapped[uuid4] = mapped_column(  # type: ignore
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
