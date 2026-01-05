"""
Health Check Functions - Verify system components

This module provides health check functions for:
- Database connectivity
- OAuth provider availability
- Application status
"""

from typing import Any

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def check_database_health(db: AsyncSession) -> dict[str, Any]:
    """
    Check database connectivity and responsiveness.

    Args:
        db: Database session

    Returns:
        Health status dict with status and latency
    """
    try:
        # Simple query to test DB connection
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


async def check_google_oauth_health() -> dict[str, Any]:
    """
    Check Google OAuth provider availability.

    Returns:
        Health status dict for OAuth provider
    """
    try:
        # Check if Google OAuth discovery endpoint is reachable
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                "https://accounts.google.com/.well-known/openid-configuration"
            )
            response.raise_for_status()

        return {"status": "healthy", "oauth_provider": "google", "reachable": True}
    except Exception as e:
        return {
            "status": "degraded",
            "oauth_provider": "google",
            "reachable": False,
            "error": str(e),
        }


async def get_comprehensive_health(db: AsyncSession) -> dict[str, Any]:
    """
    Get comprehensive health status of all system components.

    Args:
        db: Database session

    Returns:
        Complete health status including all components
    """
    # Check database
    db_health = await check_database_health(db)

    # Check OAuth provider
    oauth_health = await check_google_oauth_health()

    # Determine overall status
    if db_health.get("status") == "unhealthy":
        overall_status = "unhealthy"
    elif oauth_health.get("status") == "degraded":
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    return {
        "status": overall_status,
        "components": {
            "database": db_health,
            "oauth": oauth_health,
        },
    }
