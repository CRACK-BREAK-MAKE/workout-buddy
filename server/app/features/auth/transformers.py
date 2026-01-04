"""
Auth Transformers - SRP: Data transformation ONLY

This module handles ONLY data transformations for auth feature:
- Generate unique usernames
- Transform OAuth data
NO business logic, NO database operations
"""

from app.features.auth.repositories.user_repository import UserRepository


async def generate_unique_username(user_repo: UserRepository, base_username: str) -> str:
    """
    Generate a unique username by appending numbers if needed.

    Args:
        user_repo: User repository to check username existence
        base_username: Base username to start with

    Returns:
        Unique username

    Example:
        >>> username = await generate_unique_username(repo, "johndoe")
        >>> # Returns "johndoe" if available, "johndoe1" if taken, etc.
    """
    # Clean base username (alphanumeric + underscores only)
    clean_base = "".join(c for c in base_username if c.isalnum() or c == "_")
    clean_base = clean_base[:50]  # Max username length

    # Check if base username is available
    if not await user_repo.username_exists(clean_base):
        return clean_base

    # Try appending numbers
    counter = 1
    while True:
        candidate = f"{clean_base}{counter}"[:50]  # Ensure max length
        if not await user_repo.username_exists(candidate):
            return candidate
        counter += 1

        # Safety check to prevent infinite loop
        if counter > 9999:
            # Fallback to random suffix
            import secrets

            random_suffix = secrets.token_hex(4)
            return f"{clean_base[:42]}_{random_suffix}"
