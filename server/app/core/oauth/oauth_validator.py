"""
OAuth Validator - SRP: OAuth validation logic ONLY

This module handles ONLY OAuth validation:
- CSRF state token validation
- Provider name validation
NO provider communication, NO user operations
"""

import secrets


class OAuthValidator:
    """
    OAuth validation utilities.

    Responsibilities:
    - Generate CSRF state tokens
    - Validate CSRF state tokens
    - Validate provider names

    NO provider API calls (that's in providers)
    NO user operations (that's in services/repositories)
    """

    @staticmethod
    def generate_state_token(length: int = 32) -> str:
        """
        Generate a cryptographically secure CSRF state token.

        Args:
            length: Token length in bytes (default: 32)

        Returns:
            URL-safe random token

        Example:
            >>> validator = OAuthValidator()
            >>> state = validator.generate_state_token()
            >>> len(state)  # 43 chars (base64-encoded 32 bytes)
        """
        return secrets.token_urlsafe(length)

    @staticmethod
    def validate_state_token(received_state: str | None, expected_state: str | None) -> bool:
        """
        Validate OAuth state token for CSRF protection.

        Uses constant-time comparison to prevent timing attacks.

        Args:
            received_state: State from OAuth callback
            expected_state: State stored in session

        Returns:
            True if states match, False otherwise

        Example:
            >>> validator = OAuthValidator()
            >>> state = validator.generate_state_token()
            >>> validator.validate_state_token(state, state)  # True
            >>> validator.validate_state_token(state, "different")  # False
        """
        if received_state is None or expected_state is None:
            return False

        # Use secrets.compare_digest for constant-time comparison
        # Prevents timing attacks
        return secrets.compare_digest(received_state, expected_state)


# Singleton instance
oauth_validator = OAuthValidator()
