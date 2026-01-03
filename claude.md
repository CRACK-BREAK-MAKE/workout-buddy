# Claude Context - Exercise Buddy Project

## Project Overview
AI-powered exercise counting app using computer vision (MediaPipe) to automatically count exercise reps through webcam. Weekend project focused on MVP first, optimize later - but built with production-grade practices.

## Tech Stack (Latest Versions - Jan 2026)
**Frontend:** React 19.2.3 + Vite 7.2.7 + TypeScript 5.7+ + TailwindCSS 4.1 + MediaPipe
**Backend:** FastAPI 0.128.0 (Python 3.14.2) + PostgreSQL 18.1 + SQLAlchemy 2.0 + Alembic
**DevOps:** Docker (Node 24 LTS, Python 3.14) + Docker Compose, GitHub Actions CI/CD
**Hosting:** Vercel (frontend), Railway (backend + DB)
**Monitoring:** Railway logs, Vercel Analytics (add Sentry later)
**Package Managers:**
  - Frontend: **pnpm 10.x** (3x faster than npm, better disk usage)
  - Backend: **uv** (10-100x faster than pip, Rust-based)

## Project Structure
```
exercise-buddy/
├── .github/
│   └── workflows/
│       ├── ci-frontend.yml           # Frontend CI (lint, test, build)
│       ├── ci-backend.yml            # Backend CI (lint, test, migrations)
│       └── deploy-production.yml     # Deploy on merge to main
├── client/                           # React frontend
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── server/                           # FastAPI backend
│   ├── app/
│   ├── tests/
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   ├── alembic/
│   └── Dockerfile
├── shared/                           # Shared types/constants
├── docker/
│   ├── nginx.conf
│   └── docker-compose.*.yml
├── docs/
├── .env.example                      # Environment template
├── docker-compose.yml                # Local development
└── README.md
```

## Core Features (MVP)
1. **Camera & Pose Detection** - MediaPipe Pose (browser-side, 30 FPS)
2. **Exercise Counting** - Push-ups & Jump rope (>95% accuracy target)
3. **Authentication** - JWT-based (login/register)
4. **Workout Tracking** - Save workouts to PostgreSQL
5. **Statistics** - Basic dashboard (history, reps count)

## Development Principles
- **SOLID:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY:** Don't Repeat Yourself - extract common logic to utils
- **YAGNI:** You Aren't Gonna Need It - build only what's needed for MVP
- **Feature-Based Structure:** Organize by domain, not by technical layer
- **12-Factor App:** Config in env vars, stateless processes, disposable containers

## CI/CD Pipeline Architecture

### Branch Strategy
```
main            → Production (protected, requires PR + reviews + passing tests)
develop         → Staging (auto-deploy to staging env)
feature/*       → Feature branches (run CI checks, no deploy)
hotfix/*        → Emergency fixes (can fast-track to main)
```

### GitHub Actions Workflow

#### 1. Pull Request Checks (on any PR)
```yaml
Triggers: Pull request opened/updated to main or develop
Jobs:
  - Lint frontend (ESLint + Prettier)
  - Test frontend (Jest unit tests)
  - Build frontend (ensure no build errors)
  - Lint backend (Pylint + Black)
  - Test backend (Pytest with test DB)
  - Check migrations (Alembic dry-run)
  - Security scan (Dependabot, Snyk optional)
Status: Must pass before merge allowed
```

#### 2. Staging Deploy (on push to develop)
```yaml
Triggers: Push to develop branch
Prerequisites: All CI checks passed
Jobs:
  - Deploy frontend to Vercel preview
  - Deploy backend to Railway staging env
  - Run database migrations (staging DB)
  - Run smoke tests (health check endpoints)
  - Post deployment URL to Slack/Discord
```

#### 3. Production Deploy (on merge to main)
```yaml
Triggers: Pull request merged to main
Prerequisites:
  - All tests passed
  - Code review approved (min 1 reviewer)
  - No security vulnerabilities
Jobs:
  - Build frontend (production optimizations)
  - Deploy frontend to Vercel production
  - Deploy backend to Railway production
  - Run database migrations (with backup first!)
  - Run smoke tests on production
  - Tag release (semantic versioning)
  - Post deployment notification
Rollback: Automatic if smoke tests fail
```

