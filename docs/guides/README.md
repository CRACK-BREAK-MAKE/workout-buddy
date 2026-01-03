# Development Guides

Practical guides for developing, testing, and deploying the Workout Buddy application.

---

## 📘 Available Guides

### [Development Guide](DEVELOPMENT.md)
Complete guide to setting up your development environment and daily workflows.

**Topics:**
* Prerequisites and required software
* Getting started (clone, install, configure)
* Development workflow (feature development, conventional commits)
* Project structure (monorepo, feature-based organization)
* Common tasks (frontend, backend, database, Docker)
* Troubleshooting common issues
* Best practices (code organization, testing, git workflow, security)

**Start here if you're new to the project!**

---

### [Testing Guide](TESTING.md)
Test-Driven Development methodology and testing practices.

**Topics:**
* Frontend testing (Vitest + React Testing Library)
* Backend testing (Pytest)
* TDD workflow (Red-Green-Refactor)
* Coverage requirements and reports
* CI/CD integration
* Best practices for writing tests

**Essential for maintaining code quality.**

---

### [Deployment Guide](DEPLOYMENT.md)
Deploy the application to production using Vercel and Railway.

**Topics:**
* Deployment architecture overview
* Prerequisites (Vercel, Railway setup)
* Initial deployment steps
* Database migrations
* CI/CD pipeline configuration (GitHub Actions)
* Environment configuration
* Deployment checklist
* Rollback procedures
* Monitoring and logs
* Cost estimates

**Read this before deploying to production!**

---

## 🚀 Quick Start

### For New Developers

1. **Read** [Development Guide](DEVELOPMENT.md) → Get your environment set up
2. **Review** [Project Structure](DEVELOPMENT.md#project-structure) → Understand codebase organization
3. **Follow** [Development Workflow](DEVELOPMENT.md#development-workflow) → Start contributing
4. **Write Tests** [Testing Guide](TESTING.md#tdd-workflow-red-green-refactor) → TDD methodology

### For Deploying

1. **Complete** [Deployment Checklist](DEPLOYMENT.md#deployment-checklist)
2. **Configure** [Environment Variables](DEPLOYMENT.md#environment-configuration)
3. **Follow** [Initial Deployment](DEPLOYMENT.md#initial-deployment)
4. **Monitor** [Logs and Metrics](DEPLOYMENT.md#monitoring--logs)

---

## 📚 Related Documentation

### Architecture Documentation
* [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md) - High-level design
* [Database Schema](../architecture/DATABASE_SCHEMA.md) - Data models
* [API Endpoints](../architecture/API_ENDPOINTS.md) - REST API reference

### Architectural Decisions
* [ADR Index](../adr/README.md) - All architectural decisions
* [ADR-010: Feature-Based Structure](../adr/010-feature-based-structure.md) - Code organization
* [ADR-011: Pre-commit Hooks](../adr/011-pre-commit-hooks-setup.md) - Code quality automation

### Project Documentation
* [Main Documentation Hub](../ARCHITECTURE.md) - Central navigation
* [README](../../README.md) - Project overview

---

## 🎯 Common Tasks

### Development
```bash
# Start development environment
docker-compose up -d

# Run frontend dev server
cd client && pnpm dev

# Run backend dev server
cd server && uv run uvicorn app.main:app --reload
```

### Testing
```bash
# Run all frontend tests
cd client && pnpm test

# Run all backend tests
cd server && uv run pytest
```

### Deployment
```bash
# Deploy frontend to Vercel
cd client && vercel --prod

# Deploy backend to Railway
cd server && railway up
```

---

## 🛠️ Development Principles

### SOLID Principles
* **S**ingle Responsibility: Each module has one reason to change
* **O**pen/Closed: Open for extension, closed for modification
* **L**iskov Substitution: Subtypes substitutable for base types
* **I**nterface Segregation: Many small interfaces over one large
* **D**ependency Inversion: Depend on abstractions, not concretions

### Code Quality Standards
* **DRY** (Don't Repeat Yourself) - Extract duplicate code
* **YAGNI** (You Aren't Gonna Need It) - Only build what's needed
* **TDD** (Test-Driven Development) - Write tests first
* **Feature-Based Organization** - Group by domain, not layer

See [ADR-010: Feature-Based Structure](../adr/010-feature-based-structure.md) for detailed organization principles.

---

## 🔧 Troubleshooting

### Development Issues
* [Port Already in Use](DEVELOPMENT.md#port-already-in-use)
* [Module Not Found](DEVELOPMENT.md#module-not-found-errors)
* [Database Connection Issues](DEVELOPMENT.md#database-connection-issues)
* [Pre-commit Hooks Not Running](DEVELOPMENT.md#pre-commit-hooks-not-running)

### Deployment Issues
* [Deployment Failed](DEPLOYMENT.md#deployment-failed)
* [Backend Not Responding](DEPLOYMENT.md#backend-not-responding)
* [CORS Errors](DEPLOYMENT.md#cors-errors)

---

## 📞 Getting Help

* **Questions:** Open a GitHub Discussion
* **Bug Reports:** Create a GitHub Issue
* **Feature Requests:** Create a GitHub Issue with `enhancement` label
* **Security Issues:** See [SECURITY.md](../../SECURITY.md)

---

## 🤝 Contributing

We welcome contributions! Please read:

1. [Development Guide](DEVELOPMENT.md) - Setup and workflow
2. [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
3. [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) - Community standards

---

**Last Updated:** 2026-01-03
**Maintained By:** Workout Buddy Development Team
