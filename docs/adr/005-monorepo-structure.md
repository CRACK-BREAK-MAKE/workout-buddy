# ADR-005: Monorepo Structure with Separate Frontend/Backend

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, DevOps

## Context and Problem Statement

We need to decide whether to use separate repositories for frontend/backend or a monorepo structure, considering deployment flexibility, code sharing, and team collaboration.

## Considered Options

1. **Monorepo** - Single repository with /client and /server
2. **Separate Repos** - Independent frontend and backend repositories
3. **Microservices** - Multiple small services (overkill for MVP)

## Decision

Use **Monorepo structure** with clearly separated /client and /server directories

## Rationale

* **Simplified Development:** Single clone/setup process for developers
* **Atomic Commits:** Related frontend/backend changes in one PR
* **Shared Code:** Common types/interfaces between client/server (in /shared)
* **Consistent Versioning:** Single source of truth for version numbers
* **Easier CI/CD:** Single pipeline can build/test both
* **YAGNI Principle:** Don't split until we have multiple teams

## Consequences

### Positive

* Faster onboarding for new developers (one repo to clone)
* Easier to refactor across frontend/backend boundaries
* Shared validation schemas (Zod client-side, Pydantic server-side can share structure)
* Unified documentation in one place

### Negative

* Larger repository size
* Need to manage separate dependency trees (pnpm vs uv)
* CI/CD needs to detect which part changed

## Mitigation Strategies

* Use path-based CI triggers (only build what changed)
* Clear directory structure prevents confusion
* Consider splitting into separate repos when team size >10 people

## Confidence Level

**High** (8/10) - Monorepo works well for small-medium teams

## Related Decisions

* Related to [ADR-007](007-docker-containerization.md) - Docker setup
* Related to [ADR-011](011-pre-commit-hooks-setup.md) - Coordinated pre-commit hooks
