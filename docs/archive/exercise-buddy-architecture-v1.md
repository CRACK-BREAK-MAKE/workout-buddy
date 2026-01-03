# Exercise Counter App - Complete Architecture & Development Guide

**Version:** 1.0
**Last Updated:** January 2, 2026
**Author:** System Architecture Team
**Project Type:** Full-Stack AI-Powered Exercise Tracking Application

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture Decision Records (ADRs)](#architecture-decision-records-adrs)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Development Guidelines](#development-guidelines)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Deployment Strategy](#deployment-strategy)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Appendix](#appendix)

---

## Executive Summary

This document provides a comprehensive architectural blueprint for building an AI-powered exercise counting application that uses computer vision to automatically count exercise repetitions (jumping rope, push-ups) via camera. The system is designed following SOLID principles (SRP, DRY, YAGNI), with a clear path from MVP to production-scale deployment supporting thousands of concurrent users.

**Key Features:**
- Real-time pose detection using MediaPipe
- Automatic exercise counting (push-ups, jumping rope)
- User authentication and workout history
- Statistics and progress tracking
- Scalable architecture for large user base

**Target Timeline:** 4 weeks to production-ready MVP

---

## Project Overview

### Problem Statement

Manual exercise counting is distracting and error-prone. Users need to split their focus between performing exercises correctly and maintaining an accurate count. This reduces workout effectiveness and can lead to incorrect form.

### Solution

A web-based application that leverages computer vision (MediaPipe Pose) to automatically detect and count exercise repetitions in real-time through the user's device camera, allowing them to focus entirely on proper form and execution.

### Success Metrics

- **Accuracy:** >95% rep counting accuracy
- **Performance:** <100ms latency for pose detection
- **Scalability:** Support 10,000+ concurrent users
- **Availability:** 99.9% uptime SLA
- **User Satisfaction:** >4.5/5 rating

---

## Architecture Decision Records (ADRs)

### ADR-001: Use MediaPipe Pose for Exercise Detection

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, ML Engineer

#### Context and Problem Statement

We need a reliable, accurate, and performant pose detection solution for counting exercises. The solution must work in real-time on standard webcams without requiring specialized hardware or expensive cloud ML APIs.

#### Considered Options

1. **MediaPipe Pose (Google)** - Pre-trained pose detection running in browser
2. **TensorFlow.js with PoseNet** - Custom model training required
3. **OpenCV.js + Custom ML Model** - More control but higher complexity
4. **Cloud-based APIs (AWS Rekognition, Azure Custom Vision)** - Requires internet, ongoing costs

#### Decision

Use **MediaPipe Pose JavaScript library** (@mediapipe/tasks-vision)

#### Rationale

- **No Backend ML Processing:** Runs entirely in browser, reduces infrastructure costs
- **Proven Accuracy:** 97.5% accuracy for exercise counting (research-validated)
- **Performance:** 30+ FPS on standard webcams, ~55ms per frame
- **Free & No API Costs:** No per-request charges or monthly fees
- **Privacy:** All processing local, no video data sent to servers
- **33 Body Landmarks:** Sufficient detail for push-ups, jump rope, squats, etc.
- **Active Maintenance:** Google-supported, regular updates

#### Consequences

**Positive:**
- Zero ML infrastructure costs in MVP phase
- Instant real-time feedback (<100ms latency)
- Works offline after initial page load
- Privacy-preserving (GDPR compliant)

**Negative:**
- Limited to what MediaPipe can detect (no custom exercises initially)
- Requires modern browser (Chrome/Edge recommended)
- Client-side processing may drain battery on mobile
- Limited to single-person detection

**Mitigation:**
- Clearly document browser requirements
- Optimize JavaScript for battery efficiency
- Plan for custom model training in Phase 3+ if needed

#### Confidence Level

High (9/10) - MediaPipe is production-proven, used by fitness apps with millions of users

---

### ADR-002: React + Vite for Frontend Framework

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Frontend Team

#### Context and Problem Statement

We need a modern frontend framework that enables rapid development, has excellent developer experience, and can scale to a complex application with real-time camera processing.

#### Considered Options

1. **React + Vite** - Modern, fast dev experience
2. **Vue.js + Vite** - Simpler learning curve
3. **Angular** - Full framework, more opinionated
4. **Vanilla JavaScript** - Maximum control, more work

#### Decision

Use **React 18+ with Vite** as build tool

#### Rationale

- **Team Expertise:** JavaScript proficiency directly translates to React
- **Ecosystem:** Largest component library ecosystem
- **Vite Performance:** 10x faster than Webpack, instant HMR
- **React 18 Features:** Concurrent rendering benefits for real-time video processing
- **Job Market:** Easier to hire React developers
- **MediaPipe Integration:** Excellent examples and community support
- **Component Reusability:** Perfect for modular exercise detection logic

#### Consequences

**Positive:**
- Sub-second build times with Vite
- Hot Module Replacement improves developer productivity
- Large ecosystem of UI libraries (shadcn/ui, Headless UI)
- Easy state management with hooks
- Clear upgrade path to React Native for mobile

**Negative:**
- Slightly steeper learning curve than Vue for complete beginners
- Need to choose state management approach (Context API vs Redux)
- Client-side routing needs React Router

**Mitigation:**
- Use Context API for simple state management (avoid Redux in MVP)
- Comprehensive documentation and code comments
- Leverage TypeScript for better developer experience

---

### ADR-003: FastAPI (Python) for Backend Services

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Backend Team

#### Context and Problem Statement

We need a backend framework for user management, workout data persistence, and future ML features. The framework should be fast, scalable, and work well with Python's ML ecosystem.

#### Considered Options

1. **FastAPI (Python)** - Modern async Python framework
2. **Express.js (Node.js)** - JavaScript full-stack consistency
3. **Django (Python)** - Full-featured framework
4. **Spring Boot (Java)** - Enterprise-grade but verbose

#### Decision

Use **FastAPI with Python 3.11+**

#### Rationale

- **Async First:** Built on asyncio, handles 10,000+ concurrent connections
- **Performance:** Comparable to Node.js/Go (faster than Django/Flask)
- **Python ML Integration:** Seamless with TensorFlow, PyTorch for future features
- **Auto Documentation:** OpenAPI (Swagger) auto-generated
- **Type Safety:** Pydantic validation catches errors early
- **Team Skills:** Leverages existing Python proficiency
- **Modern Pythonic:** Uses Python 3.6+ features (type hints, async/await)

#### Consequences

**Positive:**
- Fast API development with auto-validation
- Excellent for data-heavy applications
- Easy to add ML features later (personalized coaching, form analysis)
- Strong typing reduces bugs
- Async design supports WebSocket for real-time features

**Negative:**
- Smaller community than Express.js (but growing rapidly)
- Fewer third-party packages than Django
- Team needs to learn async Python patterns

**Mitigation:**
- Provide async/await training resources
- Use well-documented patterns from FastAPI cookbook
- Start with simple synchronous endpoints, add async where needed

---

### ADR-004: PostgreSQL for Primary Database

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Database Admin

#### Context and Problem Statement

We need a reliable database for structured data (users, workouts, statistics). The database must support ACID transactions, handle analytics queries, and scale to millions of records.

#### Considered Options

1. **PostgreSQL** - Powerful relational database
2. **MongoDB** - NoSQL, flexible schema
3. **MySQL** - Popular relational database
4. **SQLite** - Lightweight, file-based

#### Decision

Use **PostgreSQL 15+** as primary database

#### Rationale

- **ACID Compliance:** Guaranteed data integrity for user workouts
- **JSON Support:** Can store flexible data (exercise metadata) in JSONB columns
- **Analytics:** Excellent for aggregation queries (workout statistics, trends)
- **Mature Security:** Robust encryption, user permissions, audit trails
- **Scalability:** Handles millions of rows efficiently with proper indexing
- **Extensions:** PostGIS (future: location-based features), full-text search
- **Community:** Extensive documentation and tooling

#### Consequences

**Positive:**
- Strong data consistency for critical user data
- Excellent query optimizer for complex statistics
- Built-in full-text search for exercise library
- Easy backup/restore strategies
- Connection pooling support (PgBouncer)

**Negative:**
- More complex to scale horizontally than NoSQL (but achievable)
- Requires careful index design for performance
- Schema migrations need planning

**Mitigation:**
- Use Alembic for versioned schema migrations
- Implement connection pooling from day 1
- Plan sharding strategy for >1M users (not needed in MVP)

---

### ADR-005: Monorepo Structure with Separate Frontend/Backend

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, DevOps

#### Context and Problem Statement

We need to decide whether to use separate repositories for frontend/backend or a monorepo structure, considering deployment flexibility, code sharing, and team collaboration.

#### Considered Options

1. **Monorepo** - Single repository with /client and /server
2. **Separate Repos** - Independent frontend and backend repositories
3. **Microservices** - Multiple small services (overkill for MVP)

#### Decision

Use **Monorepo structure** with clearly separated /client and /server directories

#### Rationale

- **Simplified Development:** Single clone/setup process for developers
- **Atomic Commits:** Related frontend/backend changes in one PR
- **Shared Code:** Common types/interfaces between client/server
- **Consistent Versioning:** Single source of truth for version numbers
- **Easier CI/CD:** Single pipeline can build/test both
- **YAGNI Principle:** Don't split until we have multiple teams

#### Consequences

**Positive:**
- Faster onboarding for new developers
- Easier to refactor across frontend/backend boundaries
- Shared validation schemas (Zod/Yup)
- Unified documentation

**Negative:**
- Larger repository size
- Need to manage separate dependency trees
- CI/CD needs to detect which part changed

**Mitigation:**
- Use path-based CI triggers (only build what changed)
- Clear directory structure prevents confusion
- Consider splitting into separate repos when team size >10

---

### ADR-006: JWT-Based Authentication

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Security Engineer

#### Context and Problem Statement

Users need secure authentication to save workout history and access personal statistics across sessions and devices.

#### Considered Options

1. **JWT (JSON Web Tokens)** - Stateless authentication
2. **Session-based** - Server-side session storage
3. **OAuth 2.0 only** - Third-party auth (Google, Facebook)
4. **Magic Links** - Email-based passwordless

#### Decision

Use **JWT tokens** with refresh token rotation, plus optional OAuth 2.0

#### Rationale

- **Stateless:** No server-side session storage needed
- **Scalable:** Works across multiple backend instances
- **Mobile-Ready:** Easy to implement in future React Native app
- **Standard:** Industry-standard approach (RFC 7519)
- **Flexible:** Can add OAuth as supplementary option
- **Performance:** No database lookup on every request

#### Consequences

**Positive:**
- Easy to scale horizontally (no shared session state)
- Works well with CDN/load balancers
- Simple mobile app integration later
- Fast authentication checks

**Negative:**
- Cannot revoke individual tokens (until expiry)
- Need refresh token strategy
- Token size larger than session IDs

**Mitigation:**
- Short access token lifetime (15 minutes)
- Implement refresh token rotation
- Use Redis for token blacklist (only if needed)
- Plan for OAuth 2.0 in Phase 2

---

### ADR-007: Docker Containerization from Day 1

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, DevOps

#### Context and Problem Statement

We need consistent development, testing, and production environments. The solution should work on any developer's machine and deploy identically to production.

#### Considered Options

1. **Docker + Docker Compose** - Container-based development
2. **Virtual Machines** - Heavy, slower
3. **Direct Installation** - "Works on my machine" problems
4. **Kubernetes from Start** - Over-engineering for MVP

#### Decision

Use **Docker with Docker Compose** for all environments

#### Rationale

- **Consistency:** "Works on my machine" → "Works everywhere"
- **Isolation:** Dependencies don't conflict with host system
- **Easy Onboarding:** `docker-compose up` gets anyone started
- **Production-Ready:** Same containers dev → staging → production
- **Multi-Service:** Frontend, backend, database in one command
- **Resource Efficient:** Lighter than VMs

#### Consequences

**Positive:**
- New developers productive in <30 minutes
- Identical behavior across all environments
- Easy to add services (Redis, background workers)
- Clear path to Kubernetes if needed later
- Simple rollback (just run previous image)

**Negative:**
- Requires Docker knowledge
- Slight performance overhead on macOS/Windows
- Need to learn Docker networking

**Mitigation:**
- Provide detailed Docker setup guide
- Use Docker Desktop for dev simplicity
- Document common Docker issues/solutions

---

### ADR-008: TailwindCSS for Styling

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, UI/UX Designer

#### Context and Problem Statement

We need a CSS strategy that enables rapid UI development, maintains consistency, and produces small production bundles.

#### Considered Options

1. **TailwindCSS** - Utility-first CSS framework
2. **CSS Modules** - Component-scoped CSS
3. **Styled Components** - CSS-in-JS
4. **Plain CSS/SCSS** - Traditional approach

#### Decision

Use **TailwindCSS 3+** with custom configuration

#### Rationale

- **Rapid Development:** Build UI 50% faster than writing custom CSS
- **Consistency:** Design system built-in (spacing, colors, typography)
- **Small Bundle:** PurgeCSS removes unused styles automatically
- **Responsive Design:** Mobile-first utilities out of the box
- **Dark Mode:** First-class support (important for exercise app)
- **No Naming:** No need to invent CSS class names (DRY principle)

#### Consequences

**Positive:**
- Very small production CSS bundles (<10KB)
- Consistent spacing/colors across entire app
- Easy to maintain responsive designs
- No CSS conflicts
- Great documentation

**Negative:**
- HTML can look cluttered with many classes
- Learning curve for traditional CSS developers
- Harder to override third-party component styles

**Mitigation:**
- Extract common patterns into components
- Use @apply directive for complex repeated patterns
- Configure custom color palette matching brand

---

### ADR-009: Vercel (Frontend) + Railway (Backend) for MVP Hosting

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, DevOps

#### Context and Problem Statement

We need cost-effective, reliable hosting for MVP phase that can scale later. Must support automatic deployments from Git and provide good developer experience.

#### Considered Options

1. **Vercel + Railway** - Specialized platforms
2. **AWS (EC2, RDS, S3)** - Full control, complex
3. **Heroku** - Easy but expensive
4. **DigitalOcean App Platform** - Middle ground
5. **Google Cloud Run** - Serverless containers

#### Decision

Use **Vercel for frontend, Railway for backend + PostgreSQL**

#### Rationale

- **Free Tier:** Sufficient for MVP (<1000 users)
- **Auto Deploy:** Git push → automatic deployment
- **Zero Config:** No server management required
- **Great DX:** Preview deployments for PRs
- **Monitoring:** Built-in analytics and logging
- **CDN:** Global CDN included (Vercel)
- **Database:** Railway includes managed PostgreSQL

#### Consequences

**Positive:**
- $0-50/month for first 1000 users
- Deploy in seconds, not hours
- Automatic HTTPS/SSL
- Easy rollbacks (one click)
- Focus on coding, not infrastructure

**Negative:**
- Vendor lock-in (but easy to migrate later)
- Less control than AWS/GCP
- Need to migrate for >10,000 users
- Limited customization of server config

**Migration Path:**
- **Phase 1 (MVP):** Vercel + Railway (0-1000 users)
- **Phase 2 (Growth):** Keep Vercel, migrate backend to AWS ECS (1000-50000 users)
- **Phase 3 (Scale):** Full AWS/GCP with Kubernetes (50000+ users)

---

### ADR-010: Code Organization - Feature-Based Structure

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Senior Developers

#### Context and Problem Statement

We need a folder structure that scales from 10 files to 1000+ files while remaining intuitive and maintainable. The structure should align with SOLID principles, especially Single Responsibility Principle.

#### Considered Options

1. **Feature-Based Structure** - Organize by business domain
2. **Flat Structure** - All files in src/components, src/utils, etc.
3. **Layer-Based Structure** - Organize by technical layer (controllers, models, views)

#### Decision

Use **Feature-Based (Domain-Driven) Structure** for both frontend and backend

#### Rationale

- **SRP Alignment:** Each feature folder has single responsibility
- **Scalability:** Easy to find files even with 100+ components
- **Team Scaling:** Multiple developers can work on different features
- **Clear Boundaries:** Feature dependencies are explicit
- **Testability:** Tests colocated with features
- **Refactoring:** Easy to extract features into microservices later

#### Consequences

**Positive:**
- New developers understand structure immediately
- Reducing merge conflicts (teams work on different features)
- Easy to delete/refactor entire features
- Clear where to add new code
- Supports incremental complexity

**Negative:**
- Initial setup takes more thought
- Shared code needs careful placement
- May have some code duplication between features

**Mitigation:**
- Create /shared folder for truly common code
- Provide structure template and examples
- Regular code reviews to catch violations

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Application (Vite)                                 │  │
│  │  - Camera Component (MediaPipe Pose)                      │  │
│  │  - Exercise Counter Logic                                 │  │
│  │  - UI Components (Tailwind CSS)                           │  │
│  │  - State Management (React Context)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/WSS
                            │ REST API / WebSocket
┌───────────────────────────▼─────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend                                          │  │
│  │  - Authentication (JWT)                                   │  │
│  │  - RESTful Endpoints                                      │  │
│  │  - Business Logic                                         │  │
│  │  - Data Validation (Pydantic)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SQL Queries
┌───────────────────────────▼─────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │  - Users Table                                            │  │
│  │  - Workouts Table                                         │  │
│  │  - Statistics Table                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Opens App → Camera Access → MediaPipe Initialization
                                        ↓
                User Starts Exercise ← Select Exercise Type
                                        ↓
                    Pose Detection (30 FPS)
                                        ↓
                    Angle Calculation
                                        ↓
                Rep Counting Logic → Update UI (Real-time)
                                        ↓
                    User Stops Exercise
                                        ↓
        Send Workout Data to API → Save to PostgreSQL
                                        ↓
                    Update Statistics → Retrieve & Display
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| React | 18.2+ | UI Framework | Component-based, excellent ecosystem |
| Vite | 5.0+ | Build Tool | 10x faster than Webpack, modern tooling |
| TypeScript | 5.0+ | Type Safety | Catch errors at compile time |
| TailwindCSS | 3.4+ | Styling | Rapid UI development, small bundles |
| MediaPipe | Latest | Pose Detection | Industry-leading accuracy, free |
| React Router | 6.x | Client Routing | Standard React routing solution |
| Axios | 1.6+ | HTTP Client | Better than fetch(), interceptors |
| Zustand | 4.x | State Management | Simpler than Redux, sufficient for MVP |
| React Hook Form | 7.x | Form Handling | Performant, minimal re-renders |
| Zod | 3.x | Validation | TypeScript-first schema validation |

### Backend Stack

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Python | 3.11+ | Runtime | Latest performance improvements |
| FastAPI | 0.109+ | Web Framework | Async, auto-docs, type-safe |
| Pydantic | 2.x | Data Validation | Type-safe models, integrates with FastAPI |
| SQLAlchemy | 2.x | ORM | Industry standard, supports async |
| Alembic | 1.13+ | Migrations | Versioned database schema changes |
| PostgreSQL | 15+ | Database | ACID compliance, excellent performance |
| Uvicorn | 0.27+ | ASGI Server | High-performance async server |
| Python-Jose | 3.3+ | JWT | Standard JWT implementation |
| Passlib | 1.7+ | Password Hashing | Bcrypt support, secure |
| Pytest | 8.x | Testing | Industry standard Python testing |

### DevOps & Infrastructure

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| Docker | 24+ | Containerization | Consistent environments |
| Docker Compose | 2.x | Multi-container orchestration | Simple local development |
| GitHub Actions | N/A | CI/CD | Integrated with GitHub, free for public repos |
| Vercel | N/A | Frontend Hosting | Excellent DX, free tier |
| Railway | N/A | Backend Hosting | Simple deployment, managed DB |
| Nginx | 1.24+ | Reverse Proxy | Production web server |

### Development Tools

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| ESLint | 8.x | JavaScript Linting | Code quality enforcement |
| Prettier | 3.x | Code Formatting | Consistent code style |
| Husky | 9.x | Git Hooks | Pre-commit quality checks |
| Jest | 29.x | Frontend Testing | Standard React testing |
| Cypress | 13.x | E2E Testing | Reliable end-to-end tests |

---

## Project Structure

### Monorepo Root Structure

```
exercise-counter-app/
├── .github/
│   └── workflows/
│       ├── ci-frontend.yml          # Frontend CI pipeline
│       ├── ci-backend.yml           # Backend CI pipeline
│       └── deploy-production.yml    # Production deployment
├── client/                          # Frontend React application
├── server/                          # Backend FastAPI application
├── shared/                          # Shared code between client/server
│   ├── types/                       # TypeScript types
│   ├── constants/                   # Shared constants
│   └── validation/                  # Shared validation schemas
├── docs/                            # Project documentation
│   ├── api/                         # API documentation
│   ├── architecture/                # Architecture diagrams
│   └── user-guides/                 # End-user documentation
├── docker/                          # Docker configuration files
│   ├── client.Dockerfile
│   ├── server.Dockerfile
│   └── nginx.conf
├── docker-compose.yml               # Local development orchestration
├── docker-compose.prod.yml          # Production orchestration
├── .gitignore                       # Git ignore rules
├── .env.example                     # Environment variable template
├── README.md                        # Project overview
├── CONTRIBUTING.md                  # Contribution guidelines
└── LICENSE                          # License information
```

### Frontend Structure (Feature-Based)

```
client/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── features/                    # Feature-based organization (SRP)
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLogin.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts     # Zustand store
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts             # Public exports
│   │   │
│   │   ├── camera/                  # Camera & Pose Detection feature
│   │   │   ├── components/
│   │   │   │   ├── CameraFeed.tsx
│   │   │   │   ├── PoseCanvas.tsx   # Draws skeleton overlay
│   │   │   │   └── CameraPermissions.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCamera.ts
│   │   │   │   ├── useMediaPipe.ts
│   │   │   │   └── usePoseDetection.ts
│   │   │   ├── services/
│   │   │   │   ├── mediaPipeService.ts
│   │   │   │   └── cameraService.ts
│   │   │   ├── utils/
│   │   │   │   ├── poseDrawing.ts
│   │   │   │   └── cameraHelpers.ts
│   │   │   ├── types/
│   │   │   │   └── pose.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── exercises/               # Exercise counting feature (CORE)
│   │   │   ├── components/
│   │   │   │   ├── ExerciseSelector.tsx
│   │   │   │   ├── RepCounter.tsx
│   │   │   │   ├── WorkoutTimer.tsx
│   │   │   │   ├── WorkoutSummary.tsx
│   │   │   │   └── ExerciseCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useExerciseCounter.ts
│   │   │   │   ├── useWorkoutSession.ts
│   │   │   │   └── useExerciseTimer.ts
│   │   │   ├── services/
│   │   │   │   ├── exerciseService.ts
│   │   │   │   └── workoutService.ts
│   │   │   ├── logic/               # Exercise counting algorithms (SRP)
│   │   │   │   ├── pushUpCounter.ts
│   │   │   │   ├── jumpRopeCounter.ts
│   │   │   │   ├── squatCounter.ts  # Future exercise
│   │   │   │   └── exerciseDetector.ts
│   │   │   ├── store/
│   │   │   │   └── exerciseStore.ts
│   │   │   ├── types/
│   │   │   │   └── exercise.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── statistics/              # Statistics & Analytics feature
│   │   │   ├── components/
│   │   │   │   ├── StatsDashboard.tsx
│   │   │   │   ├── WorkoutHistory.tsx
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   ├── StreakTracker.tsx
│   │   │   │   └── PersonalBests.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useStatistics.ts
│   │   │   │   └── useWorkoutHistory.ts
│   │   │   ├── services/
│   │   │   │   └── statisticsService.ts
│   │   │   ├── utils/
│   │   │   │   └── chartHelpers.ts
│   │   │   ├── types/
│   │   │   │   └── stats.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── profile/                 # User profile feature
│   │       ├── components/
│   │       │   ├── ProfileView.tsx
│   │       │   ├── EditProfile.tsx
│   │       │   └── PreferencesForm.tsx
│   │       ├── hooks/
│   │       │   └── useProfile.ts
│   │       ├── services/
│   │       │   └── profileService.ts
│   │       └── index.ts
│   │
│   ├── shared/                      # Shared across features (DRY)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── Alert.tsx
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── PageLayout.tsx
│   │   │   └── feedback/            # Feedback components
│   │   │       ├── Toast.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── LoadingState.tsx
│   │   ├── hooks/                   # Shared custom hooks
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useAsync.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── dateHelpers.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── calculations.ts
│   │   ├── constants/               # Application constants
│   │   │   ├── routes.ts
│   │   │   ├── config.ts
│   │   │   └── exerciseTypes.ts
│   │   ├── types/                   # Shared TypeScript types
│   │   │   └── common.types.ts
│   │   └── api/                     # API client
│   │       ├── client.ts            # Axios instance
│   │       ├── interceptors.ts
│   │       └── endpoints.ts
│   │
│   ├── pages/                       # Page components (routing)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── WorkoutPage.tsx
│   │   ├── StatisticsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   ├── routes.tsx                   # Route definitions
│   └── vite-env.d.ts               # Vite type declarations
├── tests/
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests (Cypress)
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── package.json
└── README.md
```

### Backend Structure (Feature-Based)

```
server/
├── app/
│   ├── core/                        # Core functionality (config, security)
│   │   ├── config.py                # Application configuration
│   │   ├── security.py              # JWT, password hashing
│   │   ├── dependencies.py          # FastAPI dependencies
│   │   └── exceptions.py            # Custom exceptions
│   │
│   ├── db/                          # Database layer
│   │   ├── base.py                  # SQLAlchemy base
│   │   ├── session.py               # Database session
│   │   └── init_db.py               # Database initialization
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── base.py                  # Base model class
│   │   ├── user.py                  # User model
│   │   ├── workout.py               # Workout model
│   │   ├── exercise.py              # Exercise model
│   │   └── statistic.py             # Statistic model
│   │
│   ├── schemas/                     # Pydantic schemas (validation)
│   │   ├── user.py                  # UserCreate, UserRead, UserUpdate
│   │   ├── workout.py               # WorkoutCreate, WorkoutRead
│   │   ├── exercise.py              # ExerciseSchema
│   │   ├── statistics.py            # StatisticsSchema
│   │   └── token.py                 # Token schemas
│   │
│   ├── api/                         # API routes (feature-based)
│   │   ├── deps.py                  # Route dependencies
│   │   ├── v1/                      # API version 1
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── users.py         # User management endpoints
│   │   │   │   ├── workouts.py      # Workout CRUD endpoints
│   │   │   │   ├── exercises.py     # Exercise type endpoints
│   │   │   │   └── statistics.py    # Statistics endpoints
│   │   │   └── router.py            # Version 1 router aggregation
│   │   └── router.py                # Main API router
│   │
│   ├── services/                    # Business logic layer (SRP)
│   │   ├── auth_service.py          # Authentication logic
│   │   ├── user_service.py          # User management logic
│   │   ├── workout_service.py       # Workout processing logic
│   │   ├── exercise_service.py      # Exercise type management
│   │   └── statistics_service.py    # Statistics calculation logic
│   │
│   ├── repositories/                # Data access layer (SRP)
│   │   ├── base_repository.py       # Base CRUD operations
│   │   ├── user_repository.py       # User data access
│   │   ├── workout_repository.py    # Workout data access
│   │   └── statistics_repository.py # Statistics data access
│   │
│   ├── utils/                       # Utility functions
│   │   ├── date_helpers.py
│   │   ├── validators.py
│   │   └── formatters.py
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── cors.py                  # CORS configuration
│   │   ├── rate_limiting.py         # Rate limiting
│   │   └── logging.py               # Request logging
│   │
│   └── main.py                      # FastAPI application entry
│
├── alembic/                         # Database migrations
│   ├── versions/                    # Migration files
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── alembic.ini
│
├── tests/
│   ├── conftest.py                  # Pytest configuration
│   ├── unit/                        # Unit tests
│   │   ├── test_services/
│   │   └── test_repositories/
│   ├── integration/                 # Integration tests
│   │   └── test_api/
│   └── fixtures/                    # Test fixtures
│
├── scripts/                         # Utility scripts
│   ├── seed_db.py                   # Seed database with test data
│   ├── create_admin.py              # Create admin user
│   └── backup_db.py                 # Database backup
│
├── requirements/                    # Python dependencies
│   ├── base.txt                     # Base requirements
│   ├── dev.txt                      # Development requirements
│   └── prod.txt                     # Production requirements
│
├── .env.example                     # Environment variable template
├── .pylintrc                        # Pylint configuration
├── pyproject.toml                   # Python project configuration
├── pytest.ini                       # Pytest configuration
└── README.md
```

---

## Development Guidelines

### 1. SOLID Principles Application

#### Single Responsibility Principle (SRP)

**Rule:** Each module/class/function should have one, and only one, reason to change.

**Frontend Examples:**

```typescript
// ❌ BAD: Component doing too much
function WorkoutPage() {
  // Handles camera, pose detection, counting, API calls, UI
  const [camera, setCamera] = useState(null);
  const [poses, setPoses] = useState([]);
  const [count, setCount] = useState(0);
  // ... 200+ lines of mixed responsibilities
}

// ✅ GOOD: Separated responsibilities
function WorkoutPage() {
  return (
    <PageLayout>
      <ExerciseSelector />
      <CameraFeed />          {/* Only handles camera */}
      <RepCounter />          {/* Only handles counting display */}
      <WorkoutTimer />        {/* Only handles timing */}
    </PageLayout>
  );
}
```

**Backend Examples:**

```python
# ❌ BAD: Service doing too much
class WorkoutService:
    def create_workout(self, data):
        # Validates, saves to DB, sends email, updates cache
        pass

# ✅ GOOD: Separated responsibilities
class WorkoutService:
    """Handles workout business logic only"""
    def create_workout(self, workout_data: WorkoutCreate) -> Workout:
        validated_workout = self._validate_workout(workout_data)
        return self.workout_repository.create(validated_workout)

class WorkoutRepository:
    """Handles database operations only"""
    def create(self, workout: Workout) -> Workout:
        # Database logic only
        pass
```

#### Open/Closed Principle (OCP)

**Rule:** Software entities should be open for extension, but closed for modification.

**Exercise Counter Example:**

```typescript
// ✅ GOOD: Exercise counters follow OCP
interface ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean;
  getProgress(): number;
}

class PushUpCounter implements ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean {
    const elbowAngle = this.calculateElbowAngle(pose);
    return elbowAngle < 90 && this.wasInUpPosition(previousPose);
  }
  // ...
}

class JumpRopeCounter implements ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean {
    const ankleHeight = this.getAnkleHeight(pose);
    return ankleHeight > this.jumpThreshold && this.wasOnGround(previousPose);
  }
  // ...
}

// Adding new exercise doesn't modify existing code
class SquatCounter implements ExerciseCounter {
  countRep(pose: Pose, previousPose: Pose): boolean {
    const hipKneeAngle = this.calculateHipKneeAngle(pose);
    return hipKneeAngle < 90 && this.wasStanding(previousPose);
  }
  // ...
}
```

#### Liskov Substitution Principle (LSP)

**Rule:** Subtypes must be substitutable for their base types.

```python
# ✅ GOOD: All repositories can substitute BaseRepository
class BaseRepository(Generic[ModelType]):
    def get(self, id: int) -> Optional[ModelType]:
        pass

    def create(self, obj: ModelType) -> ModelType:
        pass

class UserRepository(BaseRepository[User]):
    # Maintains base behavior, adds user-specific methods
    def get_by_email(self, email: str) -> Optional[User]:
        pass

class WorkoutRepository(BaseRepository[Workout]):
    # Maintains base behavior, adds workout-specific methods
    def get_by_user_and_date(self, user_id: int, date: datetime) -> List[Workout]:
        pass
```

#### Interface Segregation Principle (ISP)

**Rule:** Clients should not be forced to depend on interfaces they don't use.

```typescript
// ❌ BAD: Forcing all cameras to implement recording
interface Camera {
  start(): void;
  stop(): void;
  takeSnapshot(): Blob;
  startRecording(): void;  // Not all features need this
  stopRecording(): void;
}

// ✅ GOOD: Segregated interfaces
interface BasicCamera {
  start(): void;
  stop(): void;
  takeSnapshot(): Blob;
}

interface RecordableCamera extends BasicCamera {
  startRecording(): void;
  stopRecording(): void;
}

// Use only what you need
function PoseDetectionComponent(camera: BasicCamera) {
  // Only uses start/stop/snapshot
}
```

#### Dependency Inversion Principle (DIP)

**Rule:** Depend on abstractions, not concretions.

```python
# ✅ GOOD: Service depends on repository interface, not concrete DB
class WorkoutService:
    def __init__(self, workout_repo: IWorkoutRepository):
        self.workout_repo = workout_repo  # Interface, not PostgresWorkoutRepository

    def get_user_workouts(self, user_id: int) -> List[Workout]:
        return self.workout_repo.get_by_user(user_id)

# Easy to swap implementations (PostgreSQL -> MongoDB)
class PostgresWorkoutRepository(IWorkoutRepository):
    pass

class MongoWorkoutRepository(IWorkoutRepository):
    pass
```

---

### 2. YAGNI (You Aren't Gonna Need It)

**Rule:** Don't implement features until they're actually needed.

#### ✅ Include in MVP

- User authentication (login/register)
- Two exercise types (push-ups, jump rope)
- Basic statistics (total reps, workout history)
- Camera access and pose detection
- Simple responsive UI

#### ❌ Defer to Later Phases

- Social features (friends, sharing)
- Custom exercise creation
- Video recording of workouts
- Advanced analytics (ML predictions)
- Mobile apps (start with web)
- Payment processing
- Multi-language support
- Offline mode
- Real-time multiplayer workouts

**Code Example:**

```typescript
// ❌ BAD: Over-engineering for future that may not come
interface ExerciseConfig {
  id: string;
  name: string;
  customAngleThresholds: Map<string, number>;
  advancedMLModel?: string;
  socialSharingEnabled?: boolean;
  vrCompatible?: boolean;
  // ... 20+ more fields for future features
}

// ✅ GOOD: Only what we need now
interface ExerciseConfig {
  id: string;
  name: string;
  type: 'push-up' | 'jump-rope';
}

// Add fields when needed, not before
```

---

### 3. DRY (Don't Repeat Yourself)

**Rule:** Every piece of knowledge should have a single, unambiguous representation.

#### Applying DRY

```typescript
// ❌ BAD: Repeated angle calculation logic
class PushUpCounter {
  countRep(pose: Pose): boolean {
    const shoulder = pose.landmarks[11];
    const elbow = pose.landmarks[13];
    const wrist = pose.landmarks[15];
    const angle = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) -
                  Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
    return angle < 90;
  }
}

class SquatCounter {
  countRep(pose: Pose): boolean {
    const hip = pose.landmarks[23];
    const knee = pose.landmarks[25];
    const ankle = pose.landmarks[27];
    // Same calculation repeated!
    const angle = Math.atan2(ankle.y - knee.y, ankle.x - knee.x) -
                  Math.atan2(hip.y - knee.y, hip.x - knee.x);
    return angle < 90;
  }
}

// ✅ GOOD: Extracted to utility function
// shared/utils/angleCalculations.ts
export function calculateAngle(
  pointA: Landmark,
  pointB: Landmark,
  pointC: Landmark
): number {
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  return Math.abs((radians * 180.0) / Math.PI);
}

// Now both counters use the same function
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

```python
# ❌ BAD: Repeated validation logic
def create_workout(workout_data):
    if not workout_data.exercise_type:
        raise ValueError("Exercise type required")
    if workout_data.reps_count < 0:
        raise ValueError("Reps cannot be negative")
    # Save to DB

def update_workout(workout_id, workout_data):
    # Same validation repeated!
    if not workout_data.exercise_type:
        raise ValueError("Exercise type required")
    if workout_data.reps_count < 0:
        raise ValueError("Reps cannot be negative")
    # Update DB

# ✅ GOOD: Pydantic schema validates once
from pydantic import BaseModel, Field, validator

class WorkoutBase(BaseModel):
    exercise_type: str
    reps_count: int = Field(ge=0, description="Reps must be non-negative")

    @validator('exercise_type')
    def exercise_type_must_be_valid(cls, v):
        if v not in ['push-up', 'jump-rope']:
            raise ValueError('Invalid exercise type')
        return v

# Both endpoints use same schema, validation happens automatically
def create_workout(workout_data: WorkoutBase):
    # Already validated by Pydantic
    pass

def update_workout(workout_id: int, workout_data: WorkoutBase):
    # Already validated by Pydantic
    pass
```

---

### 4. Naming Conventions

#### TypeScript/JavaScript Naming

```typescript
// Variables and functions: camelCase
const userName = "John";
const totalRepsCount = 42;
function calculateAngle(pointA, pointB, pointC) {}
function getUserWorkouts(userId) {}

// Classes and Components: PascalCase
class WorkoutService {}
class ExerciseCounter {}
function WorkoutPage() {}
function RepCounter() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_REPS_PER_SET = 100;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_EXERCISE_TYPE = "push-up";

// Private methods/variables: _prefixed (convention)
class PoseDetector {
  private _mediaPipe: MediaPipe;
  private _initializeModel() {}
}

// Interfaces: PascalCase with 'I' prefix (optional but clear)
interface IExerciseCounter {
  countRep(pose: Pose): boolean;
}

// Types: PascalCase
type ExerciseType = 'push-up' | 'jump-rope';
type WorkoutStatus = 'active' | 'paused' | 'completed';

// Enums: PascalCase (keys SCREAMING_SNAKE_CASE)
enum ExerciseType {
  PUSH_UP = 'push-up',
  JUMP_ROPE = 'jump-rope',
  SQUAT = 'squat',
}

// Files: kebab-case or camelCase (be consistent)
// exercise-counter.ts
// workoutService.ts
// RepCounter.tsx
```

#### Python Naming

```python
# Variables and functions: snake_case
user_name = "John"
total_reps_count = 42

def calculate_angle(point_a, point_b, point_c):
    pass

def get_user_workouts(user_id):
    pass

# Classes: PascalCase
class WorkoutService:
    pass

class ExerciseCounter:
    pass

# Constants: SCREAMING_SNAKE_CASE
MAX_REPS_PER_SET = 100
API_BASE_URL = "https://api.example.com"
DEFAULT_EXERCISE_TYPE = "push-up"

# Private methods/attributes: _prefixed
class PoseDetector:
    def __init__(self):
        self._model = None

    def _initialize_model(self):
        pass

# Protected methods/attributes: single underscore
class BaseRepository:
    def _validate_id(self, id):
        pass

# "Name mangling" (strongly private): __double_prefix
class WorkoutService:
    def __internal_cache_clear(self):
        pass

# Files: snake_case
# workout_service.py
# exercise_counter.py
# user_repository.py
```

#### Database Naming

```sql
-- Tables: plural, snake_case
CREATE TABLE users (...);
CREATE TABLE workouts (...);
CREATE TABLE workout_statistics (...);

-- Columns: snake_case
user_id, first_name, created_at, reps_count

-- Indexes: idx_<table>_<columns>
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);