### Pre-commit Hooks (Husky)
```bash
On commit:
  - Run Prettier (auto-format)
  - Run ESLint (catch obvious errors)
  - Run type-check (TypeScript)

On push:
  - Run quick tests (<10s)
  - Verify no console.log/debugger statements
```

## Environment Management

### Development (.env.local)
```bash
# Frontend
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development

# Backend
DATABASE_URL=postgresql://dev:devpass@localhost:5432/exercise_counter_dev
SECRET_KEY=dev-secret-change-in-production
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]
```

### Staging (Railway/Vercel env vars)
```bash
# Frontend
VITE_API_URL=https://api-staging.exercise-buddy.com/api/v1
VITE_ENVIRONMENT=staging
VITE_SENTRY_DSN=<sentry-dsn>

# Backend
DATABASE_URL=<railway-postgres-connection-string>
SECRET_KEY=<strong-random-key-from-secrets>
DEBUG=false
CORS_ORIGINS=["https://staging.exercise-buddy.com"]
SENTRY_DSN=<sentry-dsn>
```

### Production (Railway/Vercel env vars)
```bash
# Frontend
VITE_API_URL=https://api.exercise-buddy.com/api/v1
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=<sentry-dsn>

# Backend
DATABASE_URL=<railway-postgres-connection-string>
SECRET_KEY=<strong-random-key-from-secrets>
DEBUG=false
CORS_ORIGINS=["https://exercise-buddy.com"]
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info
```

## Key Architecture Decisions
1. **MediaPipe in Browser** - No backend ML processing = $0 cost, instant feedback, privacy-preserving
2. **Monorepo** - Single repo with /client and /server for atomic commits, easier CI/CD
3. **JWT Auth** - Stateless, scalable, mobile-ready
4. **PostgreSQL** - ACID compliance for user data, JSON support for flexibility
5. **Docker from Day 1** - Consistent dev/staging/prod environments
6. **GitHub Actions** - Integrated CI/CD, free for public repos, runs on PR/merge
7. **Railway Auto-Deploy** - Deploys backend on push to main (via GitHub integration)
8. **Vercel Auto-Deploy** - Deploys frontend on push to main (via GitHub integration)

## Code Organization Examples

### Frontend Feature Structure
```
client/src/features/exercises/
├── components/      # React components
├── hooks/          # Custom hooks (useExerciseCounter)
├── services/       # API calls
├── logic/          # Exercise algorithms (pushUpCounter.ts)
├── store/          # Zustand state
├── types/          # TypeScript types
└── __tests__/      # Colocated tests
```

### Backend Feature Structure
```
server/app/
├── api/            # FastAPI routes (feature-based)
│   └── v1/endpoints/
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic validation schemas
├── services/       # Business logic layer (testable)
├── repositories/   # Data access layer (testable)
├── core/           # Config, security, dependencies
└── tests/          # Test suite
    ├── unit/
    ├── integration/
    └── conftest.py
```

## Exercise Counting Logic
- **Push-ups:** Track elbow angle (shoulder-elbow-wrist), detect down (<90°) → up (>160°)
- **Jump rope:** Track ankle height relative to hip, detect jump (ankles up) → land (ankles down)
- **Shared:** Use common `calculateAngle()` utility for all exercises (DRY principle)

