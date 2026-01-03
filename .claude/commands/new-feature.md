# New Feature Command

Create a new feature following the project architecture, TDD methodology, and SOLID principles.

**Usage:** `/new-feature <feature-name> <description>`

**Example:** `/new-feature jump-rope-counter "Add jump rope exercise with ankle tracking"`

## Steps to Execute

This command follows the Explore-Plan-Code-Review-Commit pattern from the architecture document.

### 1. Explore
- Use the Explore agent to understand where this feature fits in the codebase
- Review the feature-based structure defined in the architecture
- Identify similar existing features to maintain consistency

### 2. Plan
- Design the feature architecture following SOLID principles:
  - **SRP**: Each module/class has one responsibility
  - **OCP**: Open for extension, closed for modification
  - **LSP**: Subtypes must be substitutable
  - **ISP**: Segregated interfaces
  - **DIP**: Depend on abstractions
- Identify which files need to be created/modified
- Consider the testing strategy (TDD approach)
- Apply YAGNI: Only build what's needed for MVP

### 3. Test First (TDD - Red-Green-Refactor)
- **RED**: Write failing unit tests for the core logic
- **GREEN**: Write minimal code to pass tests
- **REFACTOR**: Improve code quality without breaking tests
- Write failing integration tests if needed
- Target >80% coverage for services/logic

### 4. Implement
- Write minimal code to pass tests
- Follow feature-based architecture
- Keep functions small (<20 lines ideally, <50 max)
- Use proper naming conventions:
  - **Frontend**: camelCase (variables/functions), PascalCase (components/classes)
  - **Backend**: snake_case (variables/functions), PascalCase (classes)

### 5. Refactor
- Extract duplicated code (DRY principle)
- Improve naming clarity
- Add comments only where logic isn't self-evident
- Ensure <10 complexity (cyclomatic)

### 6. Review
- Run code-review skill automatically
- Verify all tests pass
- Check test coverage
- Verify SOLID principles applied
- Check for security issues (OWASP Top 10)

### 7. Commit
- Use conventional commit format: `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci
- Include both tests and implementation

## Feature Structure Templates

### Frontend Feature (Feature-Based Architecture)

```
client/src/features/$ARGUMENTS/
├── components/              # React components (SRP)
│   ├── FeatureMain.tsx
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/                   # Custom React hooks
│   ├── useFeature.ts
│   └── useFeatureData.ts
├── services/                # API calls and external services
│   └── featureService.ts
├── logic/                   # Business logic (algorithms, calculations)
│   └── featureLogic.ts     # Pure functions for testability
├── store/                   # Zustand state management
│   └── featureStore.ts
├── types/                   # TypeScript type definitions
│   └── feature.types.ts
├── utils/                   # Feature-specific utilities
│   └── featureHelpers.ts
└── __tests__/              # Tests colocated with feature
    ├── featureLogic.test.ts
    ├── FeatureMain.test.tsx
    └── featureService.test.ts
```

### Backend Feature (Feature-Based Architecture)

```
server/app/
├── models/                  # SQLAlchemy ORM models
│   └── feature.py
├── schemas/                 # Pydantic validation schemas
│   └── feature.py          # FeatureCreate, FeatureRead, FeatureUpdate
├── api/v1/endpoints/        # FastAPI route handlers
│   └── feature.py
├── services/                # Business logic layer (SRP)
│   └── feature_service.py  # Handles business rules
├── repositories/            # Data access layer (SRP)
│   └── feature_repository.py  # Database operations only
└── tests/
    ├── unit/
    │   └── test_feature_service.py
    └── integration/
        └── test_feature_endpoints.py
