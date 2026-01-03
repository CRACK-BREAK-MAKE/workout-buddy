# Pre-Commit Hooks Setup Guide

Official Prettier-recommended approach for pre-commit hooks in the Exercise Buddy monorepo.

## Overview

Following [Prettier's official documentation](https://prettier.io/docs/precommit), we use **lint-staged** as the primary tool for pre-commit hooks, which allows us to:
- Run Prettier alongside ESLint and other quality tools
- Support partially staged files (`git add --patch`)
- Only process changed files (fast!)

## Philosophy

As per [Prettier's integration guide](https://prettier.io/docs/integrating-with-linters):
- **Prettier**: Handles code formatting (style)
- **ESLint/Ruff**: Handles code quality (bugs, best practices)
- **Run them separately**, not integrated

❌ **Don't use**: `eslint-plugin-prettier`, `prettier-eslint` (officially not recommended)
✅ **Do use**: `eslint-config-prettier` to disable conflicting rules

## Quick Setup (Recommended)

### Frontend (Client)

```bash
cd client

# Automatically installs husky + lint-staged and configures everything
pnpm dlx mrm@2 lint-staged
```

This single command:
- Installs `husky` and `lint-staged`
- Creates `.husky/pre-commit` hook
- Adds `lint-staged` config to `package.json`

### Backend (Server)

```bash
cd server

# Install pre-commit hooks framework (Python standard)
uv pip install pre-commit

# Create config file (see detailed config below)
# Then install git hooks
pre-commit install
```

## Detailed Configuration

### Frontend: lint-staged Configuration

After running `pnpm dlx mrm@2 lint-staged`, update `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,md,json}": [
      "prettier --write"
    ]
  }
}
```

**Why this order?**
1. **Prettier first**: Formats the code
2. **ESLint with --fix**: Fixes auto-fixable quality issues (without formatting rules)

### ESLint Configuration (Disable Conflicting Rules)

Install `eslint-config-prettier`:

```bash
cd client
pnpm add -D eslint-config-prettier
```

Update `.eslintrc.json` (add `"prettier"` **last**):

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"  // ← MUST be last to override other configs
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
node_modules
dist
build
coverage
*.log
```

### Backend: pre-commit Configuration

Create `.pre-commit-config.yaml`:

```yaml
repos:
  # Ruff - Fast Python linter (replaces Black, isort, Flake8)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.4
    hooks:
      - id: ruff
        args: [--fix]      # Auto-fix issues
      - id: ruff-format     # Format code

  # General checks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict
      - id: detect-private-key

  # Type checking
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.0
    hooks:
      - id: mypy
        args: [--strict, --ignore-missing-imports]
        additional_dependencies:
          - pydantic
          - sqlalchemy
          - fastapi
          - types-python-jose

  # Security checks
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.10
    hooks:
      - id: bandit
        args: ['-c', 'pyproject.toml']
        additional_dependencies: ['bandit[toml]']
```

### Ruff Configuration

In `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py314"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "SIM", # flake8-simplify
]
ignore = ["E501"]  # Line too long (handled by formatter)

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

## Usage

### Automatic (On Commit)

Hooks run automatically when you commit:

```bash
git add .
git commit -m "feat(auth): add login functionality"

# Output:
# ✔ Preparing lint-staged...
# ⚠ Running tasks for staged files...
#   ❯ client/*.{ts,tsx} — 3 files
#     ✔ prettier --write
#     ✔ eslint --fix
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
```

### Manual Run

#### Frontend

```bash
cd client

# Format all files
pnpm prettier --write .

# Then lint
pnpm eslint . --fix

# Or run lint-staged manually
pnpm lint-staged
```

#### Backend

```bash
cd server

# Run all hooks on all files
pre-commit run --all-files

# Run specific hook
pre-commit run ruff --all-files
pre-commit run mypy --all-files

# Run on staged files only
pre-commit run
```

## Package.json Scripts (Frontend)

Add these to `client/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "prepare": "cd .. && husky install client/.husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,md,json}": [
      "prettier --write"
    ]
  }
}
```

## Bypassing Hooks (Emergency Only)

⚠️ **Use sparingly!**

```bash
# Skip hooks
git commit --no-verify -m "emergency fix"

# Better: fix issues properly
pre-commit run --all-files  # Check what's wrong
# Fix the issues
git commit -m "fix: proper commit"
```

## Troubleshooting

### Hooks Not Running

**Frontend:**
```bash
cd client
rm -rf .husky
pnpm dlx mrm@2 lint-staged
```

**Backend:**
```bash
cd server
pre-commit uninstall
pre-commit install
```

### "Prettier" vs ESLint Conflicts

If you see conflicts, ensure:

1. **eslint-config-prettier is installed**:
   ```bash
   pnpm add -D eslint-config-prettier
   ```

2. **"prettier" is LAST in extends**:
   ```json
   {
     "extends": [
       "...",
       "prettier"  // Must be last!
     ]
   }
   ```

3. **Test for conflicts**:
   ```bash
   pnpm dlx eslint-config-prettier path/to/file.ts
   ```

### Slow Hooks

**Frontend:**
- lint-staged only runs on staged files (already optimized)
- Skip tests in pre-commit if too slow
- Consider using `pretty-quick` instead:
  ```bash
  pnpm add -D pretty-quick
  # In package.json: "pre-commit": "pretty-quick --staged"
  ```

**Backend:**
- Use `pre-commit run --files <changed-files>` for specific files
- Skip slow hooks locally:
  ```bash
  SKIP=mypy git commit -m "..."
  ```

### Updating Hooks

**Frontend:**
```bash
cd client
pnpm update husky lint-staged
```

**Backend:**
```bash
cd server
pre-commit autoupdate
```

## CI/CD Integration

Pre-commit hooks are first line of defense. CI runs full checks:

**Frontend CI** (`.github/workflows/ci-frontend.yml`):
```yaml
- name: Check formatting
  run: |
    cd client
    pnpm prettier --check .

- name: Lint
  run: |
    cd client
    pnpm eslint .

- name: Type check
  run: |
    cd client
    pnpm type-check

- name: Test
  run: |
    cd client
    pnpm test
```

**Backend CI** (`.github/workflows/ci-backend.yml`):
```yaml
- name: Run pre-commit hooks
  run: |
    cd server
    pre-commit run --all-files

- name: Test
  run: |
    cd server
    uv run pytest
```

## Best Practices

### DO ✅
- Use lint-staged for frontend (official Prettier recommendation)
- Use pre-commit framework for backend (Python standard)
- Keep Prettier and ESLint separate
- Use `eslint-config-prettier` to disable conflicts
- Run formatters before linters
- Keep hooks fast (<30 seconds)

### DON'T ❌
- Don't use `eslint-plugin-prettier` (not recommended by Prettier)
- Don't use `prettier-eslint` (too slow, not recommended)
- Don't run full test suite in pre-commit (too slow)
- Don't commit without fixing hook failures
- Don't bypass hooks regularly

## Summary

**Frontend Setup:**
```bash
cd client
pnpm dlx mrm@2 lint-staged
pnpm add -D eslint-config-prettier
# Add "prettier" to .eslintrc.json extends (last)
```

**Backend Setup:**
```bash
cd server
uv pip install pre-commit
# Create .pre-commit-config.yaml (see above)
pre-commit install
```

**Commit:**
```bash
git add .
git commit -m "feat(scope): description"
# Hooks run automatically ✅
```

**Manual Check:**
```bash
# Frontend
cd client && pnpm lint-staged

# Backend
cd server && pre-commit run --all-files
```

---

**References:**
- [Prettier Pre-commit Hooks](https://prettier.io/docs/precommit)
- [Prettier Integration with Linters](https://prettier.io/docs/integrating-with-linters)
- [pre-commit framework](https://pre-commit.com/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [pnpm](https://pnpm.io/)
