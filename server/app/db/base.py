"""
Database Base - SQLAlchemy declarative base

This module provides the declarative base for all database models.

IMPORTANT: Import all models here for Alembic auto-detection!
When you create a new model, add the import below.
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


# ============================================================================
# Model Imports - Register all models for Alembic auto-detection
# ============================================================================
# IMPORTANT: These imports are ONLY used by Alembic for auto-detection
# They must be here at module level but will cause circular imports if
# done at the top. So we import them conditionally:


def _import_models_for_alembic() -> None:
    """Import all models for Alembic detection. Called explicitly by alembic/env.py"""
    from app.features.auth.models.user import User  # noqa: F401
    from app.features.workouts.models.workout import Workout  # noqa: F401
    # Add new model imports here:
    # from app.features.exercises.models.exercise import Exercise  # noqa: F401
