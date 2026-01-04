"""
User Repository - SRP: User data access ONLY

This module handles ONLY user database operations:
- Find users by email, OAuth ID
- Create OAuth users
- Update user profiles
NO business logic, NO HTTP concerns
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.auth.models.user import AuthProvider, User
from app.features.auth.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    User data access layer.

    Responsibilities:
    - CRUD operations for users
    - User lookups (by email, OAuth ID, username)
    - Database queries ONLY

    NO business logic (that's in user_service.py)
    NO authentication logic (that's in oauth_service.py)
    """

    def __init__(self, db: AsyncSession):
        """Initialize user repository."""
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> User | None:
        """
        Find user by email address.

        Args:
            email: User's email address

        Returns:
            User instance or None if not found
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> User | None:
        """
        Find user by username.

        Args:
            username: User's username

        Returns:
            User instance or None if not found
        """
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def get_by_oauth_id(self, provider: AuthProvider, oauth_id: str) -> User | None:
        """
        Find user by OAuth provider and provider's user ID.

        Args:
            provider: Authentication provider (google, github, discord)
            oauth_id: Provider's unique user ID

        Returns:
            User instance or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.auth_provider == provider, User.oauth_id == oauth_id)
        )
        return result.scalars().first()

    async def email_exists(self, email: str) -> bool:
        """
        Check if email is already registered.

        Args:
            email: Email address to check

        Returns:
            True if email exists, False otherwise
        """
        result = await self.db.execute(select(User.id).where(User.email == email).limit(1))
        return result.scalar() is not None

    async def username_exists(self, username: str) -> bool:
        """
        Check if username is already taken.

        Args:
            username: Username to check

        Returns:
            True if username exists, False otherwise
        """
        result = await self.db.execute(select(User.id).where(User.username == username).limit(1))
        return result.scalar() is not None

    async def create_oauth_user(
        self,
        email: str,
        username: str,
        full_name: str | None,
        avatar_url: str | None,
        auth_provider: AuthProvider,
        oauth_id: str,
    ) -> User:
        """
        Create a new user from OAuth provider.

        Args:
            email: User's email
            username: User's username
            full_name: User's full name (optional)
            avatar_url: Avatar URL (optional)
            auth_provider: OAuth provider
            oauth_id: Provider's user ID

        Returns:
            Created user instance
        """
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            avatar_url=avatar_url,
            auth_provider=auth_provider,
            oauth_id=oauth_id,
            hashed_password=None,  # No password for OAuth users
            is_active=True,
        )
        return await self.create(user)

    async def update_profile(
        self,
        user_id: UUID,
        email: str | None = None,
        username: str | None = None,
        full_name: str | None = None,
        avatar_url: str | None = None,
    ) -> User | None:
        """
        Update user profile fields.

        Args:
            user_id: User's UUID
            email: New email (optional)
            username: New username (optional)
            full_name: New full name (optional)
            avatar_url: New avatar URL (optional)

        Returns:
            Updated user or None if not found
        """
        user = await self.get_by_id(user_id)
        if not user:
            return None

        if email is not None:
            user.email = email
        if username is not None:
            user.username = username
        if full_name is not None:
            user.full_name = full_name
        if avatar_url is not None:
            user.avatar_url = avatar_url

        return await self.update(user)