-- Foreign keys: fk_<table>_<referenced_table>
ALTER TABLE workouts ADD CONSTRAINT fk_workouts_users
  FOREIGN KEY (user_id) REFERENCES users(id);
```

#### REST API Endpoints

```
# RESTful conventions
GET    /api/v1/users                    # List users
GET    /api/v1/users/:id                # Get user
POST   /api/v1/users                    # Create user
PUT    /api/v1/users/:id                # Update user (full)
PATCH  /api/v1/users/:id                # Update user (partial)
DELETE /api/v1/users/:id                # Delete user

# Nested resources
GET    /api/v1/users/:id/workouts       # Get user's workouts
POST   /api/v1/users/:id/workouts       # Create workout for user

# Actions (when REST doesn't fit): use POST with action verb
POST   /api/v1/workouts/:id/complete    # Complete a workout
POST   /api/v1/auth/login               # Login action
POST   /api/v1/auth/refresh-token       # Refresh token action

# Use kebab-case for URLs
/api/v1/workout-statistics
/api/v1/exercise-types
```

---

### 5. Code Quality Standards

#### ESLint Rules (Frontend)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "error",
    "prefer-const": "error",
    "react/prop-types": "off",  // TypeScript handles this
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines-per-function": ["warn", 50],
    "complexity": ["warn", 10]
  }
}
```

