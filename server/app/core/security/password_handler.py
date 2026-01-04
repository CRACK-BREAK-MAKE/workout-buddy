"""
Password Handler - SRP: Password hashing ONLY

This module handles ONLY password hashing operations:
- Hash plaintext passwords
- Verify passwords against hashes
NO JWT operations, NO OAuth logic

Note: This is for future email/password authentication.
Phase 1 (OAuth only) doesn't use this yet, but it's ready for Phase 2.
"""

from passlib.context import CryptContext


class PasswordHandler:
    """
    Password hashing handler following Single Responsibility Principle.

    Uses Argon2 (more secure than bcrypt) for password hashing.

    Responsibilities:
    - Hash plaintext passwords
    - Verify passwords against hashes

    NO JWT handling (see jwt_handler.py)
    NO OAuth logic (see oauth providers)
    """

    def __init__(self) -> None:
        # Argon2 is more secure than bcrypt
        # Automatically handles salt generation and verification
        self._pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

    def hash_password(self, plain_password: str) -> str:
        """
        Hash a plaintext password using Argon2.

        Args:
            plain_password: Plaintext password to hash

        Returns:
            Hashed password string

        Example:
            >>> handler = PasswordHandler()
            >>> hashed = handler.hash_password("SecurePass123!")
        """
        hashed: str = self._pwd_context.hash(plain_password)
        return hashed

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plaintext password against a hash.

        Args:
            plain_password: Plaintext password to verify
            hashed_password: Hashed_password to compare against

        Returns:
            True if password matches, False otherwise

        Example:
            >>> handler = PasswordHandler()
            >>> is_valid = handler.verify_password("SecurePass123!", hashed)
        """
        result: bool = self._pwd_context.verify(plain_password, hashed_password)
        return result


# Singleton instance
password_handler = PasswordHandler()
