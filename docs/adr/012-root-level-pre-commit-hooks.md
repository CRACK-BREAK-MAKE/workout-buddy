# ADR-012: Root-Level Pre-commit Hooks for Monorepo

**Status:** Accepted

**Date:** 2026-01-03

**Decision Makers:** Development Team

## Context and Problem Statement

The Workout Buddy project is structured as a monorepo with two distinct packages:
- `client/` - React + TypeScript frontend (Prettier + ESLint)
- `server/` - FastAPI + Python backend (Ruff + MyPy)

How should we configure pre-commit hooks to ensure code quality across both packages while maintaining a clean, maintainable setup? Should hooks be managed at the root level or within individual packages?

## Decision Drivers

* **Consistency** - Same code quality standards should apply across the entire codebase
* **Single Source of Truth** - Avoid duplicating hook configuration in multiple places
* **Developer Experience** - Hooks should work seamlessly in terminal and IDEs (VS Code, IntelliJ)
* **Extensibility** - Easy to add server hooks when backend is implemented
* **Performance** - Only check files that have changed
* **Security** - Follow Husky's security recommendations for monorepos

## Considered Options

### Option 1: Root-Level Husky with lint-staged (Chosen)

Install Husky and lint-staged at the repository root, with glob patterns targeting specific packages.

**Structure:**
```
workout-buddy/
├── .husky/
│   └── pre-commit           # Root-level hook
├── package.json             # Root package.json with husky + lint-staged
├── pnpm-workspace.yaml      # Defines packages
├── client/
│   └── package.json         # NO husky/lint-staged
└── server/
    └── package.json         # NO husky/lint-staged
```

**Configuration:**
```json
// Root package.json
{
  "lint-staged": {
    "client/**/*.{js,jsx,ts,tsx}": [
      "cd client && pnpm exec prettier --write",
      "cd client && pnpm exec eslint --fix"
    ],
    "server/**/*.py": [
      "cd server && uv run ruff format",
      "cd server && uv run ruff check --fix"
    ]
  }
}
```

### Option 2: Separate Husky in Each Package

Install Husky independently in `client/` and `server/`.

**Pros:**
- Each package is self-contained
- No coordination needed between packages

**Cons:**
- Duplicated hook configuration
- Multiple `.husky/` directories to maintain
- Harder to enforce consistent standards
- Husky doesn't install in parent directories for security reasons (official docs)

### Option 3: Client-Only Husky (No Root Config)

Install Husky only in `client/`, leave server without hooks initially.

**Pros:**
- Simple initial setup
- Follows official Husky monorepo guidance for subdirectory setup

**Cons:**
- Eventually need to migrate to Option 1 or 2
- Inconsistent with "monorepo" best practices
- Requires prepare script: `"prepare": "cd .. && husky client/.husky"`
- All hooks need `cd client` prefix

## Decision

**Chosen Option: Option 1 - Root-Level Husky with lint-staged**

We will install Husky and lint-staged at the repository root level and use glob patterns to target specific packages. This follows the principle established in [ADR-005: Monorepo Structure](005-monorepo-structure.md).

**Implementation:**
```bash
# Root installation
pnpm add -D husky lint-staged

# Initialize Husky
pnpm exec husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
EOF
```

**Root package.json:**
```json
{
  "name": "workout-buddy",
  "private": true,
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "client/**/*.{js,jsx,ts,tsx}": [
      "cd client && pnpm exec prettier --write",
      "cd client && pnpm exec eslint --fix --max-warnings 0"
    ],
    "client/**/*.{json,css,md}": [
      "cd client && pnpm exec prettier --write"
    ],
    "server/**/*.py": [
      "cd server && uv run ruff format",
      "cd server && uv run ruff check --fix"
    ]
  }
}
```

## Rationale

### Reason 1: Single Source of Truth
All pre-commit configuration lives in one place (root `package.json`), making it easy to understand and maintain the quality standards for the entire project.

### Reason 2: Follows Husky Official Guidance
While Husky docs don't explicitly recommend root-level for workspaces, the monorepo pattern with directory changes (`cd client &&`) is documented for subdirectory setups. Our approach extends this pattern cleanly.

### Reason 3: Easy Extensibility
When the server is ready, we simply add Python file patterns to the existing `lint-staged` config. No need to create new hooks or configuration files.

### Reason 4: Performance
lint-staged only runs checks on staged files that match the glob patterns, ensuring fast pre-commit checks even as the codebase grows.

### Reason 5: Works with All Git Clients
This approach works seamlessly with:
- ✅ Terminal (`git commit`)
- ✅ VS Code Git UI
- ✅ IntelliJ IDEA Git UI
- ✅ GitHub Desktop
- ✅ Any Git client that respects `.git/hooks`

### Reason 6: Aligns with Monorepo Philosophy
Consistent with [ADR-005: Monorepo Structure](005-monorepo-structure.md), this keeps shared tooling at the root level while allowing packages to maintain their specific configurations (ESLint, Prettier rules).

## Consequences

### Positive