#### Pylint/Flake8 Rules (Backend)

```ini
[pylint]
max-line-length = 100
max-args = 5
max-locals = 15
max-returns = 3
max-branches = 12
max-statements = 50
disable = missing-docstring  # Required in production

[flake8]
max-line-length = 100
max-complexity = 10
ignore = E203, W503  # Black compatibility
```

#### Code Review Checklist

**Every Pull Request Must:**

- [ ] Pass all automated tests (unit + integration)
- [ ] Have no ESLint/Pylint errors
- [ ] Include tests for new features
- [ ] Update relevant documentation
- [ ] Follow naming conventions
- [ ] Have meaningful commit messages
- [ ] Be reviewed by at least one other developer
- [ ] Have no console.log() or print() statements in production code
- [ ] Handle errors gracefully
- [ ] Include type annotations (TypeScript/Python)

#### Git Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

**Examples:**

```
feat(exercises): add squat counter with angle detection

Implement SquatCounter class that tracks hip-knee-ankle angle
to count squat repetitions. Uses same angle calculation utility
as push-up counter.

Closes #42
```

```
fix(camera): prevent memory leak in pose detection loop

Release MediaPipe resources when component unmounts.
Previously, resources were not cleaned up causing memory
to grow over time during long workout sessions.

Fixes #38
```

