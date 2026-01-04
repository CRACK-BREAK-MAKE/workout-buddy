"""
Workout Model - SQLAlchemy ORM model for workout records

This module defines the Workout entity which stores exercise tracking data.
Each workout belongs to a user and records exercise type, reps, duration, and calories.

Note: Validation logic is handled by WorkoutValidator (SRP - Single Responsibility Principle).
Model only defines data structure, not business rules.
"""

import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.features.auth.models.user import User


class ExerciseType(str, enum.Enum):
    """Supported exercise types"""

    PUSH_UP = "push-up"
    JUMP_ROPE = "jump-rope"


class Workout(Base, UUIDMixin, TimestampMixin):
    """
    Workout model representing a completed exercise session.

    Attributes:
        id: Unique workout identifier (UUID)
        user_id: Foreign key to users table
        exercise_type: Type of exercise performed (push-up, jump-rope)
        reps_count: Number of repetitions completed (>= 0)
        duration_seconds: Duration of workout in seconds (>= 0)
        calories_burned: Estimated calories burned (optional)
        created_at: Timestamp when workout was recorded
        updated_at: Timestamp when workout was last updated
        user: Relationship to User model
    """

    __tablename__ = "workouts"

    # Foreign key to users table with CASCADE DELETE
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Exercise details
    exercise_type: Mapped[ExerciseType] = mapped_column(
        Enum(ExerciseType, name="exercise_type_enum"), nullable=False, index=True
    )
    reps_count: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    calories_burned: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationship to User model
    user: Mapped["User"] = relationship("User", back_populates="workouts")

    def __repr__(self) -> str:
        return (
            f"<Workout(id={self.id}, user_id={self.user_id}, "
            f"exercise={self.exercise_type.value}, reps={self.reps_count})>"
        )