## Naming Conventions
- **TypeScript:** camelCase (variables/functions), PascalCase (components/classes), SCREAMING_SNAKE_CASE (constants)
- **Python:** snake_case (variables/functions), PascalCase (classes), SCREAMING_SNAKE_CASE (constants)
- **Files:** kebab-case or matching component name
- **API Endpoints:** RESTful, kebab-case URLs (/api/v1/workout-statistics)
- **Branches:** feature/exercise-counter, fix/camera-memory-leak, hotfix/auth-token-expiry

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# Frontend: http://localhost:5173 (Vite HMR)
# Backend: http://localhost:8000 (FastAPI auto-reload)
# API Docs: http://localhost:8000/docs (Swagger UI)
# Database: localhost:5432 (PostgreSQL)
```

### Feature Development Workflow
```bash
1. Create feature branch: git checkout -b feature/jump-rope-counter
2. Make changes, write tests
3. Commit with conventional commits: feat(exercises): add jump rope counter
4. Push to GitHub: git push origin feature/jump-rope-counter
5. Open Pull Request (triggers CI checks)
6. Wait for CI to pass (linting, tests, build)
7. Request code review (at least 1 approval required)
8. Merge to develop (auto-deploys to staging)
9. Test on staging environment
10. Open PR from develop → main (triggers production deploy after merge)
```

### Database Migrations
```bash
# Create migration (local)
cd server
alembic revision --autogenerate -m "add workouts table"

# Apply migration (local)
alembic upgrade head

# In production (handled by CI/CD):
# - Backup DB first
# - Run alembic upgrade head
# - Verify migration success
# - Rollback if issues detected
```

## Testing Strategy
- **Unit Tests:** Jest (frontend), Pytest (backend) - run on every PR
- **Integration Tests:** API endpoint tests with test DB - run on every PR
- **E2E Tests:** Cypress for critical user flows - run before production deploy
- **Manual Testing:** Test on Chrome/Edge (MediaPipe works best)
- **Coverage Target:** >80% for services/logic, >60% overall

## Monitoring & Observability

### Health Checks
```python
# Backend health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": await check_db_connection(),
        "timestamp": datetime.utcnow()
    }
```

### Logging Strategy
- **Development:** Console logs (DEBUG level)
- **Staging:** Structured JSON logs (INFO level) → Railway logs
- **Production:** Structured JSON logs (WARNING level) → Railway logs + Sentry for errors

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Active user sessions
- Workout completion rates
- Exercise counting accuracy (user feedback)

## Deployment Strategy

### MVP Phase (0-1000 users) - Current
**Frontend:** Vercel
- Free tier: 100GB bandwidth, unlimited deployments
- Auto SSL, global CDN, instant rollbacks
- Cost: $0/month

**Backend + Database:** Railway
- Free tier: $5/month credit, 512MB RAM, 1GB storage
- Managed PostgreSQL with automated backups
- Auto-deploy on Git push
- Cost: $5-20/month

**Total MVP Cost:** $5-20/month

### Scaling Phase (1000-10,000 users)
**Frontend:** Vercel Pro ($20/month)
- 1TB bandwidth, advanced analytics

**Backend:** Railway Pro or migrate to AWS ECS
- More RAM/CPU, connection pooling
- Cost: $50-200/month

**Database:** Railway or AWS RDS
- Connection pooling (PgBouncer)
- Read replicas for analytics
- Cost: $50-150/month

**Total Scaling Cost:** $120-370/month

### Production-Ready Checklist
Before deploying to production:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit completed (no secrets in code, SQL injection prevented)
- [ ] CORS configured correctly (only allow production domain)
- [ ] Rate limiting enabled (prevent abuse)
- [ ] Database backups automated (Railway handles this)
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring/alerting set up (Railway + Sentry)
- [ ] SSL/HTTPS enforced everywhere
- [ ] Environment variables secured (never in code)
- [ ] API documentation up to date (Swagger auto-generated)
- [ ] Load testing completed (can handle 100 concurrent users)
- [ ] Rollback plan documented
- [ ] Health check endpoints implemented
- [ ] Dependency vulnerabilities checked (Dependabot)

## What NOT to Build (Yet)
❌ Social features (friends, sharing)
❌ Custom exercise creation
❌ Video recording
❌ Mobile apps (web-first MVP)
❌ Payment processing
❌ Multi-language support
❌ Advanced analytics/ML predictions
❌ Real-time multiplayer workouts
❌ Offline mode

## Current Status
- Architecture designed ✅
- CI/CD strategy defined ✅
- Ready to start implementation

## Next Steps
1. Create GitHub Actions workflows (.github/workflows/)
2. Set up project structure (monorepo with Docker)
3. Configure Vercel + Railway for auto-deploy
4. Start Week 1: Camera + MediaPipe integration
5. Follow 4-week MVP roadmap from architecture doc

## Important Reminders
- **Privacy:** All pose detection happens in browser, no video sent to servers
- **Performance:** Target <100ms latency for pose detection
- **Accuracy:** >95% rep counting accuracy goal
- **Mobile:** Responsive design from day 1, optimize for desktop first
- **Browser Support:** Chrome/Edge recommended (best MediaPipe performance)
- **Security:** Never commit secrets, use environment variables
- **Testing:** Write tests alongside features, not as an afterthought
- **Code Review:** All changes go through PR review, no direct commits to main
- **Conventional Commits:** Follow format for automatic changelog generation

## Common Utilities to Create
- `calculateAngle(pointA, pointB, pointC)` - Angle between 3 landmarks
- `calculateDistance(pointA, pointB)` - Distance between 2 points
- `apiClient` - Axios instance with JWT interceptors + retry logic
- `dateHelpers` - Workout date formatting/parsing
- `errorHandler` - Centralized error handling with Sentry integration
- `logger` - Structured logging utility

## Database Schema (Core Tables)
```sql
users:
  id              UUID PRIMARY KEY
  email           VARCHAR(255) UNIQUE NOT NULL
  username        VARCHAR(50) UNIQUE NOT NULL
  hashed_password VARCHAR(255) NOT NULL
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