---

## Implementation Roadmap

### Phase 1: MVP Development (Weeks 1-4)

#### Week 1: Project Setup & Camera Integration

**Goals:**
- Set up development environment
- Implement camera access and MediaPipe pose detection
- Create basic UI shell

**Tasks:**

**Day 1-2: Environment Setup**
```bash
# Initialize project
mkdir exercise-counter-app && cd exercise-counter-app
git init

# Create monorepo structure
mkdir -p client server shared docs docker

# Frontend setup
cd client
npm create vite@latest . -- --template react-ts
npm install @mediapipe/tasks-vision axios zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p

# Backend setup
cd ../server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib psycopg2-binary
pip freeze > requirements/base.txt

# Docker setup
cd ..
touch docker-compose.yml
```

**Day 3-5: Camera & MediaPipe Integration**

Create `client/src/features/camera/hooks/useCamera.ts`:
```typescript
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  return { stream, error, startCamera, stopCamera, videoRef };
}
```

Create `client/src/features/camera/hooks/useMediaPipe.ts`:
```typescript
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useMediaPipe() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });

      setPoseLandmarker(landmarker);
      setIsLoading(false);
    };

    initMediaPipe();
  }, []);

  return { poseLandmarker, isLoading };
}
```

**Day 6-7: Basic UI Components**