* ✅ **Single configuration file** - All pre-commit rules in root `package.json`
* ✅ **No duplication** - Hooks defined once, apply to entire repo
* ✅ **Easy to extend** - Adding server hooks requires only updating root config
* ✅ **Consistent enforcement** - Same quality standards everywhere
* ✅ **Fast checks** - Only runs on changed files in each package
* ✅ **IDE compatible** - Works in VS Code, IntelliJ, and terminal
* ✅ **Team onboarding** - New developers only need `pnpm install` at root

### Negative

* ⚠️ **Requires root-level pnpm workspace** - Must set up `pnpm-workspace.yaml`
* ⚠️ **Directory changes in commands** - Each lint-staged command needs `cd client` prefix
* ⚠️ **Root node_modules** - Husky and lint-staged live at root, not in packages
* ⚠️ **Learning curve** - Team needs to understand monorepo hook setup

### Neutral

* ℹ️ **Husky at root** - The `.husky/` directory is at root, not in packages
* ℹ️ **One prepare script** - Only root `package.json` has `"prepare": "husky"`
* ℹ️ **Git hooks global** - Hooks apply to entire repo, not per-package

## Mitigation Strategies

### Risk 1: Directory Changes May Fail
**Mitigation:** Always use `cd client && command` pattern. If `cd` fails, the entire command fails, preventing incorrect execution. Test hooks thoroughly after setup.

### Risk 2: Root Dependencies Might Conflict
**Mitigation:** Keep Husky and lint-staged versions pinned. Only update during dedicated maintenance windows. Document versions in this ADR.

### Risk 3: New Team Members May Be Confused
**Mitigation:**
- Document setup in [FRONTEND_SETUP.md](../guides/FRONTEND_SETUP.md)
- Add comments in root `package.json` explaining the structure
- Include verification steps in onboarding checklist
- The `prepare` script runs automatically on `pnpm install`

### Risk 4: IDE May Not Recognize Root Hooks
**Mitigation:**
- Provide IDE-specific setup instructions in documentation
- VS Code: Settings already configured in `.vscode/settings.json`
- IntelliJ: Enable "Run Git hooks" in Version Control settings (enabled by default)

## Validation

How will we know if this decision was correct?

### Success Criteria 1: Hook Execution Rate
**Metric:** 100% of commits should trigger pre-commit hooks
**Validation:** Monitor git logs and developer reports. No commits should bypass quality checks.

### Success Criteria 2: Developer Satisfaction
**Metric:** Zero complaints about hooks not working in IDEs
**Validation:** Survey team after 2 weeks. Hooks should work seamlessly in terminal and all IDEs.

### Success Criteria 3: Setup Time for New Developers
**Metric:** New developer can set up hooks in <5 minutes
**Validation:** Track time during next team member onboarding. Single `pnpm install` should enable all hooks.

### Success Criteria 4: Server Integration
**Metric:** Adding server hooks requires only updating root `package.json`
**Validation:** When server is ready, verify no changes needed to `.husky/` directory or hook scripts.

## Confidence Level

**High (9/10)**

This approach is well-documented in the Husky official docs (monorepo with subdirectory pattern) and aligns with industry best practices for monorepos. The only minor uncertainty is around edge cases with pnpm workspaces, but extensive testing during setup will validate compatibility.

**Why not 10/10?**
- Husky docs don't explicitly show pnpm workspace example
- Requires testing with both VS Code and IntelliJ to confirm IDE compatibility
- Need to verify behavior when server is added

## Related Decisions

* **[ADR-005: Monorepo Structure](005-monorepo-structure.md)** - This follows the monorepo philosophy
* **[ADR-011: Pre-commit Hooks Setup](011-pre-commit-hooks-setup.md)** - Supersedes previous client-only approach
* Related to **[ADR-002: React + Vite Frontend](002-react-vite-frontend.md)** - Frontend tooling
* Related to **[ADR-003: FastAPI Backend](003-fastapi-backend.md)** - Backend tooling (future)

## References

* [Husky Official Documentation - Get Started](https://typicode.github.io/husky/get-started.html)
* [Husky Official Documentation - How To (Monorepos)](https://typicode.github.io/husky/how-to.html)
* [lint-staged Documentation](https://github.com/okonet/lint-staged)
* [Prettier Pre-commit Hooks](https://prettier.io/docs/precommit)
* [pnpm Workspaces Documentation](https://pnpm.io/workspaces)

## Implementation Checklist

When implementing this decision:

- [ ] Create root `package.json` with husky and lint-staged
- [ ] Create `pnpm-workspace.yaml` defining client and server packages
- [ ] Install husky and lint-staged at root: `pnpm add -D husky lint-staged`
- [ ] Initialize Husky: `pnpm exec husky init`
- [ ] Create `.husky/pre-commit` hook with `pnpm exec lint-staged`
- [ ] Configure `lint-staged` in root `package.json` with client patterns
- [ ] Remove husky/lint-staged from `client/package.json` if present
- [ ] Test hook with terminal commit
- [ ] Test hook with VS Code Git UI
- [ ] Test hook with IntelliJ Git UI
- [ ] Document setup in guides
- [ ] Add server patterns when backend is ready (future)

---

**Last Updated:** 2026-01-03
**Next Review:** When server is implemented
