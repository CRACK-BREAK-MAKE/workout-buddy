# Development Guide

**Version:** 1.0
**Last Updated:** 2026-01-03

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | 24 LTS | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 10.x | `npm install -g pnpm` |
| **Python** | 3.14+ | [python.org](https://www.python.org/) |
| **uv** | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| **Docker** | 24+ | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.x | Included with Docker Desktop |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens"
  ]
}
```

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-org/workout-buddy.git
cd workout-buddy
```

### 2. Install Dependencies

**Frontend (Client):**
```bash
cd client
pnpm install  # Installs all npm dependencies
cd ..
```

**Backend (Server):**
```bash
cd server
uv sync --dev  # Creates virtual environment and installs all dependencies
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate  # Windows
cd ..
```

**Root (Git Hooks):**
```bash
pnpm install  # Installs Husky for pre-commit hooks
```

### 3. Configure Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# Edit .env files with your local configuration
```

**Example `.env` (root):**
```bash
COMPOSE_PROJECT_NAME=workout-buddy
```

**Example `client/.env.local`:**
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
```

**Example `server/.env`:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workout_buddy_dev
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]
```

### 4. Start Development Environment

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services:**
* **Frontend:** [http://localhost:5173](http://localhost:5173) (Vite dev server)
* **Backend:** [http://localhost:8000](http://localhost:8000) (FastAPI)
* **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
* **Database:** localhost:5432 (PostgreSQL)

---

## Development Workflow

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes, write tests FIRST (TDD)
# Edit files...

# 3. Run tests
cd client && pnpm test        # Frontend tests
cd server && uv run pytest    # Backend tests

# 4. Run linters
cd client && pnpm lint        # ESLint + Prettier
cd server && uv run ruff check . # Ruff linter

# 5. Commit changes (pre-commit hooks run automatically)
git add .
git commit -m "feat(feature): add new feature"

# 6. Push to remote
git push -u origin feature/your-feature-name

# 7. Create pull request on GitHub
gh pr create  # OR use GitHub web UI
```

### Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation changes
  style:    Code style (formatting, no logic change)
  refactor: Code refactoring
  test:     Add/update tests
  chore:    Maintenance (dependencies, build)

Examples:
  feat(exercises): add squat counter with angle detection
  fix(camera): prevent memory leak in pose detection loop
  docs(readme): update setup instructions
  refactor(auth): extract JWT logic to separate service
```

See [ADR-011: Pre-commit Hooks](../adr/011-pre-commit-hooks-setup.md) for automated quality checks.

---

## Project Structure

### Monorepo Organization

```
workout-buddy/
├── client/                 # React frontend (pnpm)
│   ├── src/
│   │   ├── features/       # Feature-based organization
│   │   │   ├── auth/
│   │   │   ├── exercises/
│   │   │   ├── workouts/
│   │   │   └── statistics/
│   │   ├── shared/         # Shared components/utils
│   │   └── App.tsx
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # FastAPI backend (uv)
│   ├── app/
│   │   ├── features/       # Feature-based organization
│   │   │   ├── auth/
│   │   │   ├── workouts/
│   │   │   └── statistics/
│   │   ├── core/           # Config, security, database
│   │   ├── shared/         # Shared utilities
│   │   └── main.py
│   ├── tests/
│   ├── alembic/            # Database migrations
│   ├── pyproject.toml
│   └── uv.lock
│
├── docs/                   # Documentation
│   ├── adr/                # Architecture Decision Records
│   ├── architecture/       # System architecture docs
│   └── guides/             # Development guides (you are here)
│
├── .husky/                 # Git hooks
├── docker-compose.yml      # Local development
└── README.md
```

See [ADR-010: Feature-Based Structure](../adr/010-feature-based-structure.md) for detailed organization principles.

---

## Common Tasks

### Frontend Development

```bash
cd client

# Start dev server
pnpm dev                    # http://localhost:5173

# Run tests
pnpm test                   # Run all tests
pnpm test --watch           # Watch mode
pnpm test --coverage        # With coverage report

# Linting and formatting
pnpm lint                   # ESLint + Prettier
pnpm lint:fix               # Auto-fix issues
pnpm type-check             # TypeScript validation

# Build for production
pnpm build                  # Output to client/dist
pnpm preview                # Preview production build
```

### Backend Development

```bash
cd server
source .venv/bin/activate  # Activate virtual environment

# Start dev server
uv run uvicorn app.main:app --reload  # http://localhost:8000