Create responsive layout with Tailwind, camera permission handling, and pose visualization canvas.

**Deliverables:**
- ✅ Camera feed displaying in browser
- ✅ MediaPipe detecting poses at 30 FPS
- ✅ Skeleton overlay drawn on canvas
- ✅ Basic UI with start/stop buttons

---

#### Week 2: Exercise Counting Logic

**Goals:**
- Implement push-up and jump rope counting algorithms
- Create real-time counter UI
- Add exercise selection

**Tasks:**

**Day 1-3: Counting Algorithms**

Create `client/src/shared/utils/angleCalculations.ts`:
```typescript
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export function calculateAngle(
  pointA: Landmark,
  pointB: Landmark,
  pointC: Landmark
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

export function calculateDistance(pointA: Landmark, pointB: Landmark): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  const dz = pointA.z - pointB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
```

Create `client/src/features/exercises/logic/pushUpCounter.ts`:
```typescript
import { calculateAngle } from '@/shared/utils/angleCalculations';

export class PushUpCounter {
  private isInDownPosition = false;
  private repCount = 0;
  private readonly ANGLE_THRESHOLD = 90;

  countRep(landmarks: Landmark[]): { counted: boolean; repCount: number } {
    // Right arm: shoulder (12), elbow (14), wrist (16)
    const rightElbowAngle = calculateAngle(
      landmarks[12],
      landmarks[14],
      landmarks[16]
    );

    // Left arm: shoulder (11), elbow (13), wrist (15)
    const leftElbowAngle = calculateAngle(
      landmarks[11],
      landmarks[13],
      landmarks[15]
    );

    const avgElbowAngle = (rightElbowAngle + leftElbowAngle) / 2;

    let counted = false;

    // Down position detected
    if (avgElbowAngle < this.ANGLE_THRESHOLD && !this.isInDownPosition) {
      this.isInDownPosition = true;
    }

    // Up position detected (complete rep)
    if (avgElbowAngle > 160 && this.isInDownPosition) {
      this.isInDownPosition = false;
      this.repCount++;
      counted = true;
    }

    return { counted, repCount: this.repCount };
  }

  reset(): void {
    this.repCount = 0;
    this.isInDownPosition = false;
  }

  getRepCount(): number {
    return this.repCount;
  }
}
```

