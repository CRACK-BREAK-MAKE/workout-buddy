# Workout Buddy Documentation

Welcome to the Workout Buddy project documentation!

## 🚀 Quick Navigation

### For New Contributors

1. **[Setup Guide](../SETUP.md)** - Get your development environment running in 5 minutes
2. **[Architecture Hub](ARCHITECTURE.md)** - Understand the system architecture
3. **[Contributing Guide](../CONTRIBUTING.md)** - Learn how to contribute

### For Developers

- **[Architecture Decision Records (ADRs)](adr/)** - Understand why we built it this way
- **[Development Guide](guides/DEVELOPMENT.md)** - Development workflow and best practices
- **[Testing Guide](guides/TESTING.md)** - How to write and run tests
- **[Code Quality Guide](guides/CODE_QUALITY.md)** - Coding standards and practices

### For DevOps/Deployment

- **[Deployment Guide](guides/DEPLOYMENT.md)** - Production deployment instructions
- **[Security Guide](guides/SECURITY.md)** - Security best practices
- **[Monitoring Guide](guides/MONITORING.md)** - Observability and alerting

### API Documentation

- **[API Endpoints](architecture/API_ENDPOINTS.md)** - REST API reference
- **[Database Schema](architecture/DATABASE_SCHEMA.md)** - Data models and relationships
- **[Swagger/OpenAPI](http://localhost:8000/docs)** - Interactive API documentation (when server is running)

## 📂 Documentation Structure

```
docs/
├── README.md                    # This file - documentation hub
├── ARCHITECTURE.md              # Main architecture overview
│
├── adr/                         # Architecture Decision Records
│   ├── README.md                # ADR index and template
│   ├── TEMPLATE.md              # Template for new ADRs
│   ├── 001-mediapipe...md       # Individual ADRs
│   ├── 002-react-vite...md
│   └── ...
│
├── architecture/                # System architecture docs
│   ├── SYSTEM_OVERVIEW.md       # High-level system design
│   ├── DATABASE_SCHEMA.md       # Database structure
│   ├── API_ENDPOINTS.md         # REST API documentation
│   └── diagrams/                # Architecture diagrams
│
├── guides/                      # How-to guides
│   ├── DEVELOPMENT.md           # Development workflow
│   ├── TESTING.md               # Testing strategies
│   ├── DEPLOYMENT.md            # Deployment procedures
│   ├── CODE_QUALITY.md          # Code standards
│   ├── GIT_WORKFLOW.md          # Git branching and commits
│   └── SECURITY.md              # Security practices
│
├── api/                         # API-specific docs
│   ├── authentication.md        # Auth flows
│   ├── workouts.md              # Workout endpoints
│   ├── statistics.md            # Statistics endpoints
│   └── error-codes.md           # Error handling
│
└── archive/                     # Deprecated docs
    └── workout-buddy-architecture-v1.md  # Original monolithic doc
```

## 🎯 Documentation Philosophy

Our documentation follows these principles:

1. **Living Documents**: Documentation evolves with the codebase
2. **Decision Transparency**: ADRs explain "why" not just "what"
3. **Progressive Disclosure**: Start simple, drill down as needed
4. **Code References**: Link to actual code implementation
5. **Examples First**: Show examples before explaining theory

## 📝 How to Contribute to Documentation

### Creating a New ADR

When making a significant architectural decision:

1. Copy [adr/TEMPLATE.md](adr/TEMPLATE.md)
2. Name it `NNN-short-title.md` (next sequential number)
3. Fill in all sections with context and rationale
4. Update [adr/README.md](adr/README.md) index
5. Submit PR for review

See [adr/README.md](adr/README.md) for detailed ADR guidelines.

### Updating Existing Docs

1. **Keep it current**: Update docs when code changes
2. **Link to code**: Use relative links to source files
3. **Version changes**: Note "Last Updated" date
4. **Be concise**: Favor clarity over comprehensiveness
5. **Use examples**: Code examples are worth 1000 words

### Documentation Style Guide

**Markdown Formatting:**
- Use `###` for main sections, `####` for subsections
- Use code blocks with language hints: \`\`\`python or \`\`\`typescript
- Use tables for structured data
- Use diagrams for visual concepts (ASCII art or Mermaid)

**Writing Style:**
- **Active voice**: "The system processes requests" not "Requests are processed"
- **Present tense**: "The function returns" not "The function will return"
- **Concise**: Get to the point quickly
- **Precise**: Use exact technical terms
- **Consistent**: Follow established conventions

## 🔍 Finding Information

**Looking for...** → **Check here...**

- Why we use React? → [adr/002-react-vite-frontend.md](adr/002-react-vite-frontend.md)
- How to deploy? → [guides/DEPLOYMENT.md](guides/DEPLOYMENT.md)
- API endpoint structure? → [architecture/API_ENDPOINTS.md](architecture/API_ENDPOINTS.md)
- Coding standards? → [guides/CODE_QUALITY.md](guides/CODE_QUALITY.md)
- Database tables? → [architecture/DATABASE_SCHEMA.md](architecture/DATABASE_SCHEMA.md)
- Git workflow? → [guides/GIT_WORKFLOW.md](guides/GIT_WORKFLOW.md)
- Pre-commit setup? → [adr/011-pre-commit-hooks-setup.md](adr/011-pre-commit-hooks-setup.md)

## 📊 Documentation Health

We track documentation quality metrics:

- **Coverage**: All features have corresponding documentation
- **Freshness**: Docs updated within 1 week of code changes
- **Clarity**: Technical terms defined, examples provided
- **Accuracy**: No outdated information (verified quarterly)

## 🤝 Getting Help

If you can't find what you need:

1. **Search**: Use GitHub's search across all docs
2. **Ask**: Open a GitHub Discussion in "Q&A" category
3. **Request**: Create an issue with label `documentation`
4. **Improve**: Submit a PR to clarify unclear documentation

## 📚 External Resources

### Official Documentation
- [React Docs](https://react.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [MediaPipe Docs](https://developers.google.com/mediapipe)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Python Docs](https://docs.python.org/3/)

### Best Practices
- [12-Factor App](https://12factor.net/)
- [REST API Design](https://restfulapi.net/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

### Tools
- [ADR Tools](https://adr.github.io/)
- [Mermaid Diagrams](https://mermaid.js.org/)
- [MarkdownLint](https://github.com/DavidAnson/markdownlint)

---

**Last Updated:** 2026-01-03

**Questions?** Open a [GitHub Discussion](https://github.com/your-org/workout-buddy/discussions)
