# Pre-commit Hooks Setup - Root Level (Monorepo)

**Based on:** [ADR-012: Root-Level Pre-commit Hooks](../adr/012-root-level-pre-commit-hooks.md)
**Last Updated:** 2026-01-04

---

## Overview

This guide implements root-level pre-commit hooks using Husky + lint-staged (client) and pre-commit framework (server) for the monorepo structure.

**Current Status:** ✅ Client setup complete, ✅ Server setup complete, ✅ Production-ready

---

## Key Fixes Applied (Production-Ready)

During implementation, we discovered and fixed several critical issues:

### 1. Build & Environment Issue
**Problem:** `uv sync` failed trying to build API as a distributable library.

**Fix:** Added `package = false` to `server/pyproject.toml` - tells uv this is an application, not a package.

### 2. Pre-commit Pathing (Exit Code 2 Errors)
**Problem:** Tools (Ruff, MyPy) failed looking for pyproject.toml in wrong directory.

**Fix:**
- Updated Husky script to `cd server` before running
- Used `uv run pre-commit` for auto-detection
- Removed hardcoded `--config` flags to allow auto-discovery

### 3. Vercel Deployment (ERR_INVALID_THIS)
**Problem:** Node 24 + pnpm 10 fetch bug crashed Vercel builds.

**Fix:** Pinned to Node 22 LTS + pnpm 9, added `.npmrc` with:
```ini
network-concurrency=1
node-linker=hoisted
```

### 4. Monorepo Lockfile Strategy
**Problem:** Missing root lockfile prevented Vercel workspace detection.

**Fix:** Created root-level `pnpm-lock.yaml`, removed from `.gitignore`, committed it.

### 5. Security & Enterprise Hardening
**Problem:** Security checks were skipped or not strict enough.

**Fix:**
- Unified security under Ruff (S rules) - 100x faster than Bandit
- Added `pip-audit` for vulnerable dependencies (CVEs)
- Added `detect-secrets` with baseline to prevent committing secrets

### 6. Script Reliability
**Problem:** Manual `source .venv/bin/activate` is brittle.

**Fix:** Switched to `uv run` which handles virtualenv automatically.

---

---

## Step 1: Create Root Package.json

Navigate to the repository root and create `package.json`:

```bash
cd /Users/I504180/workspace/personal/ai/workout-buddy

cat > package.json << 'EOF'
{
  "name": "workout-buddy",
  "version": "1.0.0",
  "private": true,
  "description": "AI-powered exercise counting app",
  "scripts": {
    "prepare": "husky",
    "dev:client": "cd client && pnpm dev",
    "build:client": "cd client && pnpm build",
    "test:client": "cd client && pnpm test:run",
    "lint:client": "cd client && pnpm lint",
    "format:client": "cd client && pnpm format",
    "type-check:client": "cd client && pnpm type-check"
  },
  "devDependencies": {},
  "lint-staged": {
    "client/**/*.{js,jsx,ts,tsx}": [
      "pnpm --filter client exec prettier --write",
      "pnpm --filter client exec eslint --fix --max-warnings 0"
    ],
    "client/**/*.{json,css,md}": [
      "pnpm --filter client exec prettier --write"
    ]
  }
}
EOF
```

**Key points:**
- `"prepare": "husky"` - Runs automatically on `pnpm install` (Husky v9+ simplified syntax)
- `lint-staged` uses glob patterns `client/**/*` to target only client files
- **IMPORTANT:** Commands use `pnpm --filter client exec ...` to leverage workspace configuration (NOT `cd client &&`)
- This ensures pnpm correctly resolves dependencies from the client workspace

---

## Step 2: Create pnpm Workspace Configuration

Create `pnpm-workspace.yaml`:

```bash
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'client'
  - 'server'
EOF
```

This tells pnpm that `client/` and `server/` are separate packages in the workspace.

---

## Step 3: Install Husky and lint-staged at Root

```bash
# Install at root level (requires -w flag for workspace root)
pnpm add -D -w husky@latest lint-staged@latest

# Verify installation
pnpm list --depth=0
# Should show husky and lint-staged
```

**Note:** The `-w` flag is required to install packages at the workspace root level.

---

## Step 4: Initialize Husky

