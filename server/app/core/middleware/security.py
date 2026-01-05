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
        # Development: Allow Swagger UI/ReDoc CDNs
        # Need to allow:
        # - cdn.jsdelivr.net for Swagger UI and ReDoc bundles
        # - fonts.googleapis.com for ReDoc fonts
        # - blob: for ReDoc workers
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net blob:; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; "
            "connect-src 'self' https://cdn.jsdelivr.net; "
            "worker-src 'self' blob:"
        )
    else:
        # Production: Strict CSP (no external resources, no docs in prod)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'"
        )

    return response
