# Exercise Buddy - Complete Setup Guide

Complete setup instructions for the Exercise Buddy monorepo with pre-commit hooks.

## Prerequisites

- **Node.js**: 24.x LTS
- **Python**: 3.14.2
- **pnpm**: 10.x
- **uv**: Latest version
- **PostgreSQL**: 18.1
- **Git**: Latest version

## Quick Start

```bash
# 1. Clone the repository (if not already cloned)
git clone <repository-url>
cd exercise-buddy

# 2. Install frontend dependencies
cd client
pnpm install
cd ..

# 3. Install backend dependencies
cd server
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e .
uv pip install -e ".[dev]"
cd ..

# 4. Install pre-commit hooks
# Frontend (already configured via husky)
# Backend
cd server
pre-commit install
cd ..

# 5. Setup environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# Edit .env files with your configuration

# 6. Start development servers
# Terminal 1 - Frontend
cd client && pnpm dev

# Terminal 2 - Backend
cd server && uv run uvicorn app.main:app --reload
```

## Pre-Commit Hooks Setup

### ✅ Already Configured!

Pre-commit hooks are already set up and will run automatically when you commit.

**What's configured:**

**Frontend (lint-staged):**
- ✅ Prettier formatting
- ✅ ESLint with auto-fix
- ✅ Only runs on staged files

**Backend (pre-commit framework):**
- ✅ Ruff format & lint
- ✅ MyPy type checking
- ✅ Bandit security checks
- ✅ YAML/whitespace checks

### How It Works

When you commit:
```bash
git add .
git commit -m "feat(scope): description"

# Automatically runs:
# 📦 Frontend checks (if client files changed)
#   ✔ prettier --write
#   ✔ eslint --fix
# 🐍 Backend checks (if server files changed)
#   ✔ ruff format
#   ✔ ruff check
#   ✔ mypy
#   ✔ bandit
# ✅ All checks passed!
```

### Manual Pre-commit Checks

**Frontend:**
```bash
cd client
pnpm lint-staged
```

**Backend:**
```bash
cd server
pre-commit run --all-files
```

### Bypassing Hooks (Emergency Only)

⚠️ **Use sparingly!**
```bash
git commit --no-verify -m "emergency fix"
```

## Project Structure

```
exercise-buddy/
├── .husky/                      # Git hooks (husky)
│   └── pre-commit              # Pre-commit hook script
├── client/                      # React frontend
│   ├── src/
│   ├── .prettierrc             # Prettier config
│   ├── eslint.config.js        # ESLint config
│   ├── package.json            # Dependencies + lint-staged config
│   └── .env.example
├── server/                      # FastAPI backend
│   ├── app/
│   ├── .pre-commit-config.yaml # Pre-commit hooks config
│   ├── pyproject.toml          # Dependencies + tool config
│   └── .env.example
├── .claude/                     # Claude Code config
│   ├── skills/                 # Auto-activated skills
│   ├── commands/               # Custom slash commands
│   └── guides/                 # Documentation
├── pnpm-workspace.yaml         # pnpm workspace config
└── CLAUDE.md                   # Project guidelines
```

## Development Workflow

### 1. Start Development

```bash
# Terminal 1 - Frontend
cd client
pnpm dev
# Visit: http://localhost:5173

# Terminal 2 - Backend
cd server
source .venv/bin/activate
uv run uvicorn app.main:app --reload
# Visit: http://localhost:8000/docs

# Terminal 3 - Optional Docker
docker-compose up -d
```

### 2. Make Changes

Edit files as needed. Pre-commit hooks will automatically:
- Format code with Prettier/Ruff
- Fix linting issues
- Check types
- Run security scans

### 3. Commit Changes

```bash
git add .
git commit -m "feat(exercises): add push-up counter"
# Hooks run automatically ✅
```

### 4. Push and Create PR

```bash
git push origin feature/my-feature
gh pr create  # or use GitHub UI
```

## Common Commands

### Frontend
```bash
cd client

pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm format           # Format code
pnpm type-check       # TypeScript check
```

### Backend
```bash
cd server
source .venv/bin/activate

uv run uvicorn app.main:app --reload  # Start server
uv run pytest                         # Run tests
uv run ruff check .                   # Lint
uv run ruff format .                  # Format
uv run mypy app                       # Type check
uv run alembic upgrade head           # Run migrations
```

### Pre-commit Hooks
```bash
# Frontend
cd client && pnpm lint-staged

# Backend
cd server && pre-commit run --all-files

# Update hooks
cd server && pre-commit autoupdate
```

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall hooks
cd client
pnpm husky install

cd server
pre-commit install
```

### "Prettier" vs ESLint Conflicts

Ensure `eslint-config-prettier` is installed and last in extends:
```bash
cd client
pnpm add -D eslint-config-prettier
# Check eslint.config.js has prettier config last
```

### Backend Pre-commit Slow

Skip specific hooks locally:
```bash
SKIP=mypy git commit -m "..."
```

### Python Virtual Environment Issues

```bash
cd server
rm -rf .venv
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
pre-commit install
```

## Documentation

- **Architecture**: [exercise-buddy-architecture.md](./exercise-buddy-architecture.md)
- **Project Guidelines**: [CLAUDE.md](./CLAUDE.md)
- **Pre-commit Hooks**: [.claude/guides/pre-commit-hooks.md](./.claude/guides/pre-commit-hooks.md)
- **Claude Code Skills**: [.claude/README.md](./.claude/README.md)

## Next Steps

1. ✅ Server structure created
2. ✅ Pre-commit hooks configured
3. ⏭️  Initialize database
4. ⏭️  Set up OAuth credentials (optional)
5. ⏭️  Start implementing features

## Getting Help

- Check the guides in `.claude/guides/`
- Review skills in `.claude/skills/`
- See examples in the architecture document
- Run `/new-feature` command for new features
- Run `/commit` command for commits

---

**Everything is configured and ready to go! 🎉**