# Run tests
uv run pytest                          # All tests
uv run pytest --cov                    # With coverage
uv run pytest tests/test_auth.py       # Specific test file

# Linting and type checking
uv run ruff check .                    # Lint code
uv run ruff format .                   # Format code
uv run mypy app                        # Type checking

# Database migrations
uv run alembic revision --autogenerate -m "add new table"
uv run alembic upgrade head
uv run alembic downgrade -1

# Interactive Python shell
uv run python
```

### Database Management

```bash
# Access PostgreSQL container
docker-compose exec postgres psql -U postgres -d exercise_buddy_dev

# Common SQL commands
\dt                    # List tables
\d users               # Describe users table
SELECT * FROM users;   # Query data

# Backup database
docker-compose exec postgres pg_dump -U postgres exercise_buddy_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres exercise_buddy_dev < backup.sql
```

### Docker Commands

```bash
# Start services
docker-compose up -d            # Detached mode
docker-compose up frontend      # Start specific service

# View logs
docker-compose logs -f          # All services
docker-compose logs -f backend  # Specific service

# Restart services
docker-compose restart backend

# Rebuild after Dockerfile changes
docker-compose build --no-cache
docker-compose up -d

# Clean up
docker-compose down             # Stop services
docker-compose down -v          # Stop + remove volumes
docker system prune -a          # Clean up all Docker resources
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000      # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>      # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Module Not Found Errors

```bash
# Frontend
cd client && pnpm install

# Backend
cd server && uv sync --dev
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
cd server && uv run alembic upgrade head
```

### Pre-commit Hooks Not Running

```bash
# Reinstall hooks
pnpm install

# Manually run pre-commit checks
cd client && pnpm lint-staged
cd server && pre-commit run --all-files

# Bypass hooks (emergency only)
git commit --no-verify -m "emergency fix"
```

### Type Errors in Python

```bash
# Update MyPy cache
cd server
uv run mypy --install-types
uv run mypy app
```

---

## Best Practices

### Code Organization

* **Feature-Based Structure:** Group by business domain, not technical layer
* **Single Responsibility:** Each module/function has one responsibility
* **DRY Principle:** Extract duplicate code to shared utilities
* **YAGNI:** Only build what's needed for MVP, avoid premature optimization

See [ADR-010: Feature-Based Code Organization](../adr/010-feature-based-structure.md).

### Testing

* **Test-Driven Development (TDD):** Write tests FIRST, then implementation
* **Test Coverage:** Aim for >80% for business logic, >60% overall
* **Test Behavior, Not Implementation:** Focus on what, not how
* **Arrange-Act-Assert Pattern:** Structure tests clearly

```typescript
// Good test example
describe('ExerciseCounter', () => {
  it('should increment rep count when angle threshold crossed', () => {
    // Arrange
    const counter = new PushUpCounter();

    // Act
    counter.processAngle(85);  // Below threshold
    counter.processAngle(165); // Above threshold

    // Assert
    expect(counter.reps).toBe(1);
  });
});
```

### Git Workflow

* **Small Commits:** One logical change per commit
* **Descriptive Messages:** Follow conventional commits format
* **Branch Naming:** `feature/`, `fix/`, `hotfix/` prefixes
* **Pull Requests:** Always use PRs, never push directly to main
* **Code Reviews:** At least one approval required

### Performance

* **Lazy Loading:** Use React.lazy() for route-based code splitting
* **Memoization:** Use React.memo() and useMemo() for expensive computations
* **Database Indexes:** Add indexes for frequently queried columns
* **Connection Pooling:** SQLAlchemy connection pool configured

### Security

* **Never Commit Secrets:** Use `.env` files (gitignored)
* **SQL Injection Prevention:** Use ORM (SQLAlchemy parameterized queries)
* **XSS Prevention:** React escapes by default, validate user input
* **CORS Configuration:** Whitelist only production domains
* **JWT Expiry:** Short-lived access tokens (15 minutes)

See [ADR-006: JWT Authentication](../adr/006-jwt-authentication.md) for security details.

---

## Additional Resources

* [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
* [API Documentation](../architecture/API_ENDPOINTS.md)
* [Database Schema](../architecture/DATABASE_SCHEMA.md)
* [Testing Guide](TESTING.md)
* [Deployment Guide](DEPLOYMENT.md)

---

**Questions?** Check [ARCHITECTURE.md](../ARCHITECTURE.md) or open a GitHub Discussion.

**Last Updated:** 2026-01-03
