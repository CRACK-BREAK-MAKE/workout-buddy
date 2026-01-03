# ADR-011: Pre-commit Hooks and Code Quality Automation

**Status:** Accepted

**Date:** 2026-01-03

**Decision Makers:** Technical Lead, DevOps Engineer

## Context and Problem Statement

We need an automated code quality enforcement system that runs before code is committed to prevent bad code from entering the repository. The system must work across both frontend (TypeScript/JavaScript) and backend (Python) in our monorepo structure, with minimal friction for developers while maintaining high code quality standards.

## Decision Drivers

* Prevent common code quality issues from entering the repository
* Enforce consistent code style across team members
* Catch security vulnerabilities early
* Minimize CI/CD pipeline failures by catching issues locally
* Support both JavaScript/TypeScript and Python ecosystems
* Zero configuration overhead for new developers
* Fast execution (<30 seconds for typical commits)
* Follow official best practices from tool maintainers

## Considered Options

1. **Husky + lint-staged (Frontend) + pre-commit framework (Backend)** - Hybrid approach
2. **Husky only** - Single tool for both, but limited Python support
3. **pre-commit framework only** - Python-centric, JavaScript support exists but less mature
4. **Git hooks manually** - Full control but requires manual setup per developer
5. **CI/CD only** - No local checks, rely entirely on pipeline

## Decision

Use **Husky + lint-staged** for frontend checks and **pre-commit framework** for backend checks, orchestrated by a single Husky pre-commit hook that routes to the appropriate toolchain based on changed files.

## Rationale

### Frontend Tooling (Husky + lint-staged)

* **lint-staged** is the industry standard for JavaScript/TypeScript pre-commit hooks
* Runs only on staged files (fast - typically <5 seconds)
* First-class support for ESLint, Prettier, TypeScript
* Excellent pnpm monorepo support
* 14M+ weekly downloads, battle-tested

### Backend Tooling (pre-commit framework)

* **pre-commit** is the Python community standard
* Declarative YAML configuration
* Supports 40+ languages via hooks ecosystem
* Manages hook dependencies and environments automatically
* Used by major Python projects (Django, FastAPI examples, etc.)

### Orchestration Strategy

* **Husky** manages the git hook installation (`.git/hooks/pre-commit`)
* Custom shell script routes to frontend OR backend checks based on `git diff`
* Only runs checks for changed code (if only frontend changed, skip backend checks)
* Installed at root level to coordinate entire monorepo

## Consequences

### Positive

* **Catches issues early**: Developers see problems before pushing
* **Fast feedback loop**: Auto-fixes applied immediately (Prettier, Ruff)
* **Consistent code quality**: All team members use same checks
* **CI/CD optimization**: Fewer pipeline failures from style/lint issues
* **Security improvements**: Detect private keys, security vulnerabilities
* **Best-in-class tools**: Using recommended tools for each ecosystem
* **Smart routing**: Only runs relevant checks (frontend XOR backend)
* **Auto-fix capability**: Prettier, Ruff, ESLint auto-fix 80%+ of issues
* **Type safety**: MyPy strict mode catches type errors pre-commit

### Negative

* **Initial setup complexity**: Requires both Husky and pre-commit framework
* **Two configuration files**: `.husky/pre-commit` and `server/.pre-commit-config.yaml`
* **Learning curve**: Team needs to learn both ecosystems
* **Commit time increase**: Adds 5-15 seconds to commit time (worth it for quality)
* **Bypass temptation**: Developers might use `--no-verify` when in a hurry

### Neutral

* **Root node_modules**: Required for Husky (monorepo coordinator)
* **Virtual environment dependency**: Backend checks require active `.venv`

## Implementation Details

### Frontend Hooks ([client/package.json](../../client/package.json#L55))

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

### Backend Hooks ([server/.pre-commit-config.yaml](../../server/.pre-commit-config.yaml))

1. **pyupgrade** (v3.21.2) - Upgrades Python syntax to 3.13+
2. **Ruff** (v0.14.10) - Fast linter & formatter (replaces Black, isort, Flake8)
3. **General checks** (v6.0.0):
   - YAML/JSON/TOML syntax validation
   - End-of-file fixer
   - Trailing whitespace removal
   - Large file detection (>1MB)
   - Merge conflict detection
   - Private key detection
   - Case conflict detection (cross-platform)
   - Line ending normalization (LF)
4. **codespell** (v2.4.0) - Spelling checker (excludes lockfiles)
5. **MyPy** (v1.19.1) - Type checking with **strict mode**
6. **Bandit** (disabled temporarily) - Security scanner (config issues)

