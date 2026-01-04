# Workout Buddy Backend - Complete Implementation Plan

**Version:** 1.0
**Last Updated:** 2026-01-04
**Status:** Master Implementation Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Principles](#architecture-principles)
4. [Directory Structure](#directory-structure)
5. [Implementation Phases](#implementation-phases)
6. [Coding Standards](#coding-standards)
7. [Package Versions](#package-versions)
8. [Testing Strategy](#testing-strategy)

---

## Overview

This document serves as the **single source of truth** for all backend development. It defines:
- Complete feature list and implementation order
- SOLID principles and design patterns to follow
- Latest package versions and tooling
- Architecture decisions and layer responsibilities
- Testing and quality standards

**Purpose:** Ensure consistency, maintainability, and production-grade code quality across all backend features.

---

## Technology Stack

### Core Framework
- **Python:** 3.14.2 (latest stable, released Jan 2025)
- **FastAPI:** 0.128.0+ (async web framework)
- **Uvicorn:** 1.33.0+ (ASGI server with standard extras)

### Database
- **PostgreSQL:** 18.1 (latest stable)
- **SQLAlchemy:** 2.0.36+ (async ORM)
- **Asyncpg:** 0.30.0+ (PostgreSQL async driver - faster than psycopg2)
- **Alembic:** 1.14.0+ (database migrations)

### Authentication & Security
- **Authlib:** 1.4.0+ (OAuth2 providers)
- **python-jose[cryptography]:** 3.3.0+ (JWT tokens)
- **passlib[argon2]:** 1.7.4+ (password hashing - Argon2 more secure than bcrypt)

### Validation & Settings
- **Pydantic:** 2.10.0+ (data validation)
- **pydantic-settings:** 2.7.0+ (settings management)
- **python-multipart:** 0.0.20+ (form data support)
- **python-dotenv:** 1.0.0+ (environment variables)

### HTTP & API
- **httpx:** 0.28.0+ (async HTTP client for OAuth)
- **slowapi:** 0.1.9+ (rate limiting)

### Dev Tools
- **pytest:** 8.3.0+ (testing framework)
- **pytest-asyncio:** 0.25.0+ (async test support)
- **pytest-cov:** 6.0.0+ (code coverage)
- **ruff:** 0.9.0+ (linter - 100x faster than pylint/flake8)
- **mypy:** 1.14.0+ (static type checking)

### Package Manager
- **uv:** Latest (10-100x faster than pip, Rust-based)

---

## Architecture Principles

### SOLID Principles (MANDATORY)

**1. Single Responsibility Principle (SRP)**
- Each file/class/function has ONE responsibility
- Separate: routes, services, repositories, validators, transformers, handlers
- Example violations to AVOID:
  - ❌ Route function that validates + queries DB + transforms response
  - ❌ Service that handles HTTP requests directly
  - ❌ Repository that contains business logic

**2. Open/Closed Principle (OCP)**
- Open for extension, closed for modification
- Use interfaces/protocols for extensibility
- Factory pattern for creating instances
- Strategy pattern for different implementations

**3. Liskov Substitution Principle (LSP)**
- All implementations of an interface must be substitutable
- BaseRepository pattern for all data access
- All OAuth providers implement OAuthProvider interface

**4. Interface Segregation Principle (ISP)**
- Many small, focused interfaces
- No fat interfaces with unused methods
- Example: Separate TokenService, UserService, OAuthService

**5. Dependency Inversion Principle (DIP)**
- Depend on abstractions (protocols/ABCs), not concrete classes
- All dependencies injected via FastAPI Depends()
- Services receive repositories, not DB sessions directly

### Additional Principles

**DRY (Don't Repeat Yourself)**
- Extract duplicate code to utilities
- Reusable base classes (BaseRepository, BaseModel)
- Shared validators and transformers

**YAGNI (You Aren't Gonna Need It)**
- Only build what's needed NOW
- No speculative features
- Implement Phase 1 → Test → Phase 2 (not all at once)

**Feature-Based Structure**
- Organize by domain (auth, workouts, statistics)
- NOT by technical layer (models folder, services folder)
- Each feature is self-contained

### Layer Architecture

```
API Layer (routes/)
  ↓ HTTP concerns only - thin controllers
  ↓ Parse requests, delegate to services, return responses
Service Layer (services/)
  ↓ Business logic orchestration
  ↓ Use cases, workflows, coordinate repositories
Repository Layer (repositories/)
  ↓ Database operations ONLY
  ↓ CRUD, queries, no business logic
Domain Layer (models/)
  ↓ Business entities (SQLAlchemy models)
  ↓ No framework coupling
```

**Rules:**
- Routes NEVER query database directly
- Services NEVER know about HTTP (Request, Response objects)
- Repositories NEVER contain business logic
- Models NEVER have framework dependencies

---

## Directory Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI app initialization
│   │
│   ├── core/                            # Core infrastructure (framework-agnostic)
│   │   ├── config/
│   │   │   ├── base_settings.py         # App settings ONLY (SRP)
│   │   │   ├── oauth_settings.py        # OAuth config ONLY (SRP)
│   │   │   └── security_settings.py     # Security config ONLY (SRP)
│   │   ├── security/
│   │   │   ├── jwt_handler.py           # JWT operations ONLY (SRP)
│   │   │   └── password_handler.py      # Password hashing ONLY (SRP)
│   │   └── oauth/
│   │       ├── provider_interface.py    # ABC for OAuth providers (DIP)
│   │       ├── google_provider.py       # Google implementation (SRP)
│   │       ├── oauth_factory.py         # Factory pattern (OCP)
│   │       ├── oauth_validator.py       # Validate OAuth responses (SRP)
│   │       └── oauth_dto.py             # Data Transfer Objects (SRP)
│   │
│   ├── db/
│   │   ├── base.py                      # SQLAlchemy declarative base
│   │   └── session.py                   # Async session factory
│   │
│   ├── features/                        # Feature-based organization
│   │   ├── auth/                        # Authentication feature
│   │   │   ├── models/user.py           # User SQLAlchemy model
│   │   │   ├── schemas/
│   │   │   │   ├── user_schemas.py      # User request/response
│   │   │   │   ├── token_schemas.py     # Token schemas
│   │   │   │   └── oauth_schemas.py     # OAuth schemas
│   │   │   ├── repositories/
│   │   │   │   ├── base_repository.py   # Generic base (LSP)
│   │   │   │   └── user_repository.py   # User DB operations ONLY
│   │   │   ├── services/
│   │   │   │   ├── oauth_service.py     # OAuth orchestration
│   │   │   │   ├── user_service.py      # User CRUD
│   │   │   │   └── token_service.py     # Token generation
│   │   │   ├── routes/
│   │   │   │   └── oauth_routes.py      # OAuth endpoints ONLY
│   │   │   ├── dependencies.py          # FastAPI DI
│   │   │   ├── exceptions.py            # Custom exceptions
│   │   │   └── transformers.py          # Data transformations
│   │   │
│   │   ├── workouts/                    # Workout tracking feature
│   │   │   ├── models/workout.py        # Workout SQLAlchemy model
│   │   │   ├── schemas/
│   │   │   │   └── workout_schemas.py   # Workout request/response
│   │   │   ├── repositories/
│   │   │   │   └── workout_repository.py # Workout DB operations
│   │   │   ├── services/
│   │   │   │   └── workout_service.py   # Workout business logic
│   │   │   ├── routes/
│   │   │   │   └── workout_routes.py    # Workout endpoints
│   │   │   └── validators/
│   │   │       └── workout_validator.py # Workout validation logic
│   │   │
│   │   └── statistics/                  # Statistics feature
│   │       ├── schemas/
│   │       │   └── statistics_schemas.py # Stats response schemas
│   │       ├── services/
│   │       │   └── statistics_service.py # Stats orchestration
│   │       ├── calculators/             # Pure calculation logic (SRP)
│   │       │   ├── summary_calculator.py
│   │       │   ├── weekly_calculator.py
│   │       │   └── personal_records_calculator.py
│   │       └── routes/
│   │           └── statistics_routes.py # Statistics endpoints
│   │
│   └── shared/                          # Shared utilities
│       ├── exceptions.py                # Global exception handlers
│       ├── middleware.py                # Custom middleware
│       └── utils/
│           ├── date_helpers.py
│           └── validators.py
│
├── alembic/                             # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                      # Pytest fixtures
│   ├── unit/                            # Unit tests (no DB)
│   │   ├── test_jwt_handler.py
│   │   ├── test_oauth_service.py
│   │   └── test_calculators.py
│   └── integration/                     # Integration tests (with DB)
│       ├── test_auth_endpoints.py
│       ├── test_workout_endpoints.py
│       └── test_statistics_endpoints.py
│
├── .env.example                         # Environment template
├── alembic.ini                          # Alembic configuration
├── pyproject.toml                       # uv project file
├── pytest.ini                           # Pytest configuration
├── Dockerfile                           # Production container
└── README.md                            # Backend documentation
```

---

## Implementation Phases

### Phase 1: Authentication & User Management (Week 1)

**Priority:** CRITICAL - Must complete first

**Features:**
- Google OAuth 2.0 integration
- JWT token generation (access + refresh)
- User model with OAuth support
- User CRUD operations
- Protected endpoints

**Components to Build:**

1. **Core Infrastructure**
   - `app/core/config/` - 3 separate config files (SRP)
   - `app/core/security/jwt_handler.py` - JWT operations
   - `app/core/security/password_handler.py` - Password hashing
   - `app/core/oauth/` - OAuth provider layer

2. **Database**
   - `app/db/base.py` - SQLAlchemy base
   - `app/db/session.py` - Async session factory
   - `app/features/auth/models/user.py` - User model

3. **Auth Feature**
   - `app/features/auth/repositories/user_repository.py`
   - `app/features/auth/services/oauth_service.py`
   - `app/features/auth/services/token_service.py`
   - `app/features/auth/routes/oauth_routes.py`

4. **Testing**
   - Unit tests for all services
   - Integration tests for OAuth flow
   - Repository tests with test DB

**API Endpoints:**
```
GET  /api/v1/auth/oauth/{provider}/login      # Redirect to OAuth
GET  /api/v1/auth/oauth/{provider}/callback   # Handle callback
POST /api/v1/auth/refresh                     # Refresh access token
POST /api/v1/auth/logout                      # Clear tokens
GET  /api/v1/users/me                         # Get current user
PUT  /api/v1/users/me                         # Update user
DELETE /api/v1/users/me                       # Delete account
```

**Database Tables:**
- `users` (id, email, username, oauth_provider, oauth_id, avatar_url, created_at, updated_at)

**Success Criteria:**
- ✅ User can sign in with Google
- ✅ JWT tokens issued and validated
- ✅ User persisted in PostgreSQL
- ✅ Protected endpoints require valid JWT
- ✅ Refresh token rotation works
- ✅ Unit tests: >80% coverage
- ✅ Integration tests: All endpoints passing

---

### Phase 2: Workout Management (Week 2)

**Priority:** HIGH - Core app functionality

**Features:**
- Save workout sessions
- Retrieve workout history (paginated)
- Filter workouts by exercise type
- Delete workouts
- Workout validation

**Components to Build:**

1. **Workout Feature**
   - `app/features/workouts/models/workout.py` - Workout model
   - `app/features/workouts/repositories/workout_repository.py`
   - `app/features/workouts/services/workout_service.py`
   - `app/features/workouts/routes/workout_routes.py`
   - `app/features/workouts/validators/workout_validator.py`

2. **Testing**
   - Unit tests for workout service
   - Repository tests
   - Integration tests for endpoints

**API Endpoints:**
```
POST   /api/v1/workouts             # Save workout
GET    /api/v1/workouts             # List (paginated, filtered)
GET    /api/v1/workouts/:id         # Get specific workout
DELETE /api/v1/workouts/:id         # Delete workout
```

**Database Tables:**
- `workouts` (id, user_id FK, exercise_type, reps_count, duration_seconds, calories_burned, created_at)
- Indexes: user_id, created_at, exercise_type

**Validation Rules:**
- `exercise_type`: Enum["push-up", "jump-rope"]
- `reps_count`: Integer >= 0
- `duration_seconds`: Integer >= 0
- `calories_burned`: Optional[Float] >= 0

**Success Criteria:**
- ✅ Workouts saved to database
- ✅ Pagination works correctly
- ✅ Filtering by exercise type works
- ✅ Only user's own workouts accessible
- ✅ Cascade delete on user deletion
- ✅ Unit tests: >80% coverage
- ✅ Integration tests passing

---

### Phase 3: Statistics & Analytics (Week 3)

**Priority:** MEDIUM - Value-add feature

**Features:**
- Overall statistics (total workouts, reps, duration)
- Weekly breakdown (last 7 days)
- Exercise-specific statistics
- Personal records tracking

**Components to Build:**

1. **Statistics Feature**
   - `app/features/statistics/services/statistics_service.py`
   - `app/features/statistics/calculators/` - Pure calculation functions
   - `app/features/statistics/routes/statistics_routes.py`
   - `app/features/statistics/schemas/statistics_schemas.py`

2. **Calculators (SRP)**
   - `summary_calculator.py` - Overall stats
   - `weekly_calculator.py` - Weekly breakdown
   - `personal_records_calculator.py` - Find PRs

3. **Testing**
   - Unit tests for calculators (no DB)
   - Service tests (mocked repository)
   - Integration tests for endpoints

**API Endpoints:**
```
GET /api/v1/statistics/summary            # Overall stats
GET /api/v1/statistics/weekly             # Last 7 days
GET /api/v1/statistics/exercise/:type     # By exercise type
```

**Statistics Calculations:**
- Total workouts count
- Total reps across all workouts
- Total duration (minutes)
- Total calories burned
- Average reps per workout
- Personal records by exercise type
- Workout count by exercise type
- Daily breakdown for last 7 days

**Success Criteria:**
- ✅ Statistics calculated correctly
- ✅ Weekly stats show last 7 days
- ✅ Personal records accurate
- ✅ Efficient queries (no N+1 problems)
- ✅ Unit tests: >80% coverage
- ✅ Integration tests passing

---

### Phase 4: Production Readiness (Week 4)

**Priority:** HIGH - Before deployment

**Features:**
- Rate limiting
- Structured logging
- Error handling
- Health checks
- Performance optimization
- Security audit

**Components:**

1. **Middleware**
   - Rate limiting (slowapi)
   - Request logging
   - Error handling middleware
   - CORS configuration

2. **Monitoring**
   - Health check endpoints
   - Database health check
   - Structured JSON logging
   - Error tracking (Sentry integration ready)

3. **Security**
   - CSRF protection
   - Input sanitization
   - SQL injection prevention (ORM handles this)
   - XSS prevention
   - Rate limiting on auth endpoints

4. **Performance**
   - Database indexes
   - Query optimization
   - Connection pooling
   - Response caching (optional)

**Success Criteria:**
- ✅ Rate limiting active on all endpoints
- ✅ All errors logged with structured JSON
- ✅ Health checks work
- ✅ No security vulnerabilities (Bandit scan)
- ✅ API response time <200ms (p95)
- ✅ Database query time <50ms (p95)
- ✅ Load test: 100 concurrent users

---

## PEP Standards & Pre-Commit Best Practices

### Overview

All code must pass pre-commit hooks before committing. These hooks enforce PEP standards and production-grade code quality. This section documents common issues and how to avoid them.

### Pre-Commit Hooks Configuration

Our pre-commit hooks check for:
- ✅ Trailing whitespace removal
- ✅ End of file fixes
- ✅ YAML/TOML syntax validation
- ✅ Large file detection
- ✅ Merge conflict detection
- ✅ Python debug statements
- ✅ Secret detection
- ✅ **Ruff linting** (14 rule categories)
- ✅ **Ruff formatting** (auto-format code)
- ✅ **MyPy type checking** (strict mode)
- ✅ **Pip-audit** (security vulnerabilities)

### Critical PEP Standards

#### 1. **PEP 8 - Style Guide** ⭐️ MANDATORY

**Line Length:** 100 characters (configured in ruff)

**Naming Conventions:**
```python
# ✅ CORRECT
class UserService:           # PascalCase for classes
    def get_user_by_id():   # snake_case for functions
        MAX_RETRIES = 3     # SCREAMING_SNAKE_CASE for constants
        user_id = uuid4()   # snake_case for variables

# ❌ INCORRECT
class userService:          # Wrong: should be PascalCase
    def GetUserById():     # Wrong: should be snake_case
        maxRetries = 3     # Wrong: should be SCREAMING_SNAKE_CASE
```

**Import Naming:**
```python
# ✅ CORRECT
from datetime import date
from uuid import UUID

# ❌ INCORRECT - N812: Lowercase imported as non-lowercase
from datetime import date as DateType  # Wrong: alias doesn't match convention

# ❌ INCORRECT - N811: Constant imported as non-constant
from uuid import UUID as UUIDType      # Wrong: UUID is a type, not constant
```

**Exception Naming:**
```python
# ✅ CORRECT - N818: Exception names must end with "Error"
class AuthError(Exception):
    pass

class OAuthError(Exception):
    pass

# ❌ INCORRECT
class AuthException(Exception):    # Wrong: should be AuthError
    pass

class OAuthException(Exception):   # Wrong: should be OAuthError
    pass
```

**Built-in Shadowing:**
```python
# ✅ CORRECT - A002: Don't shadow Python builtins
async def get_by_id(self, record_id: UUID) -> ModelType | None:
    result = await self.db.execute(
        select(self.model).where(self.model.id == record_id)
    )
    return result.scalars().first()

# ❌ INCORRECT - Shadows built-in `id()` function
async def get_by_id(self, id: UUID) -> ModelType | None:  # Wrong
    ...
```

#### 2. **PEP 484 - Type Hints** ⭐️ MANDATORY

**All functions must have type hints:**
```python
# ✅ CORRECT
def calculate_calories(reps: int, exercise_type: str) -> float:
    return reps * 0.5

async def get_user(user_id: UUID) -> User | None:
    ...

# ❌ INCORRECT - no-untyped-def
def calculate_calories(reps, exercise_type):  # Wrong: missing types
    return reps * 0.5
```

**Dict type parameters:**
```python
# ✅ CORRECT - type-arg: Always specify dict type parameters
from typing import Any

def get_stats() -> dict[str, Any]:
    return {"total": 100, "average": 50.0}

def decode_token(token: str) -> dict[str, Any] | None:
    ...

# ❌ INCORRECT - Missing type parameters
def get_stats() -> dict:  # Wrong: missing type parameters
    return {"total": 100}
```

**Optional types (Python 3.10+):**
```python
# ✅ CORRECT - Use `| None` for optional types
from datetime import date

def calculate_stats(end_date: date | None = None) -> dict[str, Any]:
    if end_date is None:
        end_date = date.today()
    ...

# ❌ INCORRECT - assignment: Implicit Optional not allowed
def calculate_stats(end_date: date = None):  # Wrong: None doesn't match type
    ...
```

**TYPE_CHECKING for circular imports:**
```python
# ✅ CORRECT - F821: Use TYPE_CHECKING to avoid circular imports
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.features.workouts.models.workout import Workout

class User(Base):
    workouts: Mapped[list["Workout"]] = relationship(...)

# ❌ INCORRECT - Direct import causes circular dependency
from app.features.workouts.models.workout import Workout  # Wrong: circular import

class User(Base):
    workouts: Mapped[list[Workout]] = relationship(...)
```

**Explicit type annotations:**
```python
# ✅ CORRECT - var-annotated: Always annotate dict/list comprehensions
from typing import Any

grouped: dict[date, list[Workout]] = {}
for workout in workouts:
    date_key = workout.created_at.date()
    if date_key not in grouped:
        grouped[date_key] = []
    grouped[date_key].append(workout)

# ❌ INCORRECT - MyPy can't infer complex types
grouped = {}  # Wrong: needs type annotation
for workout in workouts:
    ...
```

**Type casts for Any returns:**
```python
# ✅ CORRECT - no-any-return: Use cast() for JSON/dict operations
from typing import cast

def exchange_code_for_token(code: str) -> str:
    response = await client.post(TOKEN_URL, data={"code": code})
    token_data = response.json()
    return cast(str, token_data["access_token"])  # Explicit cast

# ❌ INCORRECT - Returning Any from str function
def exchange_code_for_token(code: str) -> str:
    response = await client.post(TOKEN_URL, data={"code": code})
    token_data = response.json()
    return token_data["access_token"]  # Wrong: returns Any
```

#### 3. **PEP 3134 - Exception Chaining** ⭐️ MANDATORY

**Always use `from e` or `from None`:**
```python
# ✅ CORRECT - B904: Exception chaining preserves traceback
try:
    user_id = UUID(payload["sub"])
except (KeyError, ValueError) as e:
    raise HTTPException(
        status_code=401,
        detail="Invalid token payload"
    ) from e  # ✅ Preserves original error

# Alternative: Suppress context if not relevant
try:
    result = parse_data(data)
except ParseError:
    raise ValidationError("Invalid data") from None  # ✅ Hides original

# ❌ INCORRECT - Lost traceback information
try:
    user_id = UUID(payload["sub"])
except (KeyError, ValueError):
    raise HTTPException(status_code=401, detail="Invalid")  # Wrong: no `from e`
```

#### 4. **Python 3.14 Compatibility Issues**

**Pydantic date type annotation:**
```python
# ✅ CORRECT - Use explicit import name
from datetime import date

class DailyStats(BaseModel):
    date: date = Field(..., description="Date")

# ❌ INCORRECT - Python 3.14 compatibility issue with Pydantic
from datetime import date as DateType  # Wrong: causes Pydantic error

class DailyStats(BaseModel):
    date: DateType = Field(...)  # Wrong: Pydantic can't process alias
```

**SQLAlchemy UUID type collision:**
```python
# ✅ CORRECT - Alias SQLAlchemy UUID type
from uuid import UUID
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

class Workout(Base):
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id")
    )

# ❌ INCORRECT - Name collision
from uuid import UUID
from sqlalchemy.dialects.postgresql import UUID  # Wrong: conflicts with uuid.UUID

class Workout(Base):
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ...  # Wrong: which UUID?
    )
```

#### 5. **Generic Type Handling**

**SQLAlchemy generics with type ignore:**
```python
# ✅ CORRECT - attr-defined: Use targeted type ignore for generics
class BaseRepository[ModelType: Base]:
    async def get_by_id(self, record_id: UUID) -> ModelType | None:
        # Type ignore needed because mypy doesn't understand generic model access
        result = await self.db.execute(
            select(self.model).where(
                self.model.id == record_id  # type: ignore[attr-defined]
            )
        )
        return result.scalars().first()

# ❌ INCORRECT - MyPy error on generic attribute
class BaseRepository[ModelType: Base]:
    async def get_by_id(self, record_id: UUID) -> ModelType | None:
        result = await self.db.execute(
            select(self.model).where(self.model.id == record_id)  # Error
        )
```

**SQLAlchemy Result type handling:**
```python
# ✅ CORRECT - Handle None before accessing attributes
async def get_stats(user_id: UUID) -> dict[str, Any]:
    result = await self.db.execute(
        select(
            func.count(Workout.id).label("total"),
            func.sum(Workout.reps_count).label("reps")
        ).where(Workout.user_id == user_id)
    )

    stats = result.first()
    if stats is None:  # ✅ Null check before access
        return {"total": 0, "reps": 0}

    return {
        "total": stats.total or 0,
        "reps": stats.reps or 0
    }

# ❌ INCORRECT - union-attr: Accessing None attributes
async def get_stats(user_id: UUID) -> dict[str, Any]:
    result = await self.db.execute(...)
    stats = result.first()

    return {
        "total": stats.total,  # Wrong: stats might be None
        "reps": stats.reps     # Wrong: stats might be None
    }
```

**Remove unused type ignores:**
```python
# ✅ CORRECT - unused-ignore: Remove when TYPE_CHECKING fixes issue
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.features.workouts.models.workout import Workout

class User(Base):
    # TYPE_CHECKING import fixes the issue, no ignore needed
    workouts: Mapped[list["Workout"]] = relationship(...)

# ❌ INCORRECT - Type ignore no longer needed
class User(Base):
    workouts: Mapped[list["Workout"]] = relationship(...)  # type: ignore
```

### Common Pre-Commit Fixes

#### Fix 1: Ruff Auto-Fix
```bash
# Auto-fix most ruff issues
cd server
uv run ruff check . --fix

# Format code automatically
uv run ruff format .
```

#### Fix 2: MyPy Type Errors
```bash
# Run mypy to see all errors
cd server
uv run mypy app

# Common fixes:
# - Add type hints to all functions
# - Use dict[str, Any] instead of dict
# - Add explicit type annotations for comprehensions
# - Use cast() for JSON operations
# - Add null checks before attribute access
```

#### Fix 3: Secret Detection
```bash
# Generate baseline (first time only)
cd server
uv run detect-secrets scan > .secrets.baseline

# Update baseline when adding new secrets (tests, examples)
uv run detect-secrets scan --baseline .secrets.baseline
```

### Pre-Commit Workflow

**Before committing:**
```bash
# Run all checks manually
cd /path/to/workout-buddy
uv run --directory server pre-commit run --all-files

# If errors, fix them:
# 1. Ruff errors: uv run ruff check . --fix
# 2. MyPy errors: Add types, null checks, casts
# 3. Re-run pre-commit until all pass

# Then commit
git add .
git commit -m "feat(api): add workout statistics endpoint"
```

**Common error patterns:**
```bash
# Error: B904 - Missing exception chain
# Fix: Add `from e` or `from None`

# Error: N818 - Exception naming
# Fix: Rename XxxException to XxxError

# Error: F821 - Undefined name
# Fix: Add TYPE_CHECKING import

# Error: A002 - Shadowing builtin
# Fix: Rename parameter (id → record_id)

# Error: type-arg - Missing dict type
# Fix: Change dict to dict[str, Any]

# Error: no-any-return - Returning Any
# Fix: Use cast(str, value)

# Error: union-attr - None attribute access
# Fix: Add null check before accessing
```

### Integration with Settings

**SecuritySettings instantiation:**
```python
# ✅ CORRECT - call-arg: Provide defaults for required fields
from pydantic_settings import BaseSettings, SettingsConfigDict

class SecuritySettings(BaseSettings):
    SECRET_KEY: str = ""  # ✅ Default empty, .env overrides
    DATABASE_URL: str = ""  # ✅ Default empty, .env overrides
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

# Singleton - loads from .env automatically
security_settings = SecuritySettings()  # ✅ No error

# ❌ INCORRECT - Missing required arguments
class SecuritySettings(BaseSettings):
    SECRET_KEY: str  # Wrong: no default
    DATABASE_URL: str  # Wrong: no default

security_settings = SecuritySettings()  # Error: missing arguments
```

---

## Coding Standards

### General Rules

**File Organization:**
- Max 200 lines per file (split if larger)
- One class per file
- Group related functions together
- Clear section comments for file structure

**Naming Conventions:**
- `snake_case` for variables, functions, files
- `PascalCase` for classes
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names (no abbreviations)
  - ✅ `user_repository`, `calculate_weekly_stats`
  - ❌ `usr_repo`, `calc_wk_stats`

**Function Rules:**
- Max 20 lines per function (ideally)
- Single responsibility
- Clear, descriptive names
- Type hints for all parameters and return values

**Type Hints (Mandatory):**
```python
# ✅ GOOD
def get_user_by_id(user_id: UUID) -> Optional[User]:
    ...

# ❌ BAD
def get_user_by_id(user_id):
    ...
```

**Docstrings:**
```python
def calculate_total_reps(workouts: List[Workout]) -> int:
    """
    Calculate total reps across all workouts.

    Args:
        workouts: List of workout objects

    Returns:
        Total rep count

    Raises:
        ValueError: If workouts list is None
    """
```

### Layer-Specific Standards

**API Layer (Routes):**
```python
# ✅ GOOD - Thin controller
@router.post("/workouts", response_model=WorkoutResponse)
async def create_workout(
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """Save a completed workout."""
    workout = await workout_service.save_workout(current_user.id, workout_data)
    return workout

# ❌ BAD - Business logic in route
@router.post("/workouts")
async def create_workout(workout_data: WorkoutCreate):
    # Validate workout (SHOULD BE IN SERVICE)
    if workout_data.reps_count < 0:
        raise HTTPException(400, "Invalid reps")

    # Create workout (SHOULD BE IN REPOSITORY)
    workout = Workout(**workout_data.dict())
    db.add(workout)
    await db.commit()

    return workout
```

**Service Layer:**
```python
# ✅ GOOD - Orchestrates, no HTTP/SQL
class WorkoutService:
    def __init__(self, workout_repo: WorkoutRepository):
        self._workout_repo = workout_repo

    async def save_workout(
        self,
        user_id: UUID,
        workout_data: WorkoutCreate
    ) -> Workout:
        """
        Save a workout for a user.

        Business logic: Validates workout data, calculates calories if not provided.
        """
        # Validation
        if workout_data.reps_count < 0:
            raise ValueError("Reps count must be non-negative")

        # Business logic
        if not workout_data.calories_burned:
            workout_data.calories_burned = self._calculate_calories(workout_data)

        # Delegate to repository
        return await self._workout_repo.create_workout(user_id, workout_data)

# ❌ BAD - Service knows about HTTP
class WorkoutService:
    async def save_workout(self, request: Request):  # ❌ Request object
        raise HTTPException(400, "Bad request")      # ❌ HTTP exception
```

**Repository Layer:**
```python
# ✅ GOOD - Database operations only
class WorkoutRepository(BaseRepository[Workout]):
    async def create_workout(
        self,
        user_id: UUID,
        workout_data: dict
    ) -> Workout:
        """Create a new workout record."""
        workout = Workout(user_id=user_id, **workout_data)
        self._db.add(workout)
        await self._db.commit()
        await self._db.refresh(workout)
        return workout

    async def get_user_workouts(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20
    ) -> List[Workout]:
        """Get user's workouts with pagination."""
        query = (
            select(Workout)
            .where(Workout.user_id == user_id)
            .order_by(Workout.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._db.execute(query)
        return result.scalars().all()

# ❌ BAD - Business logic in repository
class WorkoutRepository:
    async def create_workout(self, workout_data: dict):
        # ❌ Validation (should be in service)
        if workout_data['reps_count'] < 0:
            raise ValueError("Invalid reps")

        # ❌ Calculation (should be in service)
        workout_data['calories'] = workout_data['reps'] * 0.5

        workout = Workout(**workout_data)
        self._db.add(workout)
        await self._db.commit()
```

### Error Handling

**Custom Exceptions:**
```python
# app/features/auth/exceptions.py
class AuthException(Exception):
    """Base exception for auth feature."""

class InvalidCredentialsError(AuthException):
    """Invalid username or password."""

class UserAlreadyExistsError(AuthException):
    """User with this email already exists."""

class OAuthProviderError(AuthException):
    """OAuth provider communication failed."""
```

**Usage in Service:**
```python
class AuthService:
    async def register_user(self, user_data: UserCreate) -> User:
        # Check if user exists
        existing = await self._user_repo.get_by_email(user_data.email)
        if existing:
            raise UserAlreadyExistsError(f"Email {user_data.email} already registered")

        # Create user
        return await self._user_repo.create_user(user_data)
```

**Exception Handler (main.py):**
```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(UserAlreadyExistsError)
async def user_exists_handler(request: Request, exc: UserAlreadyExistsError):
    return JSONResponse(
        status_code=409,
        content={"detail": str(exc)}
    )

@app.exception_handler(InvalidCredentialsError)
async def invalid_creds_handler(request: Request, exc: InvalidCredentialsError):
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid credentials"}
    )
```

---

## Package Versions

### Core Dependencies

**pyproject.toml:**
```toml
[project]
name = "workout-buddy-api"
version = "1.0.0"
description = "AI-powered exercise counter API"
requires-python = ">=3.14"

dependencies = [
    "fastapi>=0.128.0",
    "uvicorn[standard]>=1.33.0",
    "sqlalchemy[asyncio]>=2.0.36",
    "asyncpg>=0.30.0",           # Better async than psycopg2
    "alembic>=1.14.0",
    "pydantic>=2.10.0",
    "pydantic-settings>=2.7.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[argon2]>=1.7.4",    # Argon2 > bcrypt
    "python-multipart>=0.0.20",
    "python-dotenv>=1.0.0",
    "authlib>=1.4.0",            # OAuth2
    "httpx>=0.28.0",             # Async HTTP
    "slowapi>=0.1.9",            # Rate limiting
    "python-json-logger>=3.2.0", # Structured logging
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-asyncio>=0.25.0",
    "pytest-cov>=6.0.0",
    "httpx>=0.28.0",             # For testing
    "ruff>=0.9.0",               # Linter (100x faster than pylint)
    "mypy>=1.14.0",              # Type checker
    "bandit>=1.8.0",             # Security scanner
]

[tool.ruff]
line-length = 100
target-version = "py314"
select = ["E", "F", "I", "N", "W", "UP", "B", "A"]

[tool.ruff.lint]
ignore = ["E501"]  # Line too long (formatter handles this)

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
asyncio_mode = "auto"
addopts = "--cov=app --cov-report=html --cov-report=term"

[tool.mypy]
python_version = "3.14"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### Installation Commands

```bash
# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
cd server
uv venv

# Activate venv
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Install dependencies
uv pip install -e .
uv pip install -e ".[dev]"

# Verify installation
python --version  # Should be 3.14.x
uv pip list       # Show all packages
```

---

## Testing Strategy

### Test Structure

```
tests/
├── conftest.py                    # Shared fixtures
├── unit/                          # No external dependencies
│   ├── test_jwt_handler.py
│   ├── test_password_handler.py
│   ├── test_google_provider.py   # Mock httpx
│   ├── test_oauth_service.py     # Mock dependencies
│   └── test_calculators.py       # Pure functions
└── integration/                   # With test database
    ├── test_auth_endpoints.py
    ├── test_workout_endpoints.py
    └── test_statistics_endpoints.py
```

### Test Fixtures (conftest.py)

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from httpx import AsyncClient
from app.main import app
from app.db.base import Base

# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/workout_buddy_test"

@pytest.fixture
async def async_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def async_session(async_engine):
    """Create test database session."""
    async with AsyncSession(async_engine) as session:
        yield session

@pytest.fixture
async def client():
    """Create test HTTP client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def sample_user_data():
    """Sample user data for tests."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "oauth_provider": "google",
        "oauth_id": "google-123456"
    }
```

### Unit Test Example

```python
# tests/unit/test_jwt_handler.py
import pytest
from uuid import uuid4
from app.core.security.jwt_handler import JWTHandler
from app.core.config.security_settings import SecuritySettings

@pytest.fixture
def jwt_handler():
    settings = SecuritySettings(SECRET_KEY="test-secret-key")
    return JWTHandler(settings)

def test_create_access_token(jwt_handler):
    """Test JWT access token creation."""
    user_id = uuid4()
    token = jwt_handler.create_access_token(user_id)

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0

def test_decode_valid_token(jwt_handler):
    """Test decoding valid JWT token."""
    user_id = uuid4()
    token = jwt_handler.create_access_token(user_id)

    payload = jwt_handler.decode_token(token)

    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"

def test_decode_invalid_token(jwt_handler):
    """Test decoding invalid token returns None."""
    payload = jwt_handler.decode_token("invalid.token.here")

    assert payload is None
```

### Integration Test Example

```python
# tests/integration/test_auth_endpoints.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_google_oauth_login_redirect(client: AsyncClient):
    """Test Google OAuth login redirects to Google."""
    response = await client.get("/api/v1/auth/oauth/google/login", follow_redirects=False)

    assert response.status_code == 307
    assert "accounts.google.com" in response.headers["location"]

@pytest.mark.asyncio
async def test_get_current_user_without_token(client: AsyncClient):
    """Test accessing protected endpoint without token returns 401."""
    response = await client.get("/api/v1/users/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_get_current_user_with_valid_token(client: AsyncClient, sample_user_data):
    """Test accessing protected endpoint with valid token."""
    # Create user and get token
    # ... (setup code)

    response = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == sample_user_data["email"]
```

### Coverage Goals

- **Services:** >80% line coverage
- **Repositories:** >80% line coverage
- **Routes:** >70% line coverage
- **Overall:** >60% line coverage

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_jwt_handler.py

# Run tests matching pattern
pytest -k "test_oauth"

# Run with verbose output
pytest -v

# Run integration tests only
pytest tests/integration/

# Generate coverage report
pytest --cov=app --cov-report=html
open htmlcov/index.html  # View coverage report
```

---

## Quality Checklist

### Before Committing

- [ ] All tests passing
- [ ] Code coverage >60% overall
- [ ] Ruff linting passes (`ruff check .`)
- [ ] MyPy type check passes (`mypy app`)
- [ ] No security issues (`bandit -r app`)
- [ ] Docstrings for all public functions
- [ ] Type hints on all functions
- [ ] No `print()` statements (use logging)
- [ ] No commented-out code
- [ ] Conventional commit message

### Before Merging to Main

- [ ] All CI checks pass
- [ ] Code reviewed (min 1 approval)
- [ ] Integration tests pass
- [ ] Database migrations tested
- [ ] API documentation updated
- [ ] No breaking changes (or documented)

### Before Production Deploy

- [ ] All tests pass (unit + integration)
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring/logging configured
- [ ] Rollback plan documented

---

## Quick Reference

### Common Commands

```bash
# Development
uv run uvicorn app.main:app --reload
uv run pytest
uv run ruff check .
uv run mypy app

# Database
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
uv run alembic downgrade -1

# Testing
uv run pytest tests/unit/
uv run pytest tests/integration/
uv run pytest --cov=app
```

### File Templates

Refer to existing files in the codebase for templates:
- Route: `app/features/auth/routes/oauth_routes.py`
- Service: `app/features/auth/services/oauth_service.py`
- Repository: `app/features/auth/repositories/user_repository.py`
- Model: `app/features/auth/models/user.py`
- Schema: `app/features/auth/schemas/user_schemas.py`

---

**Last Updated:** 2026-01-04
**Maintainer:** Development Team
**Questions:** Reference this document for all backend development decisions
