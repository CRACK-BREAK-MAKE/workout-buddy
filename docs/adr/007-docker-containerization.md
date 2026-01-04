# ADR-007: Docker Containerization from Day 1

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, DevOps Engineer

## Context and Problem Statement

We need consistent development, testing, and production environments. The solution should work on any developer's machine regardless of OS and deploy identically to production, eliminating "works on my machine" problems.

## Decision Drivers

* Must provide identical environments across dev/staging/production
* Must work on macOS, Windows, and Linux
* Must simplify developer onboarding (< 30 minutes to productive)
* Should isolate dependencies from host system
* Should support multi-service architecture (frontend, backend, database)
* Must enable easy rollbacks and versioning

## Considered Options

1. **Docker + Docker Compose** - Container-based development and deployment
2. **Virtual Machines (Vagrant)** - Heavy, slower startup times
3. **Direct Installation** - Manual dependency management, "works on my machine" issues
4. **Kubernetes from Start** - Over-engineering for MVP, too complex

## Decision

Use **Docker with Docker Compose** for all environments (development, staging, production)

## Rationale

* **Consistency:** "Works on my machine" → "Works everywhere" - identical containers across environments
* **Isolation:** Dependencies don't conflict with host system or other projects
* **Easy Onboarding:** `docker-compose up` gets new developers running in minutes
* **Production Parity:** Same containers in dev, staging, and production
* **Multi-Service:** Frontend, backend, database, cache all defined in one docker-compose.yml
* **Resource Efficient:** Much lighter than VMs (containers share kernel)
* **Version Control:** Dockerfiles and compose files in git ensure reproducibility
* **Clear Migration Path:** Easy to move to Kubernetes later if needed

## Consequences

### Positive

* New developers productive in <30 minutes (just install Docker Desktop)
* Identical behavior across all environments (no environment-specific bugs)
* Easy to add services (Redis cache, background workers, etc.)
* Clear path to Kubernetes orchestration if scale demands it
* Simple rollback strategy (just run previous Docker image tag)
* Isolated networking prevents port conflicts
* Easy cleanup (docker-compose down removes everything)

### Negative

* Requires Docker knowledge for troubleshooting
* Slight performance overhead on macOS/Windows (file system virtualization)
* Need to learn Docker networking concepts
* Docker images add to repository size (use .dockerignore)
* Hot reload can be slower on macOS (file watching through virtualization)

### Neutral

* Initial Docker setup takes 10-15 minutes (Docker Desktop installation)
* Need disk space for images (~2-5GB for full stack)

## Implementation Strategy

**Development (docker-compose.yml):**
```yaml
services:
  frontend:
    build: ./client
    volumes:
      - ./client:/app  # Hot reload
    ports:
      - "5173:5173"

  backend:
    build: ./server
    volumes:
      - ./server:/app  # Hot reload
    ports:
      - "8000:8000"
    depends_on:
      - db

  db:
    image: postgres:18-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Production:**
* Build optimized images (multi-stage builds)
* No volume mounts (immutable containers)
* Health checks for all services
* Resource limits defined
* Use specific image tags (not :latest)

## Mitigation Strategies

**Performance on macOS/Windows:**
* Use named volumes instead of bind mounts where possible
* Configure Docker Desktop with adequate resources (4GB RAM minimum)
* Use mutagen or docker-sync for file watching if needed
* Document performance tuning in setup guide

**Docker learning curve:**
* Provide detailed Docker setup guide in SETUP.md
* Document common Docker issues and solutions
* Include troubleshooting section in docs
* Team training session on Docker basics

**Image size concerns:**
* Use Alpine-based images where possible
* Multi-stage builds to keep final images small
* Comprehensive .dockerignore file
* Regular cleanup of unused images (docker system prune)

## Validation

**Success Criteria:**

* New developer productive in <30 minutes
* Zero environment-specific bugs reported
* All services start with single command
* Development environment matches production
* Hot reload works for both frontend and backend

## Confidence Level

**High** (9/10)

Docker is industry standard for containerization. Risk is minimal - worst case, developers can run services locally without Docker, though this defeats the purpose of environment consistency.

## Related Decisions

* Related to [ADR-005](005-monorepo-structure.md) - Monorepo with multiple services
* Related to [ADR-009](009-vercel-railway-hosting.md) - Production deployment
* Informs future: Kubernetes migration path if needed

## References

* [Docker Documentation](https://docs.docker.com/)
* [Docker Compose Documentation](https://docs.docker.com/compose/)
* [12-Factor App - Dev/Prod Parity](https://12factor.net/dev-prod-parity)
* Implementation: [docker-compose.yml](../../docker-compose.yml)
* Dockerfiles: [client/Dockerfile](../../client/Dockerfile), [server/Dockerfile](../../server/Dockerfile)