Create `client/src/features/exercises/logic/jumpRopeCounter.ts`:
```typescript
export class JumpRopeCounter {
  private isInAir = false;
  private repCount = 0;
  private readonly JUMP_THRESHOLD = 0.1; // Relative to frame height

  countRep(landmarks: Landmark[]): { counted: boolean; repCount: number } {
    // Use ankle landmarks (27, 28) for jump detection
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

    // Use hip landmarks (23, 24) as reference for body height
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const avgHipY = (leftHip.y + rightHip.y) / 2;

    const ankleToHipDistance = avgHipY - avgAnkleY;

    let counted = false;

    // In air (jump detected)
    if (ankleToHipDistance > this.JUMP_THRESHOLD && !this.isInAir) {
      this.isInAir = true;
    }

    // Landed (complete jump)
    if (ankleToHipDistance < 0.05 && this.isInAir) {
      this.isInAir = false;
      this.repCount++;
      counted = true;
    }

    return { counted, repCount: this.repCount };
  }

  reset(): void {
    this.repCount = 0;
    this.isInAir = false;
  }

  getRepCount(): number {
    return this.repCount;
  }
}
```

**Day 4-5: Exercise Hook Integration**

Create `client/src/features/exercises/hooks/useExerciseCounter.ts`:
```typescript
export type ExerciseType = 'push-up' | 'jump-rope';

export function useExerciseCounter(exerciseType: ExerciseType) {
  const counterRef = useRef<PushUpCounter | JumpRopeCounter | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [lastRepTime, setLastRepTime] = useState<number | null>(null);

  useEffect(() => {
    // Initialize counter based on exercise type
    if (exerciseType === 'push-up') {
      counterRef.current = new PushUpCounter();
    } else {
      counterRef.current = new JumpRopeCounter();
    }
    setRepCount(0);
  }, [exerciseType]);

  const processFrame = useCallback((landmarks: Landmark[]) => {
    if (!counterRef.current) return;

    const { counted, repCount: newCount } = counterRef.current.countRep(landmarks);

    if (counted) {
      setRepCount(newCount);
      setLastRepTime(Date.now());
      // Optional: Play sound, vibrate, etc.
    }
  }, []);

  const reset = useCallback(() => {
    counterRef.current?.reset();
    setRepCount(0);
    setLastRepTime(null);
  }, []);

  return { repCount, lastRepTime, processFrame, reset };
}
```

