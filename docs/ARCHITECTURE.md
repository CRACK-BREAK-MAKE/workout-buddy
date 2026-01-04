# Workout Buddy - Architecture Hub

**Version:** 2.0
**Last Updated:** 2026-01-03
**Status:** Living Document

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Links](#quick-links)
- [Architecture Decision Records](#architecture-decision-records)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Development Guidelines](#development-guidelines)
- [Getting Started](#getting-started)

---

## Overview

Workout Buddy is an AI-powered exercise counting application that uses computer vision (MediaPipe Pose) to automatically count exercise repetitions through your webcam. Built with production-grade practices following SOLID principles, DRY, and YAGNI.

### Key Features

- 🎥 Real-time pose detection using MediaPipe
- 🔢 Automatic exercise counting (push-ups, jump rope)
- 👤 User authentication and workout history
- 📊 Statistics and progress tracking
- 🏗️ Scalable architecture for production deployment

### Success Metrics

- **Accuracy**: >95% rep counting accuracy
- **Performance**: <100ms latency for pose detection
- **Availability**: 99.9% uptime SLA
- **Scalability**: Support 10,000+ concurrent users

---

## Quick Links

### 📚 Documentation

- **[Project Setup Guide](../SETUP.md)** - Get started in 5 minutes
- **[Contributing Guidelines](../CONTRIBUTING.md)** - How to contribute
- **[Development Guide](guides/DEVELOPMENT.md)** - Development workflow
- **[Testing Guide](guides/TESTING.md)** - Testing strategy and TDD
- **[Deployment Guide](guides/DEPLOYMENT.md)** - Production deployment

### 📐 Architecture

- **[Architecture Decision Records (ADRs)](adr/)** - Key technical decisions
- **[System Architecture](architecture/SYSTEM_ARCHITECTURE.md)** - High-level design and diagrams
- **[Database Schema](architecture/DATABASE_SCHEMA.md)** - Data models and SQL
- **[API Endpoints](architecture/API_ENDPOINTS.md)** - REST API reference

---

## Architecture Decision Records

ADRs document the key architectural decisions made for this project. All ADRs are stored in [`docs/adr/`](adr/).

### Core Technology Decisions

| ADR | Title | Status | Date | Impact |
|-----|-------|--------|------|--------|
| [ADR-001](adr/001-mediapipe-for-pose-detection.md) | MediaPipe for Pose Detection | ✅ Accepted | 2026-01-02 | High |
| [ADR-002](adr/002-react-vite-frontend.md) | React + Vite Frontend | ✅ Accepted | 2026-01-02 | High |
| [ADR-003](adr/003-fastapi-backend.md) | FastAPI Backend | ✅ Accepted | 2026-01-02 | High |
| [ADR-004](adr/004-postgresql-database.md) | PostgreSQL Database | ✅ Accepted | 2026-01-02 | High |

### Architecture & Infrastructure

| ADR | Title | Status | Date | Impact |
|-----|-------|--------|------|--------|
| [ADR-005](adr/005-monorepo-structure.md) | Monorepo Structure | ✅ Accepted | 2026-01-02 | High |
| [ADR-006](adr/006-jwt-authentication.md) | JWT Authentication | ✅ Accepted | 2026-01-02 | Medium |
| [ADR-007](adr/007-docker-containerization.md) | Docker Containerization | ✅ Accepted | 2026-01-02 | High |
| [ADR-009](adr/009-vercel-railway-hosting.md) | Vercel + Railway Hosting | ✅ Accepted | 2026-01-02 | Medium |

### Code Organization & Quality

| ADR | Title | Status | Date | Impact |
|-----|-------|--------|------|--------|
| [ADR-008](adr/008-tailwindcss-styling.md) | TailwindCSS Styling | ✅ Accepted | 2026-01-02 | Low |
| [ADR-010](adr/010-feature-based-structure.md) | Feature-Based Organization | ✅ Accepted | 2026-01-02 | High |
| [ADR-011](adr/011-pre-commit-hooks-setup.md) | Pre-commit Hooks | ✅ Accepted | 2026-01-03 | Medium |

> See [ADR Index](adr/README.md) for complete list and how to create new ADRs.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│         Browser (Client Layer)              │
│  ┌─────────────────────────────────────┐   │
│  │  React + Vite + TypeScript          │   │
│  │  - MediaPipe Pose (Client-side ML)  │   │
│  │  - Workout Counting Logic          │   │
│  │  - TailwindCSS UI                   │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ HTTPS REST API
                   │ (JWT Authentication)
┌──────────────────▼──────────────────────────┐
│         API Layer (Backend)                 │
│  ┌─────────────────────────────────────┐   │
│  │  FastAPI + Python 3.14              │   │
│  │  - RESTful Endpoints                │   │
│  │  - JWT Auth & Validation            │   │
│  │  - Business Logic Services          │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ SQL (AsyncIO)
┌──────────────────▼──────────────────────────┐
│         Data Layer (Database)               │
│  ┌─────────────────────────────────────┐   │
│  │  PostgreSQL 18                      │   │
│  │  - Users & Authentication           │   │
│  │  - Workouts & Exercise Data         │   │
│  │  - Statistics & Analytics           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Data Flow: Workout Counting

```
1. User grants camera access
   ↓
2. MediaPipe Pose detection @ 30 FPS (browser)
   ↓
3. Extract body landmarks (33 points)
   ↓
4. Calculate angles (shoulders, elbows, hips, knees)
   ↓
5. Workout-specific counting logic
   ↓
6. Update UI in real-time (rep counter)
   ↓
7. On workout complete → POST to /api/v1/workouts
   ↓
8. Backend saves to PostgreSQL
   ↓
9. Return updated statistics
```

### Key Architectural Principles

1. **Client-Side ML**: All pose detection happens in browser (privacy + cost)
2. **Feature-Based Structure**: Code organized by business domain, not technical layer
3. **SOLID Principles**: Every module has single responsibility
4. **Stateless Backend**: JWT tokens, horizontally scalable
5. **Async Everything**: FastAPI async + React concurrent rendering

---

## Technology Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.2+ | UI components |
| **Build Tool** | Vite | 7.2+ | Fast HMR, bundling |
| **Language** | TypeScript | 5.9+ | Type safety |
| **Styling** | TailwindCSS | 4.1+ | Utility-first CSS |
| **State** | Zustand | 5.0+ | Lightweight state |
| **Routing** | React Router | 7.x | Client routing |
| **HTTP Client** | Axios | 1.13+ | API requests |
| **Validation** | Zod | 4.3+ | Schema validation |
| **ML** | MediaPipe | 0.10.22 | Pose detection |

### Backend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.128+ | Async web framework |
| **Language** | Python | 3.14 | Backend runtime |
| **ORM** | SQLAlchemy | 2.0+ | Database ORM |
| **Validation** | Pydantic | 2.10+ | Data validation |
| **Database** | PostgreSQL | 18 | Primary datastore |
| **Migrations** | Alembic | 1.14+ | Schema migrations |
| **Auth** | Python-Jose | 3.3+ | JWT tokens |
| **Password** | Passlib | 1.7+ | Password hashing |
| **Server** | Uvicorn | 0.30+ | ASGI server |

### DevOps & Tools

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Containers** | Docker + Docker Compose | Local dev + production |
| **Package Mgmt** | pnpm 10 (frontend), uv (backend) | Fast dependency management |
| **CI/CD** | GitHub Actions | Automated testing + deployment |
| **Hosting** | Vercel (frontend), Railway (backend) | Serverless deployment |
| **Code Quality** | ESLint, Prettier, Ruff, MyPy | Linting + formatting |
| **Git Hooks** | Husky + pre-commit | Pre-commit quality checks |
| **Testing** | Vitest, Pytest | Unit + integration tests |

---

## Development Guidelines

### SOLID Principles

Our codebase follows SOLID principles rigorously:

- **S**ingle Responsibility: Each module/class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for base types
- **I**nterface Segregation: Many small interfaces over one large interface
- **D**ependency Inversion: Depend on abstractions, not concretions

See [ADR-010: Feature-Based Structure](adr/010-feature-based-structure.md) for code organization details.

### Code Quality Standards

**Pre-commit Checks** (Automated via [ADR-011](adr/011-pre-commit-hooks-setup.md)):

**Frontend:**
- ✅ Prettier formatting
- ✅ ESLint linting
- ✅ TypeScript type checking

**Backend:**
- ✅ Ruff formatting + linting
- ✅ MyPy type checking (strict mode)
- ✅ pyupgrade syntax upgrades
- ✅ Security scanning (Bandit)
- ✅ Spell checking (codespell)

**Testing Requirements:**
- Unit tests: >80% coverage for business logic
- Integration tests: All API endpoints
- E2E tests: Critical user flows
- All tests must pass before merge

### Git Workflow

**Branching Strategy:**
```
main            → Production (protected)
develop         → Staging
feature/*       → Feature branches
fix/*           → Bug fixes
hotfix/*        → Emergency production fixes
```

**Commit Convention:**
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(exercises): add squat counter with angle detection
```

See [guides/GIT_WORKFLOW.md](guides/GIT_WORKFLOW.md) for detailed workflow.

---

## Getting Started

### Prerequisites

- **Node.js** 24 LTS + pnpm 10
- **Python** 3.14+ + uv
- **Docker** 24+ + Docker Compose
- **Git** 2.40+

### Quick Start

```bash
# Clone repository
git clone <repo-url>
cd workout-buddy

# Install dependencies (installs git hooks automatically)
pnpm install

# Setup backend
cd server
uv sync --dev
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Start development environment
cd ..
docker-compose up -d

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

See [SETUP.md](../SETUP.md) for detailed setup instructions.

### Project Structure

```
workout-buddy/
├── client/                # React frontend
│   ├── src/features/      # Feature-based organization
│   └── tests/             # Frontend tests
├── server/                # FastAPI backend
│   ├── app/               # Application code
│   ├── tests/             # Backend tests
│   └── alembic/           # Database migrations
├── docs/                  # Documentation (you are here!)
│   ├── adr/               # Architecture decisions
│   ├── architecture/      # System diagrams
│   └── guides/            # Development guides
├── .husky/                # Git hooks
└── docker-compose.yml     # Local development
```

---

## Contributing

We welcome contributions! Please read:

1. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
2. **[CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)** - Community standards
3. **[guides/DEVELOPMENT.md](guides/DEVELOPMENT.md)** - Development workflow

---

## Additional Resources

### Internal Documentation

- **[Project Roadmap](../IMPLEMENTATION_PLAN.md)** - 4-week MVP plan
- **[Claude Context](../CLAUDE.md)** - AI agent instructions
- **[Test Coverage Reports](../coverage/)** - Code coverage

### External Resources

- [MediaPipe Documentation](https://developers.google.com/mediapipe)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Questions or Issues?

- **Architecture questions**: Open a GitHub Discussion
- **Bug reports**: Create a GitHub Issue
- **Feature requests**: Create a GitHub Issue with `enhancement` label
- **Security issues**: See [SECURITY.md](../SECURITY.md)

---

**Last Updated:** 2026-01-03
**Maintained by:** Workout Buddy Development Team
**License:** [MIT](../LICENSE)
