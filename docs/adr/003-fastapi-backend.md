# ADR-003: FastAPI for Backend Services

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, Backend Team

## Context and Problem Statement

We need a backend framework for user management, workout data persistence, and future ML features. The framework should be fast, scalable, and work well with Python's ML ecosystem for potential future enhancements.

## Decision Drivers

* Must support async/await for scalability (target: 10,000+ concurrent users)
* Must have strong type safety to reduce bugs
* Must integrate well with Python ML libraries (for future features)
* Must provide auto-generated API documentation
* Should have good developer experience (fast iteration)
* Should leverage team's existing Python expertise

## Considered Options

1. **FastAPI (Python)** - Modern async Python framework
2. **Express.js (Node.js)** - JavaScript full-stack consistency
3. **Django (Python)** - Full-featured framework with batteries included
4. **Spring Boot (Java)** - Enterprise-grade but verbose

## Decision

Use **FastAPI with Python 3.14+** as the backend framework

## Rationale

* **Async First:** Built on asyncio, handles 10,000+ concurrent connections efficiently
* **Performance:** Comparable to Node.js/Go performance (3x faster than Django/Flask)
* **Python ML Integration:** Seamless integration with TensorFlow, PyTorch for future features
* **Auto Documentation:** OpenAPI (Swagger) documentation auto-generated from code
* **Type Safety:** Pydantic validation catches errors at API boundary before hitting business logic
* **Team Skills:** Leverages existing Python proficiency
* **Modern Pythonic:** Uses Python 3.6+ features (type hints, async/await, dataclasses)
* **Dependency Injection:** Built-in DI system makes testing easier

## Consequences

### Positive

* Fast API development with automatic request/response validation
* Excellent for data-heavy applications (workout statistics, user analytics)
* Easy to add ML features later (personalized coaching, form analysis, predictions)
* Strong typing reduces runtime bugs by catching issues at development time
* Async design supports WebSocket for potential real-time features
* Auto-generated interactive API docs (Swagger UI) for frontend team
* Excellent test coverage possible with built-in TestClient

### Negative

* Smaller community than Express.js (but growing rapidly - 60k+ GitHub stars)
* Fewer third-party packages than Django (but sufficient for our needs)
* Team needs to learn async Python patterns (async/await, asyncio)
* Slightly more boilerplate than Django for CRUD operations

### Neutral

* Requires Python 3.7+ (we're using 3.14, so no issue)
* No built-in admin panel like Django (not needed for MVP)

## Mitigation Strategies

**Async learning curve:**
* Provide async/await training resources and examples
* Use well-documented patterns from FastAPI cookbook
* Start with simple synchronous endpoints, add async incrementally
* Code reviews to ensure proper async usage

**Smaller ecosystem:**
* Carefully evaluate third-party packages before adoption
* Consider Django packages that can work with FastAPI
* Build internal utilities where needed (DRY principle)

## Validation

**Success Criteria:**

* API response times <200ms (p95) under normal load
* Support 1000+ concurrent users in MVP phase
* 100% API documentation coverage (auto-generated)
* >80% code coverage in tests
* Developer onboarding time <2 days

## Confidence Level

**High** (9/10)

FastAPI is production-proven and used by major companies (Microsoft, Netflix, Uber). The async-first design aligns perfectly with our scalability goals. Risk is minimal given FastAPI's maturity and our team's Python expertise.

## Related Decisions

* Related to [ADR-001](001-mediapipe-for-pose-detection.md) - Backend doesn't process ML (client-side)
* Related to [ADR-004](004-postgresql-database.md) - Database choice and SQLAlchemy integration
* Related to [ADR-006](006-jwt-authentication.md) - Authentication implementation
* Related to [ADR-010](010-feature-based-structure.md) - Backend code organization

## References

* [FastAPI Documentation](https://fastapi.tiangolo.com/)
* [FastAPI Performance Benchmarks](https://www.techempower.com/benchmarks/)
* [Pydantic Documentation](https://docs.pydantic.dev/)
* [Python AsyncIO Documentation](https://docs.python.org/3/library/asyncio.html)
* Implementation: [server/app/main.py](../../server/app/main.py)
