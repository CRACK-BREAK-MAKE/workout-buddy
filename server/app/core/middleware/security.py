"""
Security Headers Middleware - SRP: ONLY security headers

This module handles HTTP security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy
"""

from typing import Any

from fastapi import Request, Response

from app.core.config.base_settings import base_settings


async def add_security_headers(request: Request, call_next: Any) -> Response:
    """
    Add security headers to all HTTP responses.

    Security headers protect against:
    - MIME sniffing attacks
    - Clickjacking
    - XSS attacks
    - Unauthorized resource loading

    Args:
        request: Incoming HTTP request
        call_next: Next middleware in chain

    Returns:
        Response with security headers added
    """
    response = await call_next(request)

    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # XSS filter (legacy but still useful)
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Control referrer information
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Restrict browser features
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # X-Frame-Options - relaxed for Swagger UI docs
    if request.url.path.startswith("/docs") or request.url.path.startswith("/redoc"):
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
    else:
        response.headers["X-Frame-Options"] = "DENY"

    # Content Security Policy - environment-aware
    if base_settings.ENVIRONMENT == "development":
        # Development: Allow Swagger UI CDN (cdn.jsdelivr.net)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://cdn.jsdelivr.net; "
            "connect-src 'self'"
        )
    else:
        # Production: Strict CSP (no external resources)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'"
        )

    return response