**Day 6-7: UI Components**

Create exercise selector, real-time counter display, and workout timer.

**Deliverables:**
- ✅ Push-up counting working with >95% accuracy
- ✅ Jump rope counting working
- ✅ Real-time rep counter updating
- ✅ Exercise selection UI

---

#### Week 3: Backend Development

**Goals:**
- Set up FastAPI backend
- Implement authentication
- Create database models and API endpoints
- Docker containerization

**Tasks:**

**Day 1-2: Database Models**

Create `server/app/models/user.py`:
```python
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
```

Create `server/app/models/workout.py`:
```python
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exercise_type = Column(String(50), nullable=False)  # 'push-up', 'jump-rope'
    reps_count = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)  # Workout duration
    calories_burned = Column(Float, nullable=True)  # Optional calorie estimation
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="workouts")
```

**Day 3-4: Pydantic Schemas**

Create `server/app/schemas/user.py`:
```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserRead(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
```

Create `server/app/schemas/workout.py`:
```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class WorkoutBase(BaseModel):
    exercise_type: str = Field(..., pattern="^(push-up|jump-rope)$")
    reps_count: int = Field(..., ge=0)
    duration_seconds: int = Field(..., ge=0)
    calories_burned: float | None = None

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutRead(WorkoutBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
```

**Day 5: Authentication**

