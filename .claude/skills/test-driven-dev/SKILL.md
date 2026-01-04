---
name: test-driven-development
description: Write tests first before implementing features following TDD (Test-Driven Development) methodology. Use when user asks to add tests, implement features with tests, or mentions TDD/testing.
allowed-tools: Read, Write, Edit, Bash
---

# Test-Driven Development (TDD) Skill

Follow the Red-Green-Refactor cycle for implementing features with tests first.

## TDD Cycle

1. **RED** - Write a failing test for the desired behavior
2. **GREEN** - Write minimal code to make the test pass
3. **REFACTOR** - Improve code quality without breaking tests

## Project Testing Stack

### Frontend (React + TypeScript)
- **Framework**: Vitest (faster than Jest, Vite-native)
- **React Testing**: @testing-library/react
- **Assertions**: @testing-library/jest-dom
- **Mocking**: Vitest built-in mocks

### Backend (FastAPI + Python)
- **Framework**: pytest + pytest-asyncio
- **Coverage**: pytest-cov
- **HTTP Testing**: httpx (async client)
- **Database**: Test fixtures with isolated DB

## Testing Best Practices

### DO:
✅ Test behavior, not implementation
✅ Use descriptive test names (`should_count_pushup_when_elbow_angle_below_90`)
✅ Arrange-Act-Assert pattern
✅ Test edge cases and error conditions
✅ Keep tests independent (no shared state)
✅ Use factories/fixtures for test data
✅ Mock external dependencies (API calls, time)

### DON'T:
❌ Test private implementation details
❌ Use snapshot testing excessively
❌ Create flaky tests (timing-dependent)
❌ Skip edge cases
❌ Test trivial getters/setters
❌ Mock everything (integration tests need some real code)

## Test Structure

### Frontend Test Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
    vi.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    // Arrange
    const props = { /* ... */ };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    // Arrange
    const onClickMock = vi.fn();
    render(<ComponentName onClick={onClickMock} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() => expect(onClickMock).toHaveBeenCalledOnce());
  });
});
```

### Backend Test Template
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_workout_success(async_client: AsyncClient, auth_headers):
    # Arrange
    workout_data = {
        "exercise_type": "push-up",
        "reps_count": 20,
        "duration_seconds": 60
    }

    # Act
    response = await async_client.post(
        "/api/v1/workouts",
        json=workout_data,
        headers=auth_headers
    )

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["exercise_type"] == "push-up"
    assert data["reps_count"] == 20

@pytest.mark.asyncio
async def test_create_workout_invalid_reps(async_client: AsyncClient, auth_headers):
    # Arrange
    workout_data = {"exercise_type": "push-up", "reps_count": -5}

    # Act
    response = await async_client.post(
        "/api/v1/workouts",
        json=workout_data,
        headers=auth_headers
    )

    # Assert
    assert response.status_code == 422
    assert "reps_count" in response.json()["detail"][0]["loc"]
```

## Test Coverage Goals

- **Services/Logic**: >90% coverage (business logic is critical)
- **API Endpoints**: >80% coverage (test all paths)
- **Components**: >70% coverage (UI has more edge cases)
- **Utils**: 100% coverage (should be pure functions)

## TDD Workflow

1. **User provides feature request**
   - Example: "Add push-up counter logic"

2. **Write failing test first**
   ```typescript
   it('should count push-up when elbow angle goes below 90 degrees', () => {
     const counter = new PushUpCounter();
     counter.updatePose({ elbowAngle: 85 });
     expect(counter.getCount()).toBe(0); // Not counted yet
     counter.updatePose({ elbowAngle: 165 });
     expect(counter.getCount()).toBe(1); // Counted after full rep
   });
   ```

3. **Run test to confirm it fails**
   ```bash
   pnpm test push-up-counter.test.ts
   # Expected: Test fails (class doesn't exist yet)
   ```

4. **Write minimal implementation**
   ```typescript
   class PushUpCounter {
     private count = 0;
     private isDown = false;

     updatePose({ elbowAngle }: { elbowAngle: number }) {
       if (elbowAngle < 90 && !this.isDown) {
         this.isDown = true;
       } else if (elbowAngle > 160 && this.isDown) {
         this.count++;
         this.isDown = false;
       }
     }

     getCount() { return this.count; }
   }
   ```

5. **Run test to confirm it passes**
   ```bash
   pnpm test push-up-counter.test.ts
   # Expected: Test passes ✓
   ```

6. **Refactor if needed**
   - Extract magic numbers to constants
   - Improve naming
   - Add comments for complex logic

7. **Commit tests + implementation together**
   ```bash
   git add .
   git commit -m "feat(exercises): add push-up counter with angle detection"
   ```

## Running Tests

### Frontend
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test push-up-counter.test.ts

# Run with coverage
pnpm test --coverage

# Run tests in UI mode
pnpm test:ui
```

### Backend
```bash
# Run all tests
uv run pytest

# Run specific test
uv run pytest tests/test_workouts.py

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run only unit tests
uv run pytest tests/unit

# Run only integration tests
uv run pytest tests/integration
```

## Example: Adding a Feature with TDD

**Feature**: Save workout to database

### Step 1: Write Test (RED)
```python
@pytest.mark.asyncio
async def test_save_workout_creates_record(db_session, test_user):
    # Arrange
    service = WorkoutService(db_session)
    workout_data = {
        "user_id": test_user.id,
        "exercise_type": "push-up",
        "reps_count": 25,
        "duration_seconds": 120
    }

    # Act
    workout = await service.create_workout(workout_data)

    # Assert
    assert workout.id is not None
    assert workout.reps_count == 25
    assert workout.user_id == test_user.id
```

### Step 2: Run Test (Fails)
```bash
uv run pytest tests/test_workout_service.py
# Expected: Method doesn't exist, test fails
```

### Step 3: Implement (GREEN)
```python
class WorkoutService:
    def __init__(self, db: Session):
        self.repo = WorkoutRepository(db)

    async def create_workout(self, data: dict) -> Workout:
        workout = Workout(**data)
        return await self.repo.create(workout)
```

### Step 4: Run Test (Passes)
```bash
uv run pytest tests/test_workout_service.py
# Expected: Test passes ✓
```

### Step 5: Refactor
- Extract validation
- Add error handling
- Update type hints

## When to Use TDD

✅ **Always use for:**
- Business logic (exercise counting, statistics)
- API endpoints (CRUD operations)
- Utilities (angle calculation, date formatting)
- Bug fixes (write test that reproduces bug first)

⚠️ **Optional for:**
- UI components (can test after implementation)
- Prototypes (when exploring design)
- Simple configurations

❌ **Don't use for:**
- Trivial getters/setters
- Third-party integrations (use integration tests instead)

## Verification

After implementing with TDD:
1. All tests pass ✓
2. Coverage meets targets ✓
3. Tests are readable and maintainable ✓
4. No flaky tests ✓
5. Fast test execution (<10s for unit tests) ✓
