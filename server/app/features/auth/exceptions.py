"""
Auth Exceptions - Custom exceptions for auth feature

Domain-specific exceptions for authentication and user operations.
"""


class AuthError(Exception):
    """Base exception for auth feature."""

    pass


class UserNotFoundError(AuthError):
    """User not found in database."""

    pass


class UserAlreadyExistsError(AuthError):
    """User with email/username already exists."""

    pass


class InvalidCredentialsError(AuthError):
    """Invalid username or password."""

    pass


class InvalidTokenError(AuthError):
    """Invalid or expired JWT token."""

    pass


class InactiveUserError(AuthError):
    """User account is inactive/disabled."""

    pass
