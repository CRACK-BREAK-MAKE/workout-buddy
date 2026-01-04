# Testing Guide

**Version:** 1.0
**Last Updated:** 2026-01-03

---

## Overview

Workout Buddy follows Test-Driven Development (TDD) methodology. Write tests FIRST, then implement features.

### Testing Strategy

| Test Type | Framework | Coverage Target | Purpose |
|-----------|-----------|-----------------|---------|
| **Unit Tests** | Vitest (frontend), Pytest (backend) | >80% for business logic | Test individual functions/components |
| **Integration Tests** | Vitest + Testing Library, Pytest | >60% for API endpoints | Test feature workflows |
| **E2E Tests** | Cypress (future) | Critical user flows | Test complete user journeys |

---

## Frontend Testing (Vitest + React Testing Library)

### Running Tests

```bash
cd client

# Run all tests
pnpm test

# Watch mode (re-run on file changes)
pnpm test --watch

# Coverage report
pnpm test --coverage

# Run specific test file
pnpm test src/features/exercises/pushUpCounter.test.ts
```

### Writing Unit Tests

**Location:** Colocate tests with implementation (`*.test.ts` or `__tests__/` folder)

```typescript
// src/features/exercises/logic/pushUpCounter.test.ts
import { describe, it, expect } from 'vitest';
import { PushUpCounter } from './pushUpCounter';

describe('PushUpCounter', () => {
  it('should count a rep when angle crosses threshold', () => {
    // Arrange
    const counter = new PushUpCounter();

    // Act
    counter.processAngle(85);  // Down position (< 90°)
    counter.processAngle(165); // Up position (> 160°)

    // Assert
    expect(counter.getReps()).toBe(1);
  });

  it('should not count incomplete reps', () => {
    const counter = new PushUpCounter();

    counter.processAngle(85);  // Down
    counter.processAngle(120); // Not fully up

    expect(counter.getReps()).toBe(0);
  });
});
```

### Writing Component Tests

```typescript
// src/features/auth/components/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Act
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

---

## Backend Testing (Pytest)

### Running Tests

```bash
cd server
source .venv/bin/activate

# Run all tests
uv run pytest

# Watch mode
uv run pytest-watch

# Coverage report
uv run pytest --cov=app --cov-report=html

# Run specific test
uv run pytest tests/test_auth.py::test_register_user
```

### Writing Unit Tests

**Location:** `server/tests/` directory

```python
# tests/test_workout_service.py
import pytest
from app.features.workouts.service import WorkoutService
from app.features.workouts.schemas import WorkoutCreate

@pytest.mark.asyncio
async def test_create_workout(db_session):
    # Arrange
    service = WorkoutService(db_session)
    workout_data = WorkoutCreate(
        exercise_type="push-up",
        reps_count=25,
        duration_seconds=180,
        calories_burned=12.5
    )
    user_id = "550e8400-e29b-41d4-a716-446655440000"

    # Act
    workout = await service.create_workout(user_id, workout_data)

    # Assert
    assert workout.exercise_type == "push-up"
    assert workout.reps_count == 25
    assert workout.user_id == user_id
```

### Writing API Tests

```python
# tests/test_api_workouts.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_workout_endpoint(async_client: AsyncClient, auth_token: str):
    # Arrange
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "exercise_type": "push-up",
        "reps_count": 25,
        "duration_seconds": 180
    }

    # Act
    response = await async_client.post(
        "/api/v1/workouts",
        json=payload,
        headers=headers
    )

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["exercise_type"] == "push-up"
    assert data["reps_count"] == 25
```

### Test Fixtures

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from httpx import AsyncClient
from app.main import app
from app.core.database import get_db

@pytest.fixture
async def db_session():
    """Provide a test database session."""
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/test_db")
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def async_client():
    """Provide an async HTTP client for testing API endpoints."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def auth_token(db_session):
    """Provide a valid JWT token for authenticated requests."""
    # Create test user and return token
    token = create_access_token({"sub": "test@example.com"})
    return token
```

---

## TDD Workflow (Red-Green-Refactor)

### Step 1: RED - Write Failing Test

```typescript
// Write test FIRST
it('should calculate angle between three points', () => {
  const angle = calculateAngle(pointA, pointB, pointC);
  expect(angle).toBe(90);
});

// Run test: ❌ FAILS (function doesn't exist yet)
```

### Step 2: GREEN - Write Minimal Code to Pass

```typescript
// Implement just enough to pass
function calculateAngle(a, b, c) {
  // Minimal implementation
  const radians = Math.atan2(c.y - b.y, c.x - b.x) -
                  Math.atan2(a.y - b.y, a.x - b.x);
  return Math.abs(radians * 180 / Math.PI);
}

// Run test: ✅ PASSES
```

### Step 3: REFACTOR - Improve Code Quality

```typescript
// Refactor for clarity, extract constants
const RADIANS_TO_DEGREES = 180 / Math.PI;

function calculateAngle(
  pointA: Point,
  pointB: Point,
  pointC: Point
): number {
  const angle1 = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x);
  const angle2 = Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  const radians = angle1 - angle2;

  return Math.abs(radians * RADIANS_TO_DEGREES);
}

// Run test: ✅ STILL PASSES
```

---

## Coverage Requirements

### Targets

* **Business Logic:** >80% coverage (exercise counters, calculations)
* **API Endpoints:** 100% coverage (all routes tested)
* **UI Components:** >60% coverage (critical user flows)
* **Overall:** >70% coverage

### Viewing Coverage Reports

**Frontend:**
```bash
cd client
pnpm test --coverage
# Open coverage/index.html in browser
```

**Backend:**
```bash
cd server
uv run pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

---

## CI/CD Integration

Tests run automatically on every pull request via GitHub Actions:

```yaml
# .github/workflows/ci-frontend.yml
- name: Run frontend tests
  run: |
    cd client
    pnpm test --coverage

# .github/workflows/ci-backend.yml
- name: Run backend tests
  run: |
    cd server
    uv run pytest --cov=app
```

**Pull requests must pass all tests before merging.**

---

## Best Practices

1. **Write Tests First:** TDD methodology (Red-Green-Refactor)
2. **Test Behavior, Not Implementation:** Focus on what, not how
3. **Arrange-Act-Assert:** Clear test structure
4. **Descriptive Names:** Test names should explain what's being tested
5. **One Assertion Per Test:** Makes failures easier to diagnose
6. **Avoid Test Interdependence:** Each test should run independently
7. **Mock External Dependencies:** Database, APIs, file system

---

## Additional Resources

* [Vitest Documentation](https://vitest.dev/)
* [React Testing Library](https://testing-library.com/react)
* [Pytest Documentation](https://docs.pytest.org/)
* [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Last Updated:** 2026-01-03
