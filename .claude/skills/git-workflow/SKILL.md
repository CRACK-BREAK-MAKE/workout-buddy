---
name: git-workflow
description: Handle Git operations following conventional commits, feature branching, and proper commit messages. Use when user asks to commit, create PR, or manage Git workflow.
allowed-tools: Bash, Read
---

# Git Workflow Skill

Manage Git operations following project standards and best practices.

## Branch Strategy

```
main              → Production (protected, requires PR + reviews)
feature/name      → New features
fix/name          → Bug fixes
hotfix/name       → Emergency production fixes
refactor/name     → Code improvements
```

## Conventional Commits Format

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

### Types
- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc. (no code change)
- **refactor**: Code restructuring (no behavior change)
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **chore**: Maintenance tasks (dependencies, build config)
- **ci**: CI/CD pipeline changes

### Scopes (Project-Specific)
- **auth**: Authentication/authorization
- **exercises**: Exercise counting logic
- **camera**: Camera/MediaPipe integration
- **workouts**: Workout tracking
- **statistics**: Statistics/dashboard
- **api**: Backend API
- **ui**: UI components
- **db**: Database changes

### Examples
```bash
# Good commits
feat(exercises): add push-up counter with angle detection
fix(camera): prevent memory leak in pose detection loop
docs(readme): update setup instructions
refactor(auth): extract JWT logic to separate service
test(workouts): add integration tests for workout creation
chore(deps): upgrade React to 19.2.3
perf(exercises): optimize pose detection to 30 FPS
ci(github): add automated deployment workflow

# Bad commits (avoid)
update stuff
fixed bug
WIP
asdfasdf
final version (really)
```

## Commit Workflow

### 1. Check Status
```bash
git status
git diff
```

### 2. Stage Changes
```bash
# Stage specific files
git add path/to/file.ts

# Stage all files in a feature
git add client/src/features/exercises/

# Interactive staging (review each change)
git add -p
```

### 3. Create Commit
```bash
# Write commit message with heredoc for proper formatting
git commit -m "$(cat <<'EOF'
feat(exercises): add jump rope counter with ankle tracking

- Track ankle height relative to hip position
- Detect jump when ankles rise above threshold
- Count complete reps (jump + land)
- Add tests for edge cases

EOF
)"
```

### 4. Push to Remote
```bash
# First push (create remote branch)
git push -u origin feature/jump-rope-counter

# Subsequent pushes
git push
```

## Pre-Commit Checklist

Before committing, verify:
- [ ] Code follows project conventions
- [ ] Tests pass locally (`pnpm test` or `uv run pytest`)
- [ ] No console.log or debugger statements
- [ ] No secrets or sensitive data
- [ ] TypeScript compiles without errors
- [ ] Linting passes (ESLint/Ruff)
- [ ] Files are properly formatted

## Creating Pull Requests

### 1. Gather Information
```bash
# Check branch divergence
git log main..HEAD --oneline

# View all changes
git diff main...HEAD

# Check current branch status
git status
```

### 2. Write PR Description

**Template:**
```markdown
## Summary
- Brief description of changes (1-3 bullet points)
- Link to related issue if applicable

## Changes Made
- Detailed list of changes
- New files created
- Modified functionality

## Test Plan
- [ ] Unit tests pass (`pnpm test`)
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No console errors in browser

## Screenshots (if UI changes)
[Add screenshots showing before/after]

## Checklist
- [ ] Code follows SOLID principles
- [ ] No security vulnerabilities
- [ ] Tests cover edge cases
- [ ] Documentation updated if needed

```

### 3. Create PR via gh CLI
```bash
# Ensure gh CLI is installed
gh --version

# Create PR (interactive)
gh pr create

# Create PR with title and body
gh pr create --title "feat(exercises): add jump rope counter" --body "$(cat <<'EOF'
## Summary
- Add jump rope exercise counter using ankle tracking
- Detect jumps when ankles rise above hip level
- Count complete reps (jump + land cycle)

## Test Plan
- [x] Unit tests pass with >90% coverage
- [x] Tested with 100 consecutive jumps
- [x] Edge cases handled (one foot off ground, false starts)

EOF
)"

# Create PR for specific base branch
gh pr create --base develop --title "..." --body "..."
```

## Common Git Operations

### View History
```bash
# Recent commits
git log --oneline -10

# Commits by author
git log --author="Claude" --oneline

# Changes in a specific file
git log --follow -- path/to/file.ts
```

### Undo Changes
```bash
# Discard unstaged changes
git checkout -- path/to/file.ts

# Unstage file (keep changes)
git reset HEAD path/to/file.ts

# Amend last commit (ONLY if not pushed!)
git commit --amend -m "new message"

# Revert a commit (creates new commit)
git revert <commit-hash>
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### Sync with Remote
```bash
# Fetch latest changes
git fetch origin

# Pull latest changes (fetch + merge)
git pull origin main

# Rebase on main (keep history clean)
git checkout feature/my-feature
git rebase main
```

## Git Safety Rules

### NEVER:
❌ Force push to main/develop (`git push --force`)
❌ Commit secrets, API keys, or passwords
❌ Commit large binary files (>10MB)
❌ Use `git add .` without reviewing changes
❌ Amend commits that have been pushed
❌ Rebase commits that have been pushed (unless sole contributor)

### ALWAYS:
✅ Review changes before committing (`git diff`)
✅ Write descriptive commit messages
✅ Keep commits atomic (one logical change per commit)
✅ Run tests before committing
✅ Use `.gitignore` for build artifacts, node_modules, etc.

## Handling Merge Conflicts

```bash
# 1. Pull latest changes
git pull origin main

# 2. If conflicts occur, see which files have conflicts
git status

# 3. Open conflicted files and resolve
# Look for markers:
<<<<<<< HEAD
Your changes
=======
Incoming changes
>>>>>>> branch-name

# 4. After resolving, stage the files
git add path/to/resolved-file.ts

# 5. Complete the merge
git commit -m "merge: resolve conflicts from main"
```

## GitHub Operations

### Check PR Status
```bash
# List open PRs
gh pr list

# View PR details
gh pr view 123

# Check PR checks/CI status
gh pr checks 123

# View PR comments
gh pr view 123 --comments
```

### Work with Issues
```bash
# List issues
gh issue list

# Create issue
gh issue create --title "Bug: Camera freezes after 5 minutes" --body "..."

# Close issue
gh issue close 123

# Link PR to issue
gh pr create --title "fix(camera): prevent memory leak" --body "Closes #123"
```

## Project-Specific Workflow

### Feature Development
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/jump-rope-counter

# 2. Make changes, commit regularly
git add features/exercises/logic/jumpRopeCounter.ts
git commit -m "feat(exercises): add jump rope detection logic"

# 3. Add tests
git add features/exercises/__tests__/jumpRopeCounter.test.ts
git commit -m "test(exercises): add jump rope counter tests"

# 4. Push to remote
git push -u origin feature/jump-rope-counter

# 5. Create PR
gh pr create --title "feat(exercises): add jump rope counter" --base main

# 6. After approval, merge via GitHub UI (squash and merge)
```

### Hotfix Workflow
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/auth-token-expiry

# 2. Fix the issue
git add server/app/core/security.py
git commit -m "fix(auth): correct token expiry calculation"

# 3. Create PR with "hotfix" label
gh pr create --title "hotfix(auth): fix token expiry" --label hotfix

# 4. Fast-track review and merge
```

## Verification

After Git operations:
- ✅ Commits follow conventional format
- ✅ No sensitive data committed
- ✅ Tests pass before pushing
- ✅ Branch is up to date with main
- ✅ PR description is clear and complete