Create `server/app/core/security.py`:
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Day 6-7: API Endpoints**

Create `server/app/api/v1/endpoints/auth.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.auth_service import AuthService
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserRead

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    auth_service = AuthService(db)
    user = await auth_service.register_user(user_data)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    auth_service = AuthService(db)
    token = await auth_service.login_user(form_data.username, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    return token
```

Create `server/app/api/v1/endpoints/workouts.py`:
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.api.deps import get_db, get_current_user
from app.services.workout_service import WorkoutService
from app.schemas.workout import WorkoutCreate, WorkoutRead
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a completed workout"""
    workout_service = WorkoutService(db)
    workout = await workout_service.create_workout(current_user.id, workout_data)
    return workout

@router.get("/", response_model=List[WorkoutRead])
async def get_user_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get current user's workout history"""
    workout_service = WorkoutService(db)
    workouts = await workout_service.get_user_workouts(current_user.id, skip, limit)
    return workouts

@router.get("/{workout_id}", response_model=WorkoutRead)
async def get_workout(
    workout_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout"""
    workout_service = WorkoutService(db)
    workout = await workout_service.get_workout(workout_id, current_user.id)
    return workout
```

**Deliverables:**
- ✅ FastAPI server running
- ✅ User registration and login working
- ✅ JWT authentication implemented
- ✅ Workout CRUD endpoints functional
- ✅ PostgreSQL database schema created
- ✅ Alembic migrations set up

---

#### Week 4: Integration & Deployment

**Goals:**
- Connect frontend to backend
- Add statistics dashboard
- Deploy to production
- End-to-end testing

**Tasks:**

**Day 1-2: Frontend-Backend Integration**

Create `client/src/shared/api/client.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

Create `client/src/features/auth/services/authService.ts`:
```typescript
import { apiClient } from '@/shared/api/client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },
};
```

**Day 3-4: Statistics Dashboard**

Create statistics service, fetch workout history, display charts using Recharts.

**Day 5-6: Docker & Deployment**

Create `docker/client.Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `docker/server.Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements/prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: exercise_counter
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: ./server
      dockerfile: ../docker/server.Dockerfile
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/exercise_counter
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: ../docker/client.Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deployment to Vercel + Railway:**

```bash
# Frontend to Vercel
cd client
npm install -g vercel
vercel --prod

# Backend to Railway (via GitHub integration)
# 1. Push code to GitHub
# 2. Connect Railway to GitHub repo
# 3. Set environment variables in Railway dashboard
# 4. Railway auto-deploys on push to main
```

**Day 7: Testing & Polish**

- Write end-to-end tests with Cypress
- Test on multiple devices/browsers
- Fix bugs and polish UI
- Update documentation

**Deliverables:**
- ✅ Full application working end-to-end
- ✅ Deployed to production
- ✅ Statistics dashboard functional
- ✅ Responsive design on mobile/desktop
- ✅ Documentation complete

---

### Phase 2: Enhancements (Months 2-3)

**Future Features (Post-MVP):**

1. **Mobile App** (React Native)
2. **More Exercises** (Squats, lunges, planks)
3. **Social Features** (Friends, leaderboards)
4. **Form Feedback** (AI-powered form correction)
5. **Workout Programs** (Structured training plans)
6. **Progress Analytics** (ML-based predictions)
7. **Voice Commands** (Hands-free control)
8. **Apple Health / Google Fit Integration**

---

## Deployment Strategy

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: exercise_counter_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass123
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://dev:devpass123@db:5432/exercise_counter_dev
      SECRET_KEY: dev-secret-key-change-in-production
      DEBUG: "true"
    volumes:
      - ./server:/app
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
    command: npm run dev

volumes:
  postgres_dev_data:
```

**Start Development Environment:**
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Staging Environment

**Infrastructure:**
- **Platform:** Railway (Backend + PostgreSQL)
- **Frontend:** Vercel Preview Deployments
- **Purpose:** Pre-production testing

**Configuration:**
```bash
# Railway environment variables
DATABASE_URL=postgresql://user:pass@railway.internal:5432/staging
SECRET_KEY=<strong-random-key>
ENVIRONMENT=staging
ALLOWED_ORIGINS=https://staging.exercise-counter.com

# Vercel environment variables
VITE_API_URL=https://api-staging.exercise-counter.com
VITE_ENVIRONMENT=staging
```

### Production Environment

**Architecture:**

```
┌────────────────────────────────────────────────────────────────┐
│                         Users (Global)                          │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    Vercel CDN (Global Edge)                     │
│                    - Static Assets Cached                       │
│                    - HTTPS/SSL Automatic                        │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│               Railway (Backend + PostgreSQL)                    │
│  ┌───────────────────────┐  ┌───────────────────────────────┐ │
│  │  FastAPI Backend      │  │  PostgreSQL 15                │ │
│  │  - Auto-scaling       │  │  - Automated backups          │ │
│  │  - Health checks      │  │  - Connection pooling         │ │
│  └───────────────────────┘  └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Deployment Checklist:**

- [ ] Environment variables configured (production values)
- [ ] Database migrations applied
- [ ] Static assets optimized and minified
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] Health check endpoints responding
- [ ] Monitoring/logging configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed

### CI/CD Pipeline

**GitHub Actions Workflow:**

Create `.github/workflows/ci-cd.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd client && npm ci
      - name: Run linter
        run: cd client && npm run lint
      - name: Run tests
        run: cd client && npm test
      - name: Build
        run: cd client && npm run build

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: cd server && pip install -r requirements/base.txt
      - name: Run linter
        run: cd server && pylint app
      - name: Run tests
        run: cd server && pytest
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test-frontend, test-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push to main
          echo "Backend deployed automatically│
