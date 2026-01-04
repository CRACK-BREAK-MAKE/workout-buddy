# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Exercise Buddy project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:
- **Title**: Short noun phrase
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Date**: When the decision was made
- **Decision Makers**: Who was involved
- **Context**: The issue motivating this decision
- **Decision**: The change being proposed or made
- **Consequences**: The results of this decision (positive, negative, neutral)
- **Alternatives Considered**: Other options that were evaluated

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](001-mediapipe-for-pose-detection.md) | Use MediaPipe for Pose Detection | Accepted | 2026-01-02 |
| [ADR-002](002-react-vite-frontend.md) | React + Vite for Frontend | Accepted | 2026-01-02 |
| [ADR-003](003-fastapi-backend.md) | FastAPI for Backend Services | Accepted | 2026-01-02 |
| [ADR-004](004-postgresql-database.md) | PostgreSQL as Primary Database | Accepted | 2026-01-02 |
| [ADR-005](005-monorepo-structure.md) | Monorepo Structure | Accepted | 2026-01-02 |
| [ADR-006](006-jwt-authentication.md) | JWT-Based Authentication | Accepted | 2026-01-02 |
| [ADR-007](007-docker-containerization.md) | Docker Containerization | Accepted | 2026-01-02 |
| [ADR-008](008-tailwindcss-styling.md) | TailwindCSS for Styling | Accepted | 2026-01-02 |
| [ADR-009](009-vercel-railway-hosting.md) | Vercel + Railway for MVP Hosting | Accepted | 2026-01-02 |
| [ADR-010](010-feature-based-structure.md) | Feature-Based Code Organization | Accepted | 2026-01-02 |
| [ADR-011](011-pre-commit-hooks-setup.md) | Pre-commit Hooks and Code Quality | Accepted | 2026-01-03 |
| [ADR-012](012-root-level-pre-commit-hooks.md) | Root-Level Pre-commit Hooks for Monorepo | Accepted | 2026-01-03 |

## Creating a New ADR

1. Copy the [template](TEMPLATE.md)
2. Name it `NNN-title-with-dashes.md` (where NNN is the next number)
3. Fill in all sections
4. Update this README with the new entry
5. Submit for review via pull request

## References

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [ADR GitHub Organization](https://adr.github.io/)
