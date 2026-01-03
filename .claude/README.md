# Claude Code Configuration

This directory contains Claude Code configuration, skills, and custom commands for the Exercise Buddy project.

## 📁 Directory Structure

```
.claude/
├── skills/                  # Auto-activated skills
│   ├── client/              # Frontend setup
│   ├── server/              # Backend setup
│   ├── code-review/         # Code quality review
│   ├── test-driven-dev/     # TDD workflow
│   ├── git-workflow/        # Git operations
│   └── docker-setup/        # Docker configuration
├── commands/                # Custom slash commands
│   ├── new-feature.md       # Create new feature with TDD
│   └── commit.md            # Create conventional commit
└── README.md                # This file
```

## 🎯 Skills (Auto-Activated)

Skills are automatically activated by Claude when relevant based on their descriptions.

### `setup-frontend`
**Triggers**: When setting up client folder or initializing frontend
**Does**: Bootstrap React 19 + Vite 7 + TypeScript + pnpm + TailwindCSS 4 + MediaPipe
**Tools**: Bash, Write, Read, Edit

### `setup-backend`
**Triggers**: When setting up server folder or initializing backend
**Does**: Bootstrap FastAPI 0.128 + PostgreSQL 18 + uv + OAuth2 (Google/GitHub/Discord)
**Tools**: Bash, Write, Read, Edit

### `code-review`
**Triggers**: After implementing features, when reviewing code quality
**Does**: Review for SOLID principles, security (OWASP Top 10), performance, testing
**Tools**: Read, Grep, Glob

### `test-driven-development`
**Triggers**: When writing tests or implementing features with TDD
**Does**: Guide through Red-Green-Refactor TDD cycle
**Tools**: Read, Write, Edit, Bash

### `git-workflow`
**Triggers**: When committing, creating PRs, or managing Git operations
**Does**: Conventional commits, branch management, PR creation
**Tools**: Bash, Read

### `docker-setup`
**Triggers**: When dockerizing app or setting up containers
**Does**: Docker configuration for local dev with PostgreSQL, frontend, backend
**Tools**: Write, Read, Edit, Bash

## ⌨️ Custom Commands

Custom slash commands for common workflows.

### `/new-feature <name> <description>`
Create a new feature following:
- Feature-based architecture
- SOLID principles
- TDD methodology (Red-Green-Refactor)
- >80% test coverage
- DRY principle

**Example**: `/new-feature jump-rope-counter "Add jump rope exercise with ankle tracking"`

### `/commit`
Create a conventional commit with:
- Proper type and scope
- Descriptive message
- Claude Code signature

## 🏗️ Architecture Alignment

All skills and commands are aligned with:
- **[exercise-buddy-architecture.md](../../exercise-buddy-architecture.md)**: Complete architecture document
- **[CLAUDE.md](../../CLAUDE.md)**: Project guidelines and Claude Code best practices

### Key Principles

**SOLID Principles**:
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

**Development Principles**:
- **DRY**: Don't Repeat Yourself
- **YAGNI**: You Aren't Gonna Need It
- **TDD**: Test-Driven Development (Red-Green-Refactor)

## 🔄 Development Workflow

### 1. Explore-Plan-Code-Review-Commit Pattern

```
1. EXPLORE  → Use Explore agent to understand codebase
2. PLAN     → Design approach (EnterPlanMode for complex features)
3. CODE     → Implement with TDD (tests FIRST)
4. REVIEW   → Code-review skill activates automatically
5. COMMIT   → Git-workflow skill guides conventional commits
```

### 2. Test-Driven Development (Mandatory)

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

### 3. Feature-Based Structure

**Frontend** (Domain-driven):
```
client/src/features/<feature-name>/
├── components/      # React components
├── hooks/          # Custom hooks
├── services/       # API calls
├── logic/          # Business logic
├── store/          # Zustand state
├── types/          # TypeScript types
└── __tests__/      # Tests colocated
```

