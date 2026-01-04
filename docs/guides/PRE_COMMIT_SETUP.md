# Pre-commit Hooks Setup - Root Level (Monorepo)

**Based on:** [ADR-012: Root-Level Pre-commit Hooks](../adr/012-root-level-pre-commit-hooks.md)
**Last Updated:** 2026-01-03

---

## Overview

This guide implements root-level pre-commit hooks using Husky + lint-staged for the monorepo structure, following official [Husky documentation](https://typicode.github.io/husky/) guidance.

**Current Status:** ✅ Client created, ✅ Pre-commit hooks configured and tested

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

## Adding Server Hooks (Future)

When the server is ready, simply update root `package.json`:

```json
{
  "scripts": {
    "lint:server": "cd server && uv run ruff check .",
    "format:server": "cd server && uv run ruff format ."
  },
  "lint-staged": {
    "client/**/*.{js,jsx,ts,tsx}": [ /* existing client rules */ ],
    "server/**/*.py": [
      "cd server && uv run ruff format",
      "cd server && uv run ruff check --fix"
    ]
  }
}
```

**No changes needed to `.husky/pre-commit`!** lint-staged will automatically pick up the new patterns.

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