workouts:
  id                UUID PRIMARY KEY
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE
  exercise_type     VARCHAR(50) NOT NULL  -- 'push-up', 'jump-rope'
  reps_count        INTEGER NOT NULL CHECK (reps_count >= 0)
  duration_seconds  INTEGER NOT NULL CHECK (duration_seconds >= 0)
  calories_burned   FLOAT
  created_at        TIMESTAMP DEFAULT NOW()
  INDEX idx_workouts_user_id (user_id)
  INDEX idx_workouts_created_at (created_at)

-- Statistics are calculated from workouts table (no separate table for MVP)
```

## API Endpoints (RESTful)
```
Authentication:
POST   /api/v1/auth/register       # Register new user
POST   /api/v1/auth/login          # Login (get JWT token)
POST   /api/v1/auth/refresh        # Refresh access token

Users:
GET    /api/v1/users/me            # Get current user profile
PUT    /api/v1/users/me            # Update current user profile
DELETE /api/v1/users/me            # Delete account

Workouts:
POST   /api/v1/workouts            # Save completed workout
GET    /api/v1/workouts            # Get user's workout history (paginated)
GET    /api/v1/workouts/:id        # Get specific workout
DELETE /api/v1/workouts/:id        # Delete workout

Statistics:
GET    /api/v1/statistics/summary  # Overall stats (total reps, workouts)
GET    /api/v1/statistics/weekly   # Weekly breakdown
GET    /api/v1/statistics/exercise/:type  # Stats by exercise type

Health:
GET    /health                     # Health check (no auth required)
GET    /api/v1/health              # Detailed health check (auth required)
```

## Git Commit Format (Conventional Commits)
```
<type>(<scope>): <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation changes
  style:    Code style (formatting, no logic change)
  refactor: Code refactoring
  test:     Add/update tests
  chore:    Maintenance tasks (dependencies, build config)
  perf:     Performance improvements
  ci:       CI/CD changes

Examples:
  feat(exercises): add squat counter with angle detection
  fix(camera): prevent memory leak in pose detection loop
  docs(readme): update setup instructions
  ci(github): add automated deployment workflow
  refactor(auth): extract JWT logic to separate service