**Backend** (Domain-driven):
```
server/app/
├── models/         # SQLAlchemy ORM
├── schemas/        # Pydantic validation
├── api/v1/endpoints/  # FastAPI routes
├── services/       # Business logic
├── repositories/   # Data access
└── tests/          # Unit & integration
```

## 📋 Code Quality Standards

### Functions
- <20 lines (ideal), <50 lines (max)
- Complexity <10 (cyclomatic)
- Single Responsibility Principle

### Testing
- **Services/Logic**: >90% coverage
- **API Endpoints**: >80% coverage
- **Components**: >70% coverage
- **Overall**: >60% coverage

### Naming Conventions
- **Frontend**: camelCase (variables), PascalCase (components)
- **Backend**: snake_case (variables), PascalCase (classes)
- **Constants**: SCREAMING_SNAKE_CASE
- **Files**: kebab-case or camelCase

### Conventional Commits
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci
Scopes: auth, exercises, camera, workouts, statistics, api, ui, db
```

## 🔒 Security Checklist

**ALWAYS**:
- ✅ Follow SOLID principles
- ✅ Write tests BEFORE implementation (TDD)
- ✅ Use TypeScript strict mode (no `any` types)
- ✅ Validate user input (Zod frontend, Pydantic backend)
- ✅ Run tests before committing

**NEVER**:
- ❌ Commit secrets, API keys, or passwords
- ❌ Use `console.log` in production code
- ❌ Skip writing tests for business logic
- ❌ Push directly to main (always use PR)
- ❌ Use `git push --force` on shared branches

## 🚀 Quick Start

### Initial Setup
```bash
# 1. Frontend setup (triggers setup-frontend skill)
"Set up the frontend with React, Vite, and TypeScript"

# 2. Backend setup (triggers setup-backend skill)
"Set up the backend with FastAPI, PostgreSQL, and uv"

# 3. Docker setup (triggers docker-setup skill)
"Set up Docker containers for local development"
```

### Development
```bash
# Start services
docker-compose up -d

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Creating Features
```bash
# Use the new-feature command
/new-feature camera "Implement camera access and MediaPipe pose detection"

# Or just describe what you want
"Create a new exercise counter for squats with hip-knee-ankle angle detection"
```

### Committing Changes
```bash
# Use the commit command
/commit

# Or describe what you want
"Create a commit for the camera feature"
```

## 📚 Documentation

- **Architecture**: [exercise-buddy-architecture.md](../../exercise-buddy-architecture.md)
- **Project Guidelines**: [CLAUDE.md](../../CLAUDE.md)
- **Pre-commit Hooks Setup**: [guides/pre-commit-hooks.md](guides/pre-commit-hooks.md)
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Claude Code Docs**: https://code.claude.com/docs
- **Prettier Pre-commit**: https://prettier.io/docs/precommit
- **Prettier + Linters**: https://prettier.io/docs/integrating-with-linters

## 🤝 How Skills Work

1. **Discovery**: At startup, Claude loads skill names and descriptions
2. **Activation**: When your request matches a skill's description, Claude activates it
3. **Execution**: Claude follows the skill's instructions

**You don't need to explicitly call skills** - they activate automatically!

## 💡 Tips

1. **Let Skills Activate Automatically**: Just describe what you want, skills will activate when relevant
2. **Use TDD**: Always write tests before implementation
3. **Follow Architecture**: Refer to architecture document for feature structure
4. **Keep It Simple**: YAGNI - only build what's needed for MVP
5. **Review Before Commit**: Run tests and linting before committing

## 🛠️ Common Commands

### Frontend
```bash
pnpm dev              # Start dev server
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm build            # Production build
```

### Backend
```bash
uv run uvicorn app.main:app --reload  # Start dev server
uv run pytest                         # Run tests
uv run ruff check .                   # Lint code
uv run alembic upgrade head           # Run migrations
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f backend    # View logs
docker-compose down -v            # Stop and remove volumes
```

---

**Remember**: Claude Code is designed to help you build effectively using agents. Trust the skills, follow TDD, and maintain code quality!
