"""
Database Session - Async SQLAlchemy session factory

This module provides database session management:
- Async engine configuration
- Session factory
- Dependency injection for FastAPI
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config.security_settings import security_settings

# Create async engine
# echo=True in development for SQL query logging
engine = create_async_engine(
    security_settings.DATABASE_URL,
    echo=security_settings.DEBUG if hasattr(security_settings, "DEBUG") else False,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Connection pool size
    max_overflow=10,  # Max overflow connections
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """
    Dependency for FastAPI routes to get database session.

    Automatically handles:
    - Session creation
    - Transaction management
    - Session cleanup

    Usage in routes:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...

    Example:
        >>> from fastapi import Depends
        >>> from sqlalchemy.ext.asyncio import AsyncSession
        >>> async def my_route(db: AsyncSession = Depends(get_db)):
        ...     result = await db.execute(select(User))
        ...     users = result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
