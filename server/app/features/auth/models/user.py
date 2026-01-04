"""
User Model - Domain entity for users

This module defines the User database model supporting:
- OAuth authentication (Google, GitHub, Discord)
- Email/password authentication (future)
- User profile information
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.features.workouts.models.workout import Workout


class AuthProvider(str, enum.Enum):
    """
    Supported authentication providers.

    EMAIL: Traditional email/password auth (future)
    GOOGLE: Google OAuth
    GITHUB: GitHub OAuth (future)
    DISCORD: Discord OAuth (future)
    """

    EMAIL = "email"
    GOOGLE = "google"
    GITHUB = "github"
    DISCORD = "discord"


class User(Base, UUIDMixin, TimestampMixin):
    """
    User model - represents authenticated users in the system.

    Supports both OAuth and email/password authentication.

    Attributes:
        id: UUID primary key (from UUIDMixin)
        email: User's email address (unique)
        username: User's display name (unique)
        full_name: User's full name (optional)
        avatar_url: URL to user's avatar image (optional)
        auth_provider: Authentication method used
        oauth_id: Provider's user ID (for OAuth users)
        hashed_password: Hashed password (for email/password users, nullable)
        is_active: Account status
        created_at: Account creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)

    Indexes:
        - email (unique)
        - username (unique)
        - oauth_id (for OAuth lookups)
        - auth_provider (for filtering by provider)

    Relationships:
        - workouts: One-to-many (future Phase 2)
    """

    __tablename__ = "users"

    # Core user information
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Authentication information
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider, name="auth_provider_enum"),
        default=AuthProvider.EMAIL,
        nullable=False,
        index=True,
    )
    oauth_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
        comment="Provider's unique user ID (for OAuth)",
    )

    # For email/password users (nullable for OAuth users)
    hashed_password: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="Argon2 hashed password"
    )

    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships - Phase 2
    workouts: Mapped[list["Workout"]] = relationship(
        "Workout", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<User(id={self.id}, email={self.email}, "
            f"provider={self.auth_provider.value}, active={self.is_active})>"
        )

    @property
    def is_oauth_user(self) -> bool:
        """Check if user authenticated via OAuth."""
        return self.auth_provider != AuthProvider.EMAIL

    @property
    def display_name(self) -> str:
        """Get user's display name (full_name if available, otherwise username)."""
        return self.full_name or self.username