```

### Shared Utilities (DRY Principle)

```
client/src/shared/utils/     # Reusable utilities
├── calculations.ts          # calculateAngle, calculateDistance
├── validators.ts            # Input validation helpers
├── formatters.ts            # Date/number formatting
└── constants.ts             # Shared constants
```

## Architecture Alignment Checklist

### SOLID Principles
- [ ] Each class/module has single responsibility (SRP)
- [ ] Can extend without modifying existing code (OCP)
- [ ] Subtypes are substitutable for base types (LSP)
- [ ] Interfaces are focused and minimal (ISP)
- [ ] Dependencies on abstractions, not concretions (DIP)

### Code Quality Standards
- [ ] Functions <50 lines (warn), <20 lines (ideal)
- [ ] Complexity <10 (cyclomatic)
- [ ] No `any` types in TypeScript
- [ ] Type hints in Python
- [ ] No console.log or print() in production code
- [ ] Proper error handling with user-friendly messages

### Testing (TDD)
- [ ] Tests written BEFORE implementation
- [ ] Unit tests for logic/services (>90% coverage)
- [ ] Integration tests for API endpoints (>80% coverage)
- [ ] Component tests for React (>70% coverage)
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Tests are independent (no shared state)

### Naming Conventions
- [ ] **Frontend**: camelCase variables, PascalCase components
- [ ] **Backend**: snake_case variables, PascalCase classes
- [ ] **Files**: kebab-case or camelCase (be consistent)
- [ ] **Constants**: SCREAMING_SNAKE_CASE
- [ ] Clear, descriptive names (no abbreviations)

### Performance
- [ ] No duplicate code (DRY principle)
- [ ] Shared utilities extracted to `/shared`
- [ ] Memoization for expensive operations (React.memo, useMemo)
- [ ] Database queries optimized with proper indexes

### Security
- [ ] Input validation (Zod for frontend, Pydantic for backend)
- [ ] SQL injection prevention (use ORM)
- [ ] XSS prevention (React escapes by default)
- [ ] No secrets in code
- [ ] Proper authentication/authorization checks

### Documentation
- [ ] README updated if needed
- [ ] API docs generated (Swagger for backend)
- [ ] Complex logic has explanatory comments
- [ ] Type definitions are clear

## Examples from Architecture Document

### Exercise Counter Example (OCP Principle)

```typescript
// Interface allows extension without modification
interface ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean;
  getProgress(): number;
}

// Each exercise implements the interface
class PushUpCounter implements ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean {
    const elbowAngle = calculateAngle(
      pose.landmarks[11],  // shoulder
      pose.landmarks[13],  // elbow
      pose.landmarks[15]   // wrist
    );
    return elbowAngle < 90 && this.wasInUpPosition(previousPose);
  }
}

// Adding new exercise doesn't modify existing code
class JumpRopeCounter implements ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean {
    const ankleHeight = this.getAnkleHeight(pose);
    return ankleHeight > this.jumpThreshold && this.wasOnGround(previousPose);
  }
}
```

### DRY Principle Example

```typescript
// ✅ GOOD: Shared utility function (DRY)
// File: client/src/shared/utils/calculations.ts
export function calculateAngle(
  pointA: Landmark,
  pointB: Landmark,
  pointC: Landmark
): number {
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  return Math.abs((radians * 180.0) / Math.PI);
}

// Both counters use the same function
class PushUpCounter {
  countRep(pose: Pose): boolean {
    const angle = calculateAngle(
      pose.landmarks[11],  // shoulder
      pose.landmarks[13],  // elbow
      pose.landmarks[15]   // wrist
    );
    return angle < 90;
  }
}
```

### Backend Service/Repository Pattern (SRP)

```python
# ✅ GOOD: Separated responsibilities

# services/workout_service.py - Business logic only
class WorkoutService:
    def __init__(self, workout_repo: WorkoutRepository):
        self.workout_repo = workout_repo  # DIP: depend on abstraction

    def create_workout(self, workout_data: WorkoutCreate) -> Workout:
        validated_workout = self._validate_workout(workout_data)
        return self.workout_repo.create(validated_workout)

# repositories/workout_repository.py - Database operations only
class WorkoutRepository:
    def create(self, workout: Workout) -> Workout:
        # Database logic only
        pass
```

## Post-Implementation Verification

After creating the feature:

### Run Tests
```bash
# Frontend
pnpm test                    # All tests
pnpm test --coverage         # With coverage report

# Backend
uv run pytest                # All tests
uv run pytest --cov          # With coverage report
```

### Run Linting
```bash
# Frontend
pnpm lint                    # ESLint check
pnpm type-check              # TypeScript validation

# Backend
uv run ruff check .          # Ruff linting
uv run mypy app              # Type checking
```

### Build Check
```bash
# Frontend
pnpm build                   # Production build

# Backend
# (Python doesn't require build, but check imports)
python -m compileall -q server/app
```

### Commit
```bash
git add .
git commit -m "feat($ARGUMENTS): <concise description>

<detailed description>

- Test coverage: >80%
- Follows SOLID principles
- Feature-based architecture

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Reference

- **Architecture Document**: [exercise-buddy-architecture.md](../../exercise-buddy-architecture.md)
- **CLAUDE.md**: [CLAUDE.md](../../CLAUDE.md)
- **Skills**: [.claude/skills/](.claude/skills/)
