# System Architecture

**Version:** 1.0
**Last Updated:** 2026-01-03
**Status:** Living Document

---

## Table of Contents

- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Interaction Flow](#component-interaction-flow)
- [Technology Stack](#technology-stack)
- [Deployment Architecture](#deployment-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [References](#references)

---

## Overview

Exercise Buddy is a three-tier web application built with modern technologies following SOLID principles, microservices-ready architecture, and production-grade practices.

### Key Architectural Decisions

All major architectural decisions are documented in [ADRs](../adr/):

* [ADR-001](../adr/001-mediapipe-for-pose-detection.md) - MediaPipe Pose for client-side ML
* [ADR-002](../adr/002-react-vite-frontend.md) - React + Vite frontend
* [ADR-003](../adr/003-fastapi-backend.md) - FastAPI async backend
* [ADR-004](../adr/004-postgresql-database.md) - PostgreSQL database
* [ADR-005](../adr/005-monorepo-structure.md) - Monorepo organization
* [ADR-006](../adr/006-jwt-authentication.md) - JWT authentication
* [ADR-007](../adr/007-docker-containerization.md) - Docker containerization
* [ADR-009](../adr/009-vercel-railway-hosting.md) - Vercel + Railway hosting
* [ADR-010](../adr/010-feature-based-structure.md) - Feature-based code organization

### Core Principles

1. **Client-Side ML**: All pose detection happens in browser (privacy + cost optimization)
2. **Stateless Backend**: JWT tokens enable horizontal scaling
3. **Feature-Based Organization**: Code grouped by business domain, not technical layer
4. **API-First Design**: Backend exposes RESTful API for future mobile apps
5. **Async Everything**: FastAPI async + React concurrent rendering
6. **Docker from Day 1**: Consistent dev/staging/production environments

---

## High-Level Architecture

### Three-Tier Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React Application (Vite)                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  MediaPipe Pose (WebAssembly)                           │  │  │
│  │  │  - 33 body landmarks detection @ 30 FPS                 │  │  │
│  │  │  - Real-time pose tracking in browser                   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Exercise Counter Logic                                  │  │  │
│  │  │  - Angle calculations (shoulders, elbows, hips, knees)  │  │  │
│  │  │  - Rep counting algorithms (push-up, jump-rope)         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  UI Components (TailwindCSS)                             │  │  │
│  │  │  - Dashboard, Workout History, Statistics               │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  State Management (Zustand)                              │  │  │
│  │  │  - Auth state, Workout state, UI state                  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTPS REST API (JSON)
                             │ JWT Bearer Token Authentication
┌────────────────────────────▼─────────────────────────────────────────┐
│                         API LAYER (Railway)                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend (Python 3.14 + Uvicorn)                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Authentication & Authorization                          │  │  │
│  │  │  - JWT token generation & validation                    │  │  │
│  │  │  - Password hashing (bcrypt)                            │  │  │
│  │  │  - Refresh token rotation                               │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  RESTful API Endpoints (/api/v1)                         │  │  │
│  │  │  - /auth (register, login, refresh)                     │  │  │
│  │  │  - /users (profile management)                          │  │  │
│  │  │  - /workouts (CRUD operations)                          │  │  │
│  │  │  - /statistics (aggregated data)                        │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic Services                                 │  │  │
│  │  │  - AuthService, WorkoutService, StatsService            │  │  │
│  │  │  - Repository pattern (data access layer)               │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Data Validation (Pydantic v2)                           │  │  │
│  │  │  - Request/response schemas                             │  │  │
│  │  │  - Type-safe models                                     │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ SQL Queries (Async SQLAlchemy)
                             │ Connection Pooling
┌────────────────────────────▼─────────────────────────────────────────┐
│                      DATA LAYER (Railway PostgreSQL)                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 18 Database                                        │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Tables                                                  │  │  │
│  │  │  - users (accounts, authentication)                     │  │  │
│  │  │  - workouts (exercise sessions)                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Indexes                                                 │  │  │
│  │  │  - user_id (workouts FK)                                │  │  │
│  │  │  - created_at (chronological queries)                   │  │  │
│  │  │  - email, username (unique constraints)                 │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Automated Backups (Daily)                               │  │  │
│  │  │  - 7-day retention                                       │  │  │
│  │  │  - Point-in-time recovery                               │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### Exercise Counting Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. User Opens App                                               │
│     ↓                                                            │
│  2. Request Camera Access (getUserMedia API)                    │
│     ↓                                                            │
│  3. Initialize MediaPipe Pose (WebAssembly)                     │
│     ↓                                                            │
│  4. User Selects Exercise Type (push-up / jump-rope)            │
│     ↓                                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Real-Time Detection Loop (30 FPS)                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  A. Capture video frame from webcam                │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  B. MediaPipe processes frame → 33 landmarks       │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  C. Extract relevant landmarks (shoulders, elbows) │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  D. Calculate angles (shoulder-elbow-wrist)        │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  E. Exercise-specific counting logic               │  │  │
│  │  │     - Push-up: angle < 90° → angle > 160°         │  │  │
│  │  │     - Jump-rope: ankles up → ankles down          │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  F. Update rep counter in UI (React state)         │  │  │
│  │  │     ↓                                               │  │  │
│  │  │  G. Draw pose skeleton overlay on canvas           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  (Loop continues until user stops)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│     ↓                                                            │
│  5. User Stops Exercise (clicks "Finish Workout")               │
│     ↓                                                            │
│  6. Prepare workout data:                                       │
│     - exercise_type: "push-up"                                  │
│     - reps_count: 25                                            │
│     - duration_seconds: 180                                     │
│     - calories_burned: 12.5 (calculated client-side)            │
│     ↓                                                            │
│  7. POST /api/v1/workouts (with JWT token in header)            │
│     ↓                                                            │
│  8. Backend validates request (Pydantic schema)                 │
│     ↓                                                            │
│  9. Backend saves workout to PostgreSQL                         │
│     ↓                                                            │
│  10. Backend returns saved workout + updated statistics         │
│     ↓                                                            │
│  11. Frontend updates UI:                                       │
│     - Show success message                                      │
│     - Update workout history list                               │
│     - Refresh statistics dashboard                              │
└──────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  User Registration                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. User enters email, username, password                  │ │
│  │     ↓                                                       │ │
│  │  2. Frontend validates input (Zod schema)                  │ │
│  │     ↓                                                       │ │
│  │  3. POST /api/v1/auth/register                             │ │
│  │     ↓                                                       │ │
│  │  4. Backend validates (Pydantic schema)                    │ │
│  │     ↓                                                       │ │
│  │  5. Check if email/username already exists (PostgreSQL)    │ │
│  │     ↓                                                       │ │
│  │  6. Hash password with bcrypt (cost factor 12)             │ │
│  │     ↓                                                       │ │
│  │  7. Save user to database                                  │ │
│  │     ↓                                                       │ │
│  │  8. Return user profile (no password!)                     │ │
│  │     ↓                                                       │ │
│  │  9. Frontend redirects to login page                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  User Login                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. User enters email/username + password                  │ │
│  │     ↓                                                       │ │
│  │  2. POST /api/v1/auth/login                                │ │
│  │     ↓                                                       │ │
│  │  3. Backend finds user by email/username                   │ │
│  │     ↓                                                       │ │
│  │  4. Verify password with bcrypt                            │ │
│  │     ↓                                                       │ │
│  │  5. Generate JWT access token (15-min expiry)              │ │
│  │     ↓                                                       │ │
│  │  6. Generate JWT refresh token (7-day expiry)              │ │
│  │     ↓                                                       │ │
│  │  7. Return tokens to frontend                              │ │
│  │     ↓                                                       │ │
│  │  8. Frontend stores access token in memory                 │ │
│  │     ↓                                                       │ │
│  │  9. Frontend stores refresh token in httpOnly cookie       │ │
│  │     ↓                                                       │ │
│  │  10. Redirect to dashboard                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Protected API Request                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Frontend includes JWT in Authorization header          │ │
│  │     Authorization: Bearer <access_token>                   │ │
│  │     ↓                                                       │ │
│  │  2. Backend extracts token from header                     │ │
│  │     ↓                                                       │ │
│  │  3. Verify token signature (HMAC SHA256)                   │ │
│  │     ↓                                                       │ │
│  │  4. Check token expiration                                 │ │
│  │     ↓                                                       │ │
│  │  5. Extract user_id from token payload                     │ │
│  │     ↓                                                       │ │
│  │  6. Execute request (user_id available in context)         │ │
│  │     ↓                                                       │ │
│  │  7. Return response                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Key Benefits |
|------------|---------|---------|--------------|
| **React** | 19.2+ | UI Framework | Concurrent rendering, excellent ecosystem |
| **Vite** | 7.2+ | Build Tool | Lightning-fast HMR, optimized production builds |
| **TypeScript** | 5.9+ | Type Safety | Catch errors at compile time, better IDE support |
| **TailwindCSS** | 4.1+ | Styling | Rapid UI development, tiny production bundles |
| **MediaPipe** | 0.10.22 | Pose Detection | 97.5% accuracy, client-side processing |
| **React Router** | 7.x | Client Routing | Standard React routing, nested routes |
| **Axios** | 1.13+ | HTTP Client | Interceptors, request/response transformation |
| **Zustand** | 5.0+ | State Management | Simpler than Redux, <1KB, no boilerplate |
| **Zod** | 4.3+ | Validation | TypeScript-first schema validation |

### Backend Technologies

| Technology | Version | Purpose | Key Benefits |
|------------|---------|---------|--------------|
| **Python** | 3.14 | Runtime | Latest performance improvements, type hints |
| **FastAPI** | 0.128+ | Web Framework | Async-first, auto-docs, type-safe, fast |
| **Pydantic** | 2.10+ | Data Validation | Type-safe models, integrates with FastAPI |
| **SQLAlchemy** | 2.0+ | ORM | Async support, relationship management |
| **Alembic** | 1.14+ | Migrations | Version-controlled schema changes |
| **PostgreSQL** | 18 | Database | ACID compliance, JSONB support, excellent performance |
| **Uvicorn** | 0.30+ | ASGI Server | High-performance async server |
| **Python-Jose** | 3.3+ | JWT | Standard JWT implementation |
| **Passlib** | 1.7+ | Password Hashing | Bcrypt support, secure defaults |
| **Pytest** | 8.x | Testing | Industry standard, powerful fixtures |

### DevOps & Infrastructure

| Technology | Purpose | Details |
|------------|---------|---------|
| **Docker** | Containerization | Node 24 LTS (frontend), Python 3.14 (backend) |
| **Docker Compose** | Multi-container | PostgreSQL + Backend + Frontend orchestration |
| **GitHub Actions** | CI/CD | Automated testing + deployment |
| **Vercel** | Frontend Hosting | Global CDN, automatic HTTPS, preview deployments |
| **Railway** | Backend Hosting | Managed PostgreSQL, auto-deploy from Git |
| **pnpm** | Frontend Packages | 3x faster than npm, efficient disk usage |
| **uv** | Backend Packages | 10-100x faster than pip, Rust-based |

### Code Quality Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | JavaScript Linting | Airbnb style guide, React rules |
| **Prettier** | Code Formatting | 2-space indents, single quotes |
| **Ruff** | Python Linting | Replaces Flake8 + isort + Black |
| **MyPy** | Python Type Checking | Strict mode enabled |
| **Husky** | Git Hooks | Pre-commit quality checks |
| **pre-commit** | Python Hooks | pyupgrade, codespell, security scanning |

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│  Developer Machine (Docker Compose)                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Frontend     │  │  Backend      │  │  PostgreSQL   │  │
│  │  localhost    │  │  localhost    │  │  localhost    │  │
│  │  :5173        │  │  :8000        │  │  :5432        │  │
│  │  (Vite HMR)   │  │  (FastAPI)    │  │  (Volume)     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Production Architecture (MVP Phase)

```
┌──────────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React App (Static Build)                              │ │
│  │  - Served from 100+ edge locations (CDN)               │ │
│  │  - Automatic HTTPS certificates                        │ │
│  │  - Gzip compression, brotli                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS API Requests
┌──────────────────────▼───────────────────────────────────────┐
│  Railway (Backend + Database)                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Container (Uvicorn)                           │ │
│  │  - 512MB RAM, 1 vCPU                                   │ │
│  │  - Auto-deploy on git push                             │ │
│  │  - Environment variables via Railway UI                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 18 (Managed)                               │ │
│  │  - Automated daily backups (7-day retention)           │ │
│  │  - Connection pooling                                  │ │
│  │  - SSL connections enforced                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Read Operations (GET)

```
User Browser → Vercel CDN → Frontend (React)
                    ↓
            API Request (GET /api/v1/workouts)
                    ↓
            Railway → FastAPI Backend
                    ↓
            JWT Validation (extract user_id)
                    ↓
            PostgreSQL Query (SELECT * FROM workouts WHERE user_id = ?)
                    ↓
            SQLAlchemy ORM → Python objects
                    ↓
            Pydantic Serialization → JSON
                    ↓
            Response to Frontend
                    ↓
            React State Update → UI Re-render
```

### Write Operations (POST)

```
User Browser → Form Submission (workout data)
                    ↓
            Frontend Validation (Zod schema)
                    ↓
            API Request (POST /api/v1/workouts)
                    ↓
            Railway → FastAPI Backend
                    ↓
            JWT Validation (extract user_id)
                    ↓
            Pydantic Validation (request schema)
                    ↓
            Business Logic (WorkoutService)
                    ↓
            SQLAlchemy ORM → INSERT INTO workouts
                    ↓
            PostgreSQL Transaction COMMIT
                    ↓
            Return saved workout + updated stats
                    ↓
            Frontend Updates UI (optimistic update)
```

---

## Security Architecture

### Defense in Depth

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Transport Security                                 │
│  - HTTPS everywhere (TLS 1.3)                                │
│  - Vercel & Railway automatic SSL certificates               │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication & Authorization                     │
│  - JWT tokens (HMAC SHA256)                                  │
│  - Short-lived access tokens (15 minutes)                    │
│  - Refresh token rotation (7 days)                           │
│  - Bcrypt password hashing (cost factor 12)                  │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Input Validation                                   │
│  - Frontend: Zod schema validation                           │
│  - Backend: Pydantic schema validation                       │
│  - SQL injection prevention (ORM parameterized queries)      │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: CORS & CSP                                         │
│  - CORS whitelist (production domain only)                   │
│  - Content Security Policy headers                           │
│  - SameSite cookies (CSRF protection)                        │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Data Protection                                    │
│  - Never store plaintext passwords                           │
│  - Database connection encryption (SSL)                      │
│  - Environment variables for secrets (never in code)         │
│  - Automated database backups (7-day retention)              │
└──────────────────────────────────────────────────────────────┘
```

See [ADR-006: JWT Authentication](../adr/006-jwt-authentication.md) for detailed security implementation.

---

## Scalability Considerations

### Current MVP Architecture (0-1,000 users)
* **Frontend:** Vercel CDN (globally distributed)
* **Backend:** Railway single instance (512MB RAM)
* **Database:** Railway PostgreSQL (shared instance)
* **Cost:** $5-20/month

### Growth Phase (1,000-10,000 users)
* **Frontend:** Vercel Pro (increased bandwidth)
* **Backend:** Railway Pro or AWS ECS (horizontal scaling)
* **Database:** Railway Pro or AWS RDS (connection pooling with PgBouncer)
* **Cost:** $100-300/month

### Scale Phase (10,000-100,000 users)
* **Frontend:** Vercel Enterprise or Cloudflare
* **Backend:** AWS ECS + Auto Scaling Group (5-20 instances)
* **Database:** AWS RDS Multi-AZ + Read Replicas
* **Caching:** Redis for session management + statistics caching
* **CDN:** CloudFront for static assets
* **Cost:** $500-2,000/month

### Performance Targets
* **Pose Detection:** 30 FPS (33ms per frame)
* **API Response Time:** <200ms (p95)
* **Database Query Time:** <50ms (p95)
* **Time to Interactive:** <5 seconds (3G connection)
* **Lighthouse Score:** >90 (all metrics)

---

## References

### Architecture Decision Records
* [ADR Index](../adr/README.md) - All architectural decisions

### Technical Documentation
* [Database Schema](DATABASE_SCHEMA.md) - SQL tables and relationships
* [API Endpoints](API_ENDPOINTS.md) - RESTful API documentation

### External Resources
* [React 19 Documentation](https://react.dev/)
* [FastAPI Documentation](https://fastapi.tiangolo.com/)
* [PostgreSQL 18 Documentation](https://www.postgresql.org/docs/18/)
* [MediaPipe Pose](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)

---

**Last Updated:** 2026-01-03
**Maintained By:** Exercise Buddy Development Team
