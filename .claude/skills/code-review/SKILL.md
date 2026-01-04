---
name: code-review
description: Review code for quality, security, SOLID principles, performance issues, and suggest improvements. Use when the user asks to review code, check code quality, or after completing a significant feature implementation.
allowed-tools: Read, Grep, Glob
---

# Code Review Skill

Perform comprehensive code reviews focusing on quality, security, and best practices.

## Review Checklist

### 1. SOLID Principles
- **Single Responsibility**: Does each function/class have one clear purpose?
- **Open/Closed**: Can behavior be extended without modification?
- **Liskov Substitution**: Are abstractions properly implemented?
- **Interface Segregation**: Are interfaces/types minimal and focused?
- **Dependency Inversion**: Does code depend on abstractions, not concretions?

### 2. Security Issues (OWASP Top 10)
- ❌ SQL Injection - Check for raw SQL queries
- ❌ XSS - Check for unescaped user input in React
- ❌ Authentication issues - Verify JWT handling, password hashing
- ❌ Sensitive data exposure - Check for secrets in code
- ❌ CSRF - Verify token-based auth
- ❌ Rate limiting - Check auth endpoints
- ❌ Input validation - Verify Pydantic schemas and Zod validation

### 3. Code Quality
- **DRY**: Look for duplicate code that should be extracted
- **Naming**: Clear, descriptive variable/function names
- **Complexity**: Functions should be <20 lines ideally
- **Error Handling**: Proper try/catch, user-friendly messages
- **Type Safety**: All TypeScript types defined, no `any`
- **Comments**: Only where logic isn't self-evident

### 4. Performance
- **Database**: N+1 queries, missing indexes, inefficient queries
- **Frontend**: Unnecessary re-renders, missing memoization, large bundles
- **API**: Response times, pagination, caching opportunities
- **Memory**: Memory leaks, large arrays/objects, cleanup on unmount

### 5. Testing
- **Coverage**: Are critical paths tested?
- **Test Quality**: Do tests verify behavior, not implementation?
- **Edge Cases**: Are error conditions tested?

### 6. Project-Specific Standards
- **Feature-based structure**: Code organized by domain, not by type
- **Latest versions**: Using React 19, FastAPI 0.128, etc.
- **Conventional commits**: Follow format (feat/fix/docs/etc.)
- **CLAUDE.md compliance**: Follow project guidelines

## Review Process

1. **Read the changed files** - Use Read tool to examine code
2. **Check for patterns** - Use Grep to find potential issues
3. **Provide specific feedback** - Reference file:line numbers
4. **Suggest improvements** - Provide code examples
5. **Prioritize issues** - Critical (security) > High (bugs) > Medium (quality) > Low (style)

## Output Format

```markdown
## Code Review Summary

**Files Reviewed**: [list files]
**Overall Assessment**: [Excellent/Good/Needs Improvement]

### Critical Issues (Must Fix)
- [file:line] Issue description with code example

### High Priority
- [file:line] Issue description with suggested fix

### Improvements
- [file:line] Suggestion for better approach

### Positive Observations
- Well-structured feature architecture
- Comprehensive error handling
```

## When NOT to Review
- Trivial changes (typo fixes, formatting)
- Auto-generated code (migrations, build output)
- Third-party dependencies

## Example Usage
User: "Review the authentication implementation"
Action: Read auth files, check for security issues, verify JWT handling, test password hashing
