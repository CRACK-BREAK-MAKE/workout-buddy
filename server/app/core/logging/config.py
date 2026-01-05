"""
Logging Configuration - Structured JSON logging

This module configures structured logging for the application:
- JSON format for production (easy parsing by log aggregators)
- Human-readable format for development
- Request/response logging
- Error tracking
"""

import logging
import sys

from pythonjsonlogger import jsonlogger

from app.core.config.base_settings import base_settings


def setup_logging() -> None:
    """
    Configure application logging.

    - Development: Human-readable console logs
    - Production: Structured JSON logs
    """
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(
        logging.INFO if base_settings.ENVIRONMENT == "production" else logging.DEBUG
    )

    # Remove existing handlers
    root_logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)

    if base_settings.ENVIRONMENT == "production":
        # JSON formatter for production
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(name)s %(levelname)s %(message)s",
            rename_fields={"asctime": "timestamp", "levelname": "level", "name": "logger"},
        )
    else:
        # Human-readable formatter for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Silence noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the given name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
