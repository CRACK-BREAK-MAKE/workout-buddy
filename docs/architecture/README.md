# Architecture Documentation

This directory contains technical architecture documentation for the Exercise Buddy project.

---

## 📐 Architecture Documents

### [System Architecture](SYSTEM_ARCHITECTURE.md)
High-level system design, component interaction flows, technology stack, and deployment architecture.

**Key Topics:**
* Three-tier architecture diagram
* Component interaction flows (exercise counting, authentication)
* Technology stack with justifications
* Deployment architecture (dev/staging/production)
* Security architecture (defense in depth)
* Scalability considerations

---

### [Database Schema](DATABASE_SCHEMA.md)
Complete database schema documentation with tables, relationships, indexes, and queries.

**Key Topics:**
* Entity-relationship diagram
* Table definitions (`users`, `workouts`)
* Column descriptions and constraints
* Indexes and performance optimization
* Common query patterns
* SQLAlchemy ORM models
* Migration strategy (Alembic)

---

### [API Endpoints](API_ENDPOINTS.md)
RESTful API documentation with request/response examples for all endpoints.

**Key Topics:**
* Authentication endpoints (`/api/v1/auth/*`)
* User management endpoints (`/api/v1/users/*`)
* Workout endpoints (`/api/v1/workouts/*`)
* Statistics endpoints (`/api/v1/statistics/*`)
* Health check endpoints
* Error response format
* Rate limiting strategy
* CORS configuration

---

## 🗂️ Related Documentation

* **[ADRs](../adr/)** - Architecture Decision Records documenting key decisions
* **[Guides](../guides/)** - Development, testing, and deployment guides
* **[Main Documentation Hub](../ARCHITECTURE.md)** - Central navigation for all documentation

---

## 🔗 Quick Links

**System Design:**
* [High-Level Architecture](SYSTEM_ARCHITECTURE.md#high-level-architecture)
* [Technology Stack](SYSTEM_ARCHITECTURE.md#technology-stack)
* [Deployment Architecture](SYSTEM_ARCHITECTURE.md#deployment-architecture)

**Database:**
* [ER Diagram](DATABASE_SCHEMA.md#entity-relationship-diagram)
* [Table Definitions](DATABASE_SCHEMA.md#table-definitions)
* [Common Queries](DATABASE_SCHEMA.md#queries)

**API:**
* [Authentication](API_ENDPOINTS.md#authentication)
* [Workouts](API_ENDPOINTS.md#workouts)
* [Statistics](API_ENDPOINTS.md#statistics)
* [Swagger UI](http://localhost:8000/docs)

---

## 📋 Document Status

| Document | Status | Last Updated | Maintainer |
|----------|--------|--------------|------------|
| [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) | ✅ Complete | 2026-01-03 | Dev Team |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | ✅ Complete | 2026-01-03 | Dev Team |
| [API_ENDPOINTS.md](API_ENDPOINTS.md) | ✅ Complete | 2026-01-03 | Dev Team |

---

## 🤝 Contributing

When updating architecture documentation:

1. Follow the existing format and structure
2. Update the "Last Updated" date in the document header
3. Cross-reference related ADRs and documents
4. Include code examples where helpful
5. Update this README if adding new documents
6. Submit changes via pull request

---

## 📚 Additional Resources

* [Twelve-Factor App Methodology](https://12factor.net/)
* [C4 Model for Software Architecture](https://c4model.com/)
* [REST API Design Best Practices](https://restfulapi.net/)
* [Database Design Principles](https://www.postgresql.org/docs/current/ddl.html)

---

**Last Updated:** 2026-01-03