```

## Security Best Practices
1. **Never commit secrets** - Use .env files (gitignored) + environment variables
2. **SQL injection prevention** - Use SQLAlchemy ORM (parameterized queries)
3. **XSS prevention** - React escapes by default, validate user input
4. **CSRF protection** - JWT tokens (not cookies), verify origin
5. **Rate limiting** - Prevent brute force attacks on login endpoint
6. **Password hashing** - Use bcrypt with high cost factor (passlib)
7. **HTTPS only** - Enforce SSL in production (Vercel + Railway handle this)
8. **CORS** - Whitelist only production domains
9. **JWT expiry** - Short-lived access tokens (15 min), refresh tokens for renewal
10. **Dependency scanning** - GitHub Dependabot alerts for vulnerabilities

## Performance Optimization Targets
- **Initial Load:** <3s (3G connection)
- **Time to Interactive:** <5s
- **Pose Detection:** 30 FPS (33ms per frame)
- **API Response Time:** <200ms (p95)
- **Database Query Time:** <50ms (p95)
- **Lighthouse Score:** >90 (Performance, Accessibility, Best Practices, SEO)

## Disaster Recovery Plan
1. **Database Backups:** Railway automated daily backups (retain 7 days)
2. **Rollback Strategy:** Vercel/Railway allow instant rollback to previous deployment
3. **Incident Response:**
   - Monitor Sentry for errors
   - Check Railway logs for backend issues
   - Rollback if critical bug detected
   - Post-mortem document lessons learned
4. **Data Loss Prevention:**
   - Regular DB backups
   - Test restore procedure monthly
   - No destructive operations without confirmation

---

## Claude Code Agent Workflow & Best Practices

### Skills Configuration
This project has skills in [.claude/skills/](.claude/skills/) that auto-activate:
- **setup-frontend**: Bootstrap React + Vite + TypeScript (triggers when setting up client)
- **setup-backend**: Bootstrap FastAPI + PostgreSQL (triggers when setting up server)
- **code-review**: Review code quality/security (triggers after implementing features)
- **test-driven-development**: TDD workflow Red-Green-Refactor (triggers when writing tests)
- **git-workflow**: Git operations with conventional commits (triggers on commit/PR tasks)
- **docker-setup**: Docker configuration (triggers when dockerizing)

**Skills activate automatically** - Claude detects when they're needed based on descriptions.

### Effective Development Workflows

#### 1. Explore-Plan-Code-Commit Pattern
```
1. EXPLORE: Use Task tool with Explore agent to understand codebase
   Example: "Use Explore agent to find all authentication-related files"

2. PLAN: Think through approach (use EnterPlanMode for complex features)
   - Consider architecture decisions
   - Identify files to modify
   - Clarify requirements with AskUserQuestion

3. CODE: Implement with TDD (write tests FIRST)
   - Write failing test
   - Write minimal code to pass
   - Refactor

4. REVIEW: Verify code quality (code-review skill activates)

5. COMMIT: Use conventional commits (git-workflow skill activates)
```

#### 2. Test-Driven Development (MANDATORY)
**CRITICAL:** ALWAYS write tests before implementation

```bash
# RED: Write failing test
pnpm test exercise-counter.test.ts  # ❌ Should fail

# GREEN: Write minimal implementation
# ... implement feature ...
pnpm test exercise-counter.test.ts  # ✅ Should pass