Following [official Husky guide](https://typicode.github.io/husky/get-started.html):

```bash
# Initialize Husky (creates .husky/ directory and pre-commit hook)
pnpm exec husky init
```

**What this does:**
- Creates `.husky/` directory at root
- Creates `.husky/pre-commit` with test script
- Adds `"prepare": "husky"` to package.json (we already have this)

---

## Step 5: Configure Pre-commit Hook

Replace the test script in `.husky/pre-commit` with lint-staged:

```bash
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
EOF

# Make executable (should already be executable, but just in case)
chmod +x .husky/pre-commit
```

**How it works:**
1. Husky triggers this hook on every commit
2. `lint-staged` reads config from root `package.json`
3. Runs Prettier + ESLint only on staged client files

---

## Step 6: Update Client Package.json (Remove Duplicate Config)

If `client/package.json` has `husky` or `lint-staged`:

```bash
cd client

# Edit package.json and REMOVE these sections:
# 1. Remove "husky" from devDependencies
# 2. Remove "lint-staged" from devDependencies
# 3. Remove entire "lint-staged": {...} config object
# 4. Remove "prepare": "husky install" script if present

# Keep all other scripts (dev, build, lint, format, etc.)
```

**Client package.json should look like:**
```json
{
  "name": "workout-buddy-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest"
  },
  "dependencies": { /* ... */ },
  "devDependencies": {
    /* NO husky or lint-staged here! */
  }
}
```

---

## Step 7: Reinstall Dependencies

```bash
# Go back to root
cd /Users/I504180/workspace/personal/ai/workout-buddy

# Install all dependencies (runs prepare script automatically)
pnpm install

# Verify Husky is set up
ls -la .husky/
# Should see: _/, pre-commit
```

---

## Step 8: Test Pre-commit Hook

### Test 1: Create Poorly Formatted File

```bash
# Create test file with bad formatting and linting issues
cat > client/src/test-hook.ts << 'EOF'
const bad={foo:"bar"}
console.log(bad)
const x:any="fail"
EOF

# Stage the file
git add client/src/test-hook.ts

# Try to commit
git commit -m "test: verify pre-commit hook"
```

**Expected result:**
- ✅ Prettier auto-formats the code
- ❌ ESLint fails because of `any` type
- ❌ Commit is blocked

Output should look like:
```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✖ client/**/*.{js,jsx,ts,tsx}:
  ✖ cd client && pnpm exec eslint --fix --max-warnings 0
    client/src/test-hook.ts:3:9: error - Type 'any' is not allowed
✖ lint-staged failed
```

### Test 2: Fix and Commit

```bash
# Fix the file (remove 'any')
cat > client/src/test-hook.ts << 'EOF'
const bad = { foo: 'bar' };
console.log(bad);
const x: string = 'pass';
EOF

# Stage and commit again
git add client/src/test-hook.ts
git commit -m "test: verify pre-commit hook passes"
```

**Expected result:**
- ✅ Prettier formats (if needed)
- ✅ ESLint passes
- ✅ Commit succeeds

### Test 3: Clean Up

```bash
# Remove test file
rm client/src/test-hook.ts
git add client/src/test-hook.ts
git commit -m "chore: remove test file"
```

---

## Step 9: Configure and Test IDEs

### VS Code Configuration

**IMPORTANT:** VS Code must be configured to run Git hooks. By default, VS Code should run hooks, but if they're not running:

1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "git hooks"
3. Ensure **"Git: Enable Commit Signing"** is not interfering
4. Verify **"Git: Enabled"** is checked

**Testing in VS Code:**

1. Open VS Code in the repository root
2. Create a test file with intentional errors:
   ```typescript
   // client/src/test-vscode.ts
   const bad: any = 'test';
   ```
3. Use VS Code Git UI to stage the file
4. Try to commit with message "test: vscode hook"
5. **Expected Result:** Commit should FAIL with ESLint errors ❌
6. Fix the file (remove `any` type) and commit again
7. **Expected Result:** Commit should SUCCEED ✅

**If hooks don't run in VS Code:**
- Restart VS Code after installing Husky
- Check that you opened VS Code in the repository root (not a subdirectory)
- Verify `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`
- Try committing from terminal first to verify hooks work

### IntelliJ IDEA Configuration

**IMPORTANT:** IntelliJ must be configured to run Git hooks.

1. Open IntelliJ IDEA Settings (Cmd/Ctrl + ,)
2. Navigate to: **Version Control → Commit**
3. **Enable:** "Run Git hooks" checkbox
4. **Enable:** "Analyze code" (optional, for additional checks)
5. Click **Apply** and **OK**

**Testing in IntelliJ:**

1. Open IntelliJ in the repository root
2. Create a test file with intentional errors:
   ```typescript
   // client/src/test-intellij.ts
   const bad: any = 'test';
   ```
3. Right-click → Git → Commit (or use Cmd/Ctrl + K)
4. Stage the test file
5. Enter commit message "test: intellij hook"
6. Click "Commit"
7. **Expected Result:** Commit should FAIL with ESLint errors ❌
8. IntelliJ may show a dialog: "Git Hooks Failed" - this is correct!
9. Fix the file (remove `any` type) and commit again
10. **Expected Result:** Commit should SUCCEED ✅

**IntelliJ-Specific Notes:**
- First commit may prompt "Run Git hooks?" - select "Yes" and check "Remember my choice"
- If hooks still don't run, restart IntelliJ after installing Husky
- Ensure IntelliJ's built-in terminal uses the correct Node.js version
- Check IntelliJ's Event Log (bottom-right) for hook execution details

### Verification Checklist

After testing both IDEs:

- [ ] ✅ VS Code blocks commits with linting errors
- [ ] ✅ VS Code allows commits with clean code
- [ ] ✅ IntelliJ blocks commits with linting errors
- [ ] ✅ IntelliJ allows commits with clean code
- [ ] ✅ Terminal commits work correctly
- [ ] ✅ Hooks run automatically in all environments

---

## Step 10: Update .gitignore (Root Level)

Ensure Husky's internal directory is NOT ignored:

```bash
cd /Users/I504180/workspace/personal/ai/workout-buddy

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/
pnpm-lock.yaml

# Environment
.env
.env*.local

# Build outputs
dist/
build/
.vite/

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/*
!.idea/vcs.xml
!.idea/modules.xml
*.iml
.DS_Store

# Logs
*.log

# Python (for server later)
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
.venv/
venv/

# IMPORTANT: .husky/_/ should NOT be ignored
# It contains Husky scripts needed by all developers
EOF
```

---

## Folder Structure After Setup

```
workout-buddy/
├── .husky/
│   ├── _/                    # Husky internal scripts (committed to Git)
│   └── pre-commit            # Pre-commit hook (committed to Git)
├── client/
│   ├── src/
│   ├── package.json          # NO husky/lint-staged in devDependencies
│   └── ...
├── .gitignore                # Root gitignore
├── package.json              # Root package.json (WITH husky/lint-staged)
├── pnpm-workspace.yaml       # Workspace definition
└── pnpm-lock.yaml            # Root lockfile
```

---

## How It Works

```
Developer runs: git commit -m "feat: add feature"
         ↓
   Git triggers .husky/pre-commit
         ↓
   Hook runs: pnpm exec lint-staged
         ↓
   lint-staged reads config from root package.json
         ↓
   ┌─────────────────────────────────────────┐
   │  For client/**/*.{ts,tsx,js,jsx}:       │
   │  1. cd client && pnpm exec prettier     │
   │  2. cd client && pnpm exec eslint --fix │
   └─────────────────────────────────────────┘
         ↓
   If all pass:
   - Files are automatically re-staged
   - Commit proceeds ✅
         ↓
   If any fail:
   - Commit is blocked ❌
   - Developer must fix issues
```

**Works in:**
- ✅ Terminal (`git commit`)
- ✅ VS Code Git UI
- ✅ IntelliJ IDEA Git UI
- ✅ GitHub Desktop
- ✅ Any Git client

---

## Adding Server Hooks

### Step 1: Install Server Dependencies

```bash
cd server

# Install dev dependencies with uv (includes pre-commit, ruff, mypy, etc.)
uv sync --group dev

# Verify pre-commit is installed
uv run pre-commit --version
```

### Step 2: Create Server Pre-commit Configuration

Create `server/.pre-commit-config.yaml`:

```yaml
default_language_version:
  python: python3.13

repos:
  # Pre-commit built-in hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-toml
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict
      - id: debug-statements

  # detect-secrets - Find hardcoded API keys/passwords
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package.json|pnpm-lock.yaml

  # Ruff - Fast Python linter and formatter
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.1
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  # MyPy - Static type checker
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks:
      - id: mypy
        additional_dependencies:
          - pydantic>=2.10.0
          - sqlalchemy>=2.0.0
          - types-PyYAML
        exclude: ^tests/

  # pip-audit - Check for vulnerable dependencies (CVEs)
  - repo: https://github.com/pypa/pip-audit
    rev: v2.7.3
    hooks:
      - id: pip-audit
        args: ["--requirement", "pyproject.toml"]
```

**Key features:**
- **Ruff** replaces Black, isort, flake8, pyupgrade (10-100x faster)
- **Ruff S rules** for security checks (replaces Bandit for better performance)
- **detect-secrets** prevents committing API keys/passwords
- **pip-audit** catches vulnerable dependencies (CVEs)
- **MyPy** for type safety

### Step 3: Initialize detect-secrets Baseline

```bash
cd server

# Create baseline file (tracks known secrets like example API keys)
uv run detect-secrets scan --baseline .secrets.baseline

# Commit the baseline
git add .secrets.baseline
```

### Step 4: Update Server pyproject.toml

Ensure your `server/pyproject.toml` has proper configuration:

```toml
[project]
name = "workout-buddy-api"
requires-python = ">=3.13"
package = false  # CRITICAL: Stops uv from trying to build as library

dependencies = [
  "fastapi>=0.128.0",
  # ... other production deps
]

[dependency-groups]
dev = [
  "pytest>=8.3.0",
  "ruff>=0.9.1",
  "mypy>=1.14.0",
  "pre-commit>=4.5.0",
  "pip-audit>=2.7.3",
  "detect-secrets>=1.5.0",
]

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
# Includes security checks (S rules)
select = ["E", "F", "I", "N", "W", "UP", "B", "A", "S"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.13"
strict = true
disallow_untyped_defs = true
```

**Critical fixes:**
- `package = false` - Prevents uv from trying to build your app as a library
- `[dependency-groups]` instead of `[project.optional-dependencies]` for uv
- Ruff S rules for security (replaces Bandit)

### Step 5: Update .husky/pre-commit Hook

Update `.husky/pre-commit` to run both client and server checks:

```bash
cat > .husky/pre-commit << 'EOF'
echo "🔍 Running client pre-commit checks..."
pnpm exec lint-staged
CLIENT_EXIT=$?

echo ""
echo "🐍 Running server pre-commit checks..."

# Identify staged python files in the server directory
PYTHON_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '^server/.*\.py$' || true)

if [ -n "$PYTHON_FILES" ]; then
  # Strip 'server/' prefix for local execution
  PYTHON_FILES_RELATIVE=$(echo "$PYTHON_FILES" | sed 's|^server/||')

  cd server
  # Use 'uv run' to ensure the environment is always correct and activated
  echo "$PYTHON_FILES_RELATIVE" | xargs uv run pre-commit run --files
  SERVER_EXIT=$?
  cd ..
else
  echo "  → No Python files staged, skipping server checks"
  SERVER_EXIT=0
fi

if [ $CLIENT_EXIT -ne 0 ] || [ $SERVER_EXIT -ne 0 ]; then
  echo "❌ Pre-commit checks failed!"
  exit 1
fi

echo "✅ All checks passed!"
EOF
```

**Key improvements:**
- Uses `uv run pre-commit` instead of manual `source .venv/bin/activate`
- Automatically handles virtualenv detection and activation
- Only runs server checks if Python files are staged (faster)
- Strips `server/` prefix from file paths for correct tool resolution

### Step 6: Update Root package.json

Add server scripts to root `package.json`:

```json
{
  "scripts": {
    "dev:server": "cd server && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 7001",
    "test:server": "cd server && source .venv/bin/activate && pytest",
    "lint:server": "cd server && source .venv/bin/activate && ruff check .",
    "format:server": "cd server && source .venv/bin/activate && ruff format .",
    "type-check:server": "cd server && source .venv/bin/activate && mypy app",
    "precommit:server": "cd server && source .venv/bin/activate && pre-commit run --all-files"
  }
}
```

### Step 7: Test Server Hooks

```bash
# Create test file with security issues
cat > server/app/test_security.py << 'EOF'
import os

PASSWORD = "hardcoded_secret_123"

def dangerous_function():
    os.system("rm -rf /")  # Ruff S605: shell injection
EOF

# Stage and try to commit
git add server/app/test_security.py
git commit -m "test: server hooks"
```

**Expected results:**
- ✅ Ruff auto-fixes formatting
- ❌ detect-secrets flags hardcoded password → **commit blocked**
- ❌ Ruff flags dangerous os.system (S605) → **commit blocked**

**Clean up:**
```bash
git reset HEAD server/app/test_security.py
rm server/app/test_security.py
```

---

## Common Commands (From Root)

```bash
# Development
pnpm dev:client              # Start client dev server
pnpm dev:server              # Start server (when ready)

# Build
pnpm build:client            # Build client

# Testing
pnpm test:client             # Run client tests

# Code Quality
pnpm lint:client             # Lint client
pnpm format:client           # Format client
pnpm type-check:client       # TypeScript check

# Committing (from anywhere in repo)
git add .
git commit -m "feat(client): add feature"
# Pre-commit runs automatically
```

---

## Critical Lessons Learned (IMPORTANT!)

During setup, we discovered several critical configuration issues that must be addressed:

### Issue 1: pnpm Workspace Configuration

**Problem:** Initially used `'client/*'` in pnpm-workspace.yaml, which looks for packages INSIDE client directory.

**Solution:** Use `'client'` to designate client folder itself as the package:

```yaml
# ❌ WRONG - looks for packages inside client/
packages:
  - 'client/*'

# ✅ CORRECT - client folder is the package
packages:
  - 'client'
  - 'server'
```

**Why it matters:** If workspace configuration is wrong, `pnpm --filter client` won't find the package and hooks will silently pass without running linters.

### Issue 2: lint-staged Command Syntax

**Problem:** Initially used `cd client && pnpm exec prettier` which doesn't properly leverage workspace configuration.

**Solution:** Use workspace-aware commands with `pnpm --filter`:

```json
// ❌ WRONG - manual directory changes
"lint-staged": {
  "client/**/*.{js,jsx,ts,tsx}": [
    "cd client && pnpm exec prettier --write",
    "cd client && pnpm exec eslint --fix"
  ]
}

// ✅ CORRECT - workspace-aware filtering
"lint-staged": {
  "client/**/*.{js,jsx,ts,tsx}": [
    "pnpm --filter client exec prettier --write",
    "pnpm --filter client exec eslint --fix --max-warnings 0"
  ]
}
```

**Why it matters:**
- `pnpm --filter` ensures correct dependency resolution from workspace
- Works with pnpm-workspace.yaml configuration
- More maintainable and scalable for monorepos

### Issue 3: Git Repository Initialization

**Problem:** Husky requires an initialized Git repository.

**Solution:** Run `git init` before `pnpm exec husky init`.

**Why it matters:** Husky hooks are stored in `.git/hooks/` - without Git, setup fails.

### Issue 4: Root Installation Requires -w Flag

**Problem:** pnpm requires explicit flag to install at workspace root.

**Solution:** Use `-w` flag when installing at root:

```bash
# ✅ CORRECT
pnpm add -D -w husky@latest lint-staged@latest
```

**Why it matters:** Without `-w`, pnpm will error with workspace-root-check violation.

### Verification Steps

After setup, ALWAYS verify:

1. **Workspace recognition:**
   ```bash
   pnpm --filter client list
   # Should show client package with dependencies
   ```

2. **lint-staged execution:**
   ```bash
   # Create test file with error
   echo "const bad: any = 'test';" > client/src/test.ts

   # Run lint-staged
   git add client/src/test.ts
   pnpm exec lint-staged

   # Should FAIL with ESLint error
   ```

3. **Pre-commit hook:**
   ```bash
   git commit -m "test"
   # Should FAIL due to linting errors
   ```

4. **Clean up test:**
   ```bash
   rm client/src/test.ts
   ```

---

## Troubleshooting

### Server: "ModuleNotFoundError" or "Build Failed"

**Problem:** `uv sync` fails with "ModuleNotFoundError" or tries to build your app as a library.

**Solution:** Add `package = false` to `server/pyproject.toml`:

```toml
[project]
name = "workout-buddy-api"
package = false  # CRITICAL: Stops uv from building as library
```

### Server: "Could not read config file: pyproject.toml"

**Problem:** Pre-commit tools (Ruff, Bandit) can't find pyproject.toml.

**Root cause:** Running from wrong directory or hardcoded paths in pre-commit config.

**Solution:**
1. Husky hook must `cd server` before running tools
2. Remove `--config` or `-c` flags from `.pre-commit-config.yaml` - let tools auto-discover config
3. Use `uv run pre-commit` instead of manual virtualenv activation

### Server: Pre-commit hooks are slow

**Problem:** First-time runs install environments (MyPy, pip-audit take 1-2 minutes).

**Solution:**
- First run is slow (installs Python environments)
- Subsequent runs are fast (environments cached in `~/.cache/pre-commit/`)
- To speed up: Remove slow hooks like `pip-audit` during active development, add back before PR

### Vercel Deployment: "ERR_INVALID_THIS" or Fetch Errors

**Problem:** Vercel builds fail with low-level fetch errors during `pnpm install`.

**Root cause:** Bug in Node 24 + pnpm 10 combination.

**Solution:** Pin to Node 22 LTS + pnpm 9 in `vercel.json` and `.npmrc`:

```json
// vercel.json
{
  "buildCommand": "pnpm --version && pnpm build:client",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "outputDirectory": "client/dist"
}
```

```ini
# .npmrc
network-concurrency=1
node-linker=hoisted
```

### Missing Root Lockfile (Vercel Detection Issues)

**Problem:** Vercel can't detect pnpm workspace properly.

**Solution:**
1. Create root-level `pnpm-lock.yaml` (not nested in client/)
2. Remove `pnpm-lock.yaml` from `.gitignore`
3. Commit root lockfile:
   ```bash
   pnpm install  # Generates root lockfile
   git add pnpm-lock.yaml
   git commit -m "chore: add root lockfile for vercel"
   ```

### Hook not running

```bash
# Ensure hook is executable
chmod +x .husky/pre-commit

# Reinstall Husky
rm -rf .husky
pnpm exec husky init

# Verify prepare script ran
pnpm run prepare
```

### lint-staged not finding files

```bash
# Verify glob patterns in root package.json
# Should be: "client/**/*.ts" (NOT "**/*.ts")
```

### pnpm commands fail

```bash
# Ensure you installed at root
cd /Users/I504180/workspace/personal/ai/workout-buddy
pnpm list husky lint-staged
# Should show both installed at root
```

### IDE not triggering hook

**VS Code:**
- Restart VS Code after installing Husky
- Check Git is enabled in settings

**IntelliJ:**
- Settings → Version Control → Commit
- Ensure "Run Git hooks" is checked
- Restart IDE if needed

---

## Verification Checklist

After setup, verify:

- [ ] ✅ Root `package.json` has `husky` and `lint-staged` in `devDependencies`
- [ ] ✅ Root `package.json` has `"prepare": "husky"` script
- [ ] ✅ Root `package.json` has `lint-staged` config with `client/**/*` patterns
- [ ] ✅ `.husky/pre-commit` file exists and is executable
- [ ] ✅ `.husky/_/` directory exists (Husky internals)
- [ ] ✅ `pnpm-workspace.yaml` defines client and server workspaces
- [ ] ✅ Client `package.json` does NOT have `husky` or `lint-staged`
- [ ] ✅ Test file with errors blocks commit
- [ ] ✅ Test file without errors allows commit
- [ ] ✅ Hook works in terminal
- [ ] ✅ Hook works in VS Code
- [ ] ✅ Hook works in IntelliJ IDEA

---

## Benefits of This Setup

✅ **Single source of truth** - All hook config at root
✅ **Easy to extend** - Add server patterns when ready
✅ **No duplication** - One set of hooks for entire repo
✅ **Consistent** - Same standards everywhere
✅ **Fast** - Only checks changed files
✅ **Works everywhere** - Terminal + all IDEs
✅ **Automatic setup** - `pnpm install` enables hooks

---

## References

- **ADR:** [ADR-012: Root-Level Pre-commit Hooks](../adr/012-root-level-pre-commit-hooks.md)
- **Husky:** [Get Started](https://typicode.github.io/husky/get-started.html)
- **Husky:** [How To (Monorepos)](https://typicode.github.io/husky/how-to.html)
- **lint-staged:** [GitHub](https://github.com/okonet/lint-staged)
- **Prettier:** [Pre-commit Hooks](https://prettier.io/docs/precommit)

---

**Your monorepo pre-commit setup is ready! 🎉**

Next: Follow [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) to complete client configuration.
