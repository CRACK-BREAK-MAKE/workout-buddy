"""
Base Repository - LSP: Generic repository pattern

This module provides a generic base repository following:
- Liskov Substitution Principle (LSP): All repositories are substitutable
- Single Responsibility Principle (SRP): Data access ONLY, no business logic
"""

from typing import TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository[ModelType: Base]:
    """
    Generic base repository for database operations.

    All feature repositories should inherit from this class.
    Provides standard CRUD operations.

    NO business logic - that belongs in services!
    NO HTTP concerns - that belongs in routes!
    """

    def __init__(self, model: type[ModelType], db: AsyncSession):
        """
        Initialize repository.

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    async def get_by_id(self, record_id: UUID) -> ModelType | None:
        """
        Get a record by ID.

        Args:
            record_id: Record UUID

        Returns:
            Model instance or None if not found
        """
        # Type ignore needed because mypy doesn't understand generic SQLAlchemy model access
        result = await self.db.execute(
            select(self.model).where(self.model.id == record_id)  # type: ignore[attr-defined]
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """
        Get all records with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of model instances
        """
        result = await self.db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, obj: ModelType) -> ModelType:
        """
        Create a new record.

        Args:
            obj: Model instance to create

        Returns:
            Created model instance with ID
        """
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update(self, obj: ModelType) -> ModelType:
        """
        Update an existing record.

        Args:
            obj: Model instance to update

        Returns:
            Updated model instance
        """
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def delete(self, record_id: UUID) -> bool:
        """
        Delete a record by ID.

        Args:
            record_id: Record UUID

        Returns:
            True if deleted, False if not found
        """
        obj = await self.get_by_id(record_id)
        if obj:
            await self.db.delete(obj)
            await self.db.flush()
            return True
        return False

    async def exists(self, record_id: UUID) -> bool:
        """
        Check if a record exists.

        Args:
            record_id: Record UUID

        Returns:
            True if exists, False otherwise
        """
        # Type ignore needed because mypy doesn't understand generic SQLAlchemy model access
        result = await self.db.execute(
            select(self.model.id)  # type: ignore[attr-defined]
            .where(self.model.id == record_id)  # type: ignore[attr-defined]
            .limit(1)
        )
        return result.scalar() is not None
