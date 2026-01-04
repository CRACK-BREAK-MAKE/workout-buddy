"""
User Service - SRP: User business logic ONLY

This module handles ONLY user-related business logic:
- User profile operations
- User validation
NO authentication logic (that's in oauth_service.py)
NO database operations (that's in user_repository.py)
"""

from uuid import UUID

from app.features.auth.exceptions import UserAlreadyExistsError, UserNotFoundError
from app.features.auth.models.user import User
from app.features.auth.repositories.user_repository import UserRepository
from app.features.auth.schemas.user_schemas import UserUpdate


class UserService:
    """
    User business logic service.

    Responsibilities:
    - User profile management
    - User validation
    - Orchestrate repository calls

    NO authentication/OAuth (that's in oauth_service.py)
    NO direct database queries (that's in user_repository.py)
    NO HTTP concerns (that's in routes)
    """

    def __init__(self, user_repo: UserRepository):
        """
        Initialize user service.

        Args:
            user_repo: User repository for data access
        """
        self._user_repo = user_repo

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """
        Get user by ID.

        Args:
            user_id: User's UUID

        Returns:
            User instance or None if not found
        """
        return await self._user_repo.get_by_id(user_id)

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Get user by email address.

        Args:
            email: User's email

        Returns:
            User instance or None if not found
        """
        return await self._user_repo.get_by_email(email)

    async def update_user_profile(self, user_id: UUID, updates: UserUpdate) -> User:
        """
        Update user profile.

        Args:
            user_id: User's UUID
            updates: Profile updates

        Returns:
            Updated user

        Raises:
            UserNotFoundError: If user doesn't exist
            UserAlreadyExistsError: If email/username already taken
        """
        # Check if user exists
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")

        # Validate email uniqueness if changing
        if updates.email and updates.email != user.email:
            if await self._user_repo.email_exists(updates.email):
                raise UserAlreadyExistsError(f"Email {updates.email} already registered")

        # Validate username uniqueness if changing
        if updates.username and updates.username != user.username:
            if await self._user_repo.username_exists(updates.username):
                raise UserAlreadyExistsError(f"Username {updates.username} already taken")

        # Update profile
        updated_user = await self._user_repo.update_profile(
            user_id=user_id,
            email=updates.email,
            username=updates.username,
            full_name=updates.full_name,
            avatar_url=updates.avatar_url,
        )

        if not updated_user:
            raise UserNotFoundError(f"User {user_id} not found")

        return updated_user

    async def delete_user(self, user_id: UUID) -> bool:
        """
        Delete user account.

        Args:
            user_id: User's UUID

        Returns:
            True if deleted, False if not found
        """
        return await self._user_repo.delete(user_id)
