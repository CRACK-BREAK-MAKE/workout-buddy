# Commit Command

Create a conventional commit with proper formatting following project standards.

**Usage:** `/commit`

This command automatically:
1. Checks git status and diff
2. Reviews recent commits for style consistency
3. Creates a properly formatted conventional commit message
4. Includes the Claude Code signature

## Conventional Commit Format

```
<type>(<scope>): <subject>

<body>
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
- **docker**: Docker configuration
- **deploy**: Deployment configuration

## Pre-Commit Checklist

Before running this command, ensure:
- [ ] Tests pass (`pnpm test` or `uv run pytest`)
- [ ] Linting passes (`pnpm lint` or `uv run ruff check .`)
- [ ] No console.log or debugger statements
- [ ] No secrets or sensitive data
- [ ] TypeScript compiles without errors
- [ ] Code formatted correctly

## Examples

### Good Commits

```bash
feat(exercises): add jump rope counter with ankle tracking

- Track ankle height relative to hip position
- Detect jump when ankles rise above threshold
- Count complete reps (jump + land)
- Add tests for edge cases (>90% coverage)
```

```bash
fix(camera): prevent memory leak in pose detection loop

Release MediaPipe resources when component unmounts.
Previously, resources were not cleaned up causing memory
to grow over time during long workout sessions.

Fixes #38
```

```bash
refactor(auth): extract JWT logic to separate service

- Move JWT creation/validation to authService
- Improves testability and follows SRP
- No behavior change
```

### Bad Commits (Avoid)

```bash
# ❌ Too vague
update stuff

# ❌ No type/scope
fixed bug

# ❌ Not descriptive
WIP

# ❌ Unprofessional
asdfasdf

# ❌ Misleading version
final version (really)
```

## Git Safety Rules

### NEVER:
- ❌ Force push to main/develop (`git push --force`)
- ❌ Commit secrets, API keys, or passwords
- ❌ Commit large binary files (>10MB)
- ❌ Use `git add .` without reviewing changes
- ❌ Amend commits that have been pushed
- ❌ Commit directly to main (always use PR)

### ALWAYS:
- ✅ Review changes before committing (`git diff`)
- ✅ Write descriptive commit messages
- ✅ Keep commits atomic (one logical change per commit)
- ✅ Run tests before committing
- ✅ Stage only relevant files

## Process

This command will:

1. **Check Status**
   ```bash
   git status
   git diff
   ```

2. **Review Recent Commits**
   ```bash
   git log --oneline -10
   ```

3. **Analyze Changes**
   - Determine appropriate type (feat/fix/refactor/etc.)
   - Identify scope (auth/exercises/camera/etc.)
   - Summarize changes concisely

4. **Create Commit**
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <subject>

   <body>
   EOF
   )"
   ```

5. **Verify Success**
   ```bash
   git status
   git log -1
   ```

## Integration with git-workflow Skill

This command automatically activates the `git-workflow` skill which provides:
- Git best practices
- Conventional commit validation
- Safety checks
- Branch management guidance

## Reference

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Git Workflow Skill**: [.claude/skills/git-workflow/SKILL.md](../skills/git-workflow/SKILL.md)
- **CLAUDE.md**: [CLAUDE.md](../../CLAUDE.md)