# REFACTOR: Improve code quality
# ... extract constants, improve naming ...
pnpm test exercise-counter.test.ts  # ✅ Still passes
```

#### 3. Multi-Agent Parallel Workflows
For complex tasks, run multiple agents in parallel:
- Agent 1: Explore codebase structure
- Agent 2: Implement feature A
- Agent 3: Implement feature B
- Agent 4: Write tests

Use `/clear` between different roles/contexts.

#### 4. Course Correction
- Press **Escape** to interrupt during any phase (context preserved)
- Double-tap **Escape** to edit previous prompts
- Use `/clear` frequently between unrelated tasks

### Using Subagents (Task Tool)

**Available subagent types:**
- **Explore**: Fast codebase exploration ("Where is user authentication?")
- **Plan**: Design implementation strategy for complex features
- **General-purpose**: Multi-step autonomous tasks

**Example usage:**
```
"Use the Explore agent to find all files handling exercise counting logic"
"Use the Plan agent to design the OAuth2 integration architecture"
```

### IMPORTANT: High-Priority Instructions

**ALWAYS:**
- ✅ Follow SOLID principles (SRP, OCP, LSP, ISP, DIP)
- ✅ Write tests BEFORE implementation (TDD)
- ✅ Use TypeScript strict mode (no `any` types)
- ✅ Validate user input (Zod frontend, Pydantic backend)
- ✅ Follow feature-based architecture (organize by domain, not type)
- ✅ Use conventional commits (feat/fix/docs/refactor/test/chore)
- ✅ Run tests before committing

**NEVER:**
- ❌ Commit secrets, API keys, or passwords
- ❌ Use `console.log` in production code
- ❌ Skip writing tests for business logic
- ❌ Push directly to main (always use PR)
- ❌ Use `git push --force` on shared branches
- ❌ Merge PRs without passing CI checks

### Code Quality Standards

**Functions:**
- Keep functions <20 lines ideally
- Single Responsibility Principle
- Clear, descriptive names (no abbreviations like `usr`, `cnt`)

**Testing:**
- Test coverage: >80% for services/logic, >60% overall
- Test behavior, not implementation
- Use Arrange-Act-Assert pattern

**Architecture:**
- Feature-based structure (group by domain: auth, exercises, workouts)
- DRY principle (extract duplicate code to utils)
- YAGNI (only build what's needed for MVP)

### Common Development Commands

**Frontend:**
```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm test             # Run Vitest tests
pnpm test --watch     # Run tests in watch mode
pnpm lint             # ESLint + Prettier
pnpm build            # Production build
pnpm type-check       # TypeScript validation
```

**Backend:**
```bash
uv run uvicorn app.main:app --reload  # Start dev server
uv run pytest                         # Run all tests
uv run pytest --cov                   # Tests with coverage
uv run ruff check .                   # Lint code
uv run mypy app                       # Type checking
uv run alembic upgrade head           # Run migrations
uv run alembic revision --autogenerate -m "message"  # Create migration
```

**Docker:**
```bash
docker-compose up -d              # Start all services
docker-compose logs -f backend    # View backend logs
docker-compose exec backend bash  # Access backend container
docker-compose down -v            # Stop and remove volumes
```

**Git:**
```bash
git status                        # Check status
git diff                          # View changes
git add path/to/file              # Stage files
git commit -m "feat(scope): ..."  # Conventional commit
git push -u origin feature/name   # Push new branch
gh pr create                      # Create pull request
```

### Integration with External Tools

**GitHub CLI (gh):**
- Use for all GitHub operations (issues, PRs, comments)
- Installed and available in environment

**MCP Servers:**
- Connect external tools via `.mcp.json`
- Check into source control for team sharing

### Verification Checklists

**Before Committing:**
- [ ] Tests pass (`pnpm test` or `uv run pytest`)
- [ ] Linting passes
- [ ] No console.log or debugger statements
- [ ] No secrets in code
- [ ] TypeScript compiles without errors
- [ ] Conventional commit format

**Before Creating PR:**
- [ ] All tests pass
- [ ] Code reviewed locally
- [ ] Branch up to date with main
- [ ] Clear PR description with test plan
- [ ] No merge conflicts

**Before Merging to Production:**
- [ ] CI checks pass
- [ ] Code review approved (min 1 reviewer)
- [ ] No security vulnerabilities
- [ ] Tested on staging environment

### Quick Reference

**File Paths (use markdown links in responses):**
```
[src/features/auth/services.ts](src/features/auth/services.ts)
[utils.ts:42](src/utils.ts#L42)
[config.py:10-20](server/app/core/config.py#L10-L20)
```

**Skills Location:** `.claude/skills/`
**Commands Location:** `.claude/commands/` (custom slash commands)
**Settings:** `.claude/settings.json` (checked into Git for team sharing)

---

**Remember:** Let Claude's skills activate automatically - they provide guidance and enforce best practices throughout development.