### Routing Logic ([.husky/pre-commit](../../.husky/pre-commit))

```bash
# Get changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Route to frontend checks if client/ changed
if echo "$CHANGED_FILES" | grep -q "^client/"; then
  cd client && pnpm lint-staged
fi

# Route to backend checks if server/ changed
if echo "$CHANGED_FILES" | grep -q "^server/"; then
  BACKEND_FILES=$(echo "$CHANGED_FILES" | grep "^server/" | sed 's|^server/||')
  cd server && source .venv/bin/activate && pre-commit run --files $BACKEND_FILES
fi
```

## Mitigation Strategies

**Risk: Developers bypass hooks**
* **Mitigation**: CI/CD runs same checks - bypass only delays feedback
* **Education**: Document why hooks are important
* **Make fast**: Optimize hook execution time (<15s target)

**Risk: Complex setup for new developers**
* **Mitigation**: `pnpm install` auto-installs hooks (Husky prepare script)
* **Documentation**: Clear setup guide in README
* **Testing script**: [test-hooks.sh](../../test-hooks.sh) verifies setup

**Risk: Hook failures block legitimate commits**
* **Mitigation**: Auto-fix resolves 80%+ of issues automatically
* **Escape hatch**: Document `--no-verify` for emergencies only
* **Clear errors**: Hooks provide actionable error messages

**Risk: Two tooling ecosystems to maintain**
* **Mitigation**: Both are industry standards with long-term support
* **Versions pinned**: Specific versions in config prevent surprises
* **Auto-update**: `pre-commit autoupdate` keeps backend current

## Validation

### Success Criteria

1. **Adoption**: 100% of commits pass hooks (or explicitly bypass with reason)
2. **CI/CD improvement**: <5% of PRs fail CI for style/lint issues (down from ~30%)
3. **Developer satisfaction**: >80% of team agrees hooks improve code quality
4. **Performance**: Hook execution <15 seconds for typical commits
5. **Coverage**: All Python files pass MyPy strict mode
6. **Auto-fix rate**: >80% of hook failures auto-fixed without manual intervention

### Metrics to Track

* Pre-commit hook success rate
* CI/CD pipeline success rate (style/lint-related failures)
* Average commit time increase
* Number of `--no-verify` bypasses
* Developer survey feedback

## Confidence Level

**High** (9/10)

This is a proven industry-standard approach. The hybrid model leverages the best tools for each ecosystem. Risk is low because:
* Both Husky and pre-commit are mature, widely-adopted tools
* Similar setup used successfully by major open-source projects
* Hooks can be disabled if they cause blockers
* Easy to add/remove individual checks incrementally

## Related Decisions

* Related to [ADR-005](005-monorepo-structure.md) - Monorepo structure requires coordinated hooks
* Related to [ADR-002](002-react-vite-frontend.md) - Frontend tooling choices (ESLint, Prettier)
* Related to [ADR-003](003-fastapi-backend.md) - Backend tooling choices (Ruff, MyPy)
* Related to [ADR-010](010-feature-based-structure.md) - Code organization affects what hooks check

## References

### Official Documentation
* [pre-commit.com](https://pre-commit.com/) - Python pre-commit framework
* [pre-commit.com/hooks.html](https://pre-commit.com/hooks.html) - Available hooks catalog
* [Husky documentation](https://typicode.github.io/husky/) - Git hooks manager
* [lint-staged documentation](https://github.com/okonet/lint-staged) - Staged files linter

### Tool-Specific References
* [Ruff documentation](https://docs.astral.sh/ruff/) - Fast Python linter
* [MyPy documentation](https://mypy.readthedocs.io/) - Python type checker
* [ESLint documentation](https://eslint.org/) - JavaScript linter
* [Prettier documentation](https://prettier.io/) - Code formatter

### Implementation
* [server/.pre-commit-config.yaml](../../server/.pre-commit-config.yaml) - Backend hooks configuration
* [server/pyproject.toml](../../server/pyproject.toml) - Tool configurations (Ruff, MyPy, Bandit)
* [client/package.json](../../client/package.json#L55) - Frontend lint-staged configuration
* [.husky/pre-commit](../../.husky/pre-commit) - Orchestration script
* [test-hooks.sh](../../test-hooks.sh) - Hook testing script

### Benchmark Results
* Frontend hooks: ~3-5 seconds (Prettier + ESLint on staged files)
* Backend hooks: ~8-12 seconds (Ruff + MyPy on staged Python files)
* Total for full-stack commit: ~15 seconds (acceptable tradeoff)
