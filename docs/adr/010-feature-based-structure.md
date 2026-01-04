# ADR-010: Feature-Based Code Organization

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, Senior Developers

## Context and Problem Statement

We need a folder structure that scales from 10 files to 1000+ files while remaining intuitive and maintainable. The structure should align with SOLID principles (especially Single Responsibility Principle), support multiple developers working simultaneously, and make it easy to find and modify code as the application grows.

## Decision Drivers

* Must align with SOLID principles (especially Single Responsibility)
* Must scale from small MVP to large production application
* Should minimize merge conflicts when multiple developers work simultaneously
* Must make it easy to find relevant code (discoverability)
* Should support clear separation of concerns
* Must facilitate testing (colocated tests with implementation)
* Should enable easy refactoring (extracting features into separate services)
* Must be intuitive for new developers joining the team
* Should work well for both frontend (React) and backend (FastAPI)

## Considered Options

1. **Feature-Based Structure** - Organize by business domain (auth, exercises, workouts)
2. **Flat Structure** - All files in src/components, src/utils, src/services (simple but doesn't scale)
3. **Layer-Based Structure** - Organize by technical layer (controllers, models, views, services)

## Decision

Use **Feature-Based (Domain-Driven) Structure** for both frontend and backend

## Rationale

### Alignment with SOLID Principles
* **Single Responsibility:** Each feature folder has one business responsibility
* **Open/Closed:** Features can be extended without modifying other features
* **Interface Segregation:** Features define clear boundaries/interfaces
* **Dependency Inversion:** Features depend on abstractions (shared types/interfaces)

### Scalability Benefits
* Easy to find files even with 100+ components (organized by feature, not type)
* Clear boundaries prevent "God folders" (e.g., components/ with 200+ files)
* New features are added as new folders, not mixed into existing folders
* Each feature folder is self-contained (components, hooks, logic, tests)

### Team Collaboration
* Multiple developers can work on different features with minimal conflicts
* Code reviews are easier (all related changes in one feature folder)
* Ownership is clear (teams can own entire features)
* Onboarding is faster (new developers explore one feature at a time)

### Testability
* Tests colocated with implementation (features/__tests__/ or *.test.ts)
* Easy to test features in isolation
* Clear what to test (everything in the feature folder)

### Future-Proofing
* Easy to extract features into separate microservices later
* Features can be moved to separate repositories if needed
* Supports incremental migration to micro-frontends

## Consequences

### Positive

* New developers understand structure immediately ("Where's auth code?" → "In features/auth/")
* Reduced merge conflicts (teams work on different feature folders)
* Easy to delete/refactor entire features (just delete the folder)
* Clear where to add new code (e.g., new exercise type → features/exercises/)
* Supports incremental complexity (start simple, add structure as needed)
* Improved code discoverability (search within feature folder)
* Testing is more organized (tests next to implementation)
* Feature flags and A/B testing are easier (toggle entire features)
* Code reviews are more focused (reviewer sees all related changes)

### Negative

* Initial setup takes more thought (need to plan feature boundaries)
* Shared code placement requires careful consideration (avoid duplication)
* May have some code duplication between features (trade-off for decoupling)
* Learning curve for developers used to layer-based or flat structure
* Requires discipline to maintain boundaries (no circular dependencies)

### Neutral

* Different from traditional MVC structure (but more aligned with modern practices)
* Shared utilities live in separate /shared folder (common pattern)
* Feature boundaries may evolve (requires occasional refactoring)

## Implementation Details

### Frontend Structure (React)

```
client/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── services/
│   │   │   └── authService.ts       # API calls
│   │   ├── store/
│   │   │   └── authStore.ts         # Zustand state
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── __tests__/
│   │       ├── LoginForm.test.tsx
│   │       └── authService.test.ts
│   │
│   ├── exercises/
│   │   ├── components/
│   │   │   ├── ExerciseSelector.tsx
│   │   │   ├── RepCounter.tsx
│   │   │   └── PoseVisualization.tsx
│   │   ├── hooks/
│   │   │   ├── useExerciseCounter.ts
│   │   │   └── usePoseDetection.ts
│   │   ├── logic/
│   │   │   ├── pushUpCounter.ts     # Exercise algorithms
│   │   │   ├── jumpRopeCounter.ts
│   │   │   └── angleCalculations.ts
│   │   ├── services/
│   │   │   └── mediapipeService.ts
│   │   ├── types/
│   │   │   └── exercise.types.ts
│   │   └── __tests__/
│   │       ├── pushUpCounter.test.ts
│   │       └── ExerciseSelector.test.tsx
│   │
│   ├── workouts/
│   │   ├── components/
│   │   │   ├── WorkoutHistory.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   └── WorkoutStats.tsx
│   │   ├── hooks/
│   │   │   └── useWorkouts.ts
│   │   ├── services/
│   │   │   └── workoutService.ts
│   │   ├── store/
│   │   │   └── workoutStore.ts
│   │   ├── types/
│   │   │   └── workout.types.ts
│   │   └── __tests__/
│   │
│   └── statistics/
│       ├── components/
│       │   ├── StatsDashboard.tsx
│       │   └── WeeklyChart.tsx
│       ├── hooks/
│       │   └── useStatistics.ts
│       ├── services/
│       │   └── statsService.ts
│       └── __tests__/
│
├── shared/
│   ├── components/         # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── hooks/             # Common hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/             # Utility functions
│   │   ├── dateHelpers.ts
│   │   ├── apiClient.ts
│   │   └── logger.ts
│   ├── types/             # Shared TypeScript types
│   │   └── common.types.ts
│   └── constants/         # App-wide constants
│       └── config.ts
│
├── App.tsx                # Root component
├── main.tsx               # Entry point
└── router.tsx             # Route definitions
```

### Backend Structure (FastAPI)

```
server/app/
├── features/
│   ├── auth/
│   │   ├── router.py          # FastAPI routes
│   │   ├── service.py         # Business logic
│   │   ├── repository.py      # Data access layer
│   │   ├── schemas.py         # Pydantic models
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── dependencies.py    # Dependency injection
│   │   └── __tests__/
│   │       ├── test_service.py
│   │       └── test_router.py
│   │
│   ├── exercises/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   ├── schemas.py
│   │   └── __tests__/
│   │
│   ├── workouts/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── __tests__/
│   │
│   └── statistics/
│       ├── router.py
│       ├── service.py
│       ├── repository.py
│       ├── schemas.py
│       └── __tests__/
│
├── core/
│   ├── config.py          # Environment variables
│   ├── security.py        # JWT, password hashing
│   ├── database.py        # DB connection
│   └── dependencies.py    # Global dependencies
│
├── shared/
│   ├── utils/
│   │   ├── date_helpers.py
│   │   └── validators.py
│   ├── exceptions/
│   │   └── custom_exceptions.py
│   └── middleware/
│       └── error_handler.py
│
└── main.py                # FastAPI app entry
```

## Mitigation Strategies

**Risk: Shared code placement is unclear**
* **Mitigation:** Create clear guidelines for /shared folder
* Rule: Only add to /shared if used by 3+ features
* Regular refactoring sessions to move truly shared code
* Document shared code guidelines in CONTRIBUTING.md

**Risk: Feature boundaries become blurred**
* **Mitigation:** Enforce strict import rules (no circular dependencies)
* Code review checklist includes "Does this belong in this feature?"
* Use ESLint/Pylint rules to prevent cross-feature imports (except /shared)
* Regular architecture reviews (monthly) to audit structure

**Risk: Code duplication between features**
* **Mitigation:** Accept some duplication as trade-off for decoupling
* Only extract to /shared when duplication becomes significant (Rule of Three)
* Monitor for repeated patterns during code reviews
* Balance DRY principle with feature independence

**Risk: New developers struggle with structure**
* **Mitigation:** Provide structure template and examples
* Document structure in ARCHITECTURE.md with examples
* Include feature template generator (Plop.js or cookiecutter)
* Onboarding checklist includes architecture tour

## Validation

### Success Criteria

* **Discoverability:** New developers can find relevant code in <2 minutes (measured via onboarding survey)
* **Merge Conflicts:** <10% of PRs have merge conflicts (down from ~30% with flat structure)
* **Code Review Time:** Average PR review time <30 minutes (focused changes)
* **Test Coverage:** >80% coverage for feature folders (easier to test isolated features)
* **Refactoring Speed:** Can extract a feature to separate service in <4 hours

### Metrics to Track

* Time to find code (developer survey)
* Merge conflict frequency (GitHub metrics)
* Code review duration (GitHub metrics)
* Feature folder size distribution (should be balanced, no "God features")
* Cross-feature dependencies (should be minimal)

## Confidence Level

**High** (9/10)

Feature-based structure is a proven pattern used by large-scale applications (Netflix, Uber, Microsoft). It aligns perfectly with modern development practices:
* Used by leading React projects (Next.js examples, React documentation)
* Recommended by FastAPI for larger applications
* Supported by Domain-Driven Design principles
* Industry standard for microservices architecture

The 1-point deduction accounts for the initial learning curve and setup effort.

## Related Decisions

* Related to [ADR-002](002-react-vite-frontend.md) - React component organization
* Related to [ADR-003](003-fastapi-backend.md) - FastAPI route organization
* Related to [ADR-005](005-monorepo-structure.md) - Applies to both client/ and server/
* Related to [ADR-011](011-pre-commit-hooks-setup.md) - Pre-commit checks organized by feature

## References

### Architectural Patterns
* [Feature-Sliced Design](https://feature-sliced.design/) - Modern frontend architecture
* [Domain-Driven Design (DDD)](https://martinfowler.com/bliki/DomainDrivenDesign.html) - Eric Evans
* [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html) - Uncle Bob

### React Best Practices
* [React Documentation - File Structure](https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy)
* [Bulletproof React](https://github.com/alan2207/bulletproof-react) - Production-ready structure
* [React Folder Structure in 5 Steps](https://www.robinwieruch.de/react-folder-structure/)

### FastAPI Best Practices
* [FastAPI - Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
* [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

### Implementation Examples
* Frontend: [client/src/features/](../../client/src/features/)
* Backend: [server/app/features/](../../server/app/features/)
* Shared utilities: [client/src/shared/](../../client/src/shared/)
* Feature template: [scripts/create-feature.js](../../scripts/create-feature.js) (to be created)

### SOLID Principles
* [SOLID Principles Explained](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
* [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob
