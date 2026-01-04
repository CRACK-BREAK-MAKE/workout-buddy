"""
User Schemas - Request/Response validation

Pydantic schemas for user-related API operations.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.features.auth.models.user import AuthProvider


class UserBase(BaseModel):
    """Base user schema with shared fields."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    """Schema for creating a new user (email/password auth)."""

    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    email: EmailStr | None = None
    username: str | None = Field(None, min_length=3, max_length=50)
    full_name: str | None = Field(None, max_length=255)
    avatar_url: str | None = Field(None, max_length=500)


class UserRead(BaseModel):
    """Schema for reading user data (response)."""

    id: UUID
    email: str
    username: str
    full_name: str | None
    avatar_url: str | None
    auth_provider: AuthProvider
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(UserRead):
    """Schema for user with password hash (internal use only)."""

    hashed_password: str | None
