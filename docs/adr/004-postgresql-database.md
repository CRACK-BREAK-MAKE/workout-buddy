# ADR-004: PostgreSQL as Primary Database

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, Database Administrator

## Context and Problem Statement

We need a reliable database for structured data (users, workouts, statistics). The database must support ACID transactions for data integrity, handle complex analytics queries efficiently, and scale to millions of records as the user base grows.

## Decision Drivers

* Must guarantee data integrity for critical user data (ACID compliance)
* Must support complex aggregation queries for statistics dashboard
* Must scale to millions of workout records
* Must have robust backup and recovery mechanisms
* Should support both structured and semi-structured data
* Should have strong security features (encryption, access control)
* Should integrate well with Python backend (SQLAlchemy support)

## Considered Options

1. **PostgreSQL** - Powerful open-source relational database
2. **MongoDB** - NoSQL document database, flexible schema
3. **MySQL** - Popular relational database
4. **SQLite** - Lightweight file-based database

## Decision

Use **PostgreSQL 18** as the primary database

## Rationale

* **ACID Compliance:** Guaranteed data integrity for user workouts and profile data
* **JSON Support:** Can store flexible data (exercise metadata, settings) in JSONB columns
* **Analytics Power:** Excellent query optimizer for complex aggregation queries (statistics, trends)
* **Mature Security:** Robust encryption at rest/in-transit, fine-grained permissions, audit trails
* **Scalability:** Handles millions of rows efficiently with proper indexing and partitioning
* **Extensions:** PostGIS (future location features), pg_trgm (fuzzy search), full-text search
* **Community & Tooling:** Extensive documentation, mature ecosystem, excellent ORMs
* **SQLAlchemy Integration:** First-class support in Python with async capabilities

## Consequences

### Positive

* Strong data consistency for critical user data (workouts, authentication)
* Excellent query optimizer automatically optimizes complex statistics queries
* Built-in full-text search for future exercise library
* Easy backup/restore strategies (pg_dump, continuous archiving)
* Connection pooling support (PgBouncer, pgpool) for scalability
* JSONB columns provide flexibility without sacrificing query performance
* Window functions perfect for workout trends and personal bests
* Mature replication for high availability

### Negative

* More complex to scale horizontally than NoSQL (requires sharding planning)
* Requires careful index design for optimal performance
* Schema migrations need planning and testing (using Alembic)
* Heavier resource footprint than SQLite (not suitable for embedded use)

### Neutral

* Stronger typing than NoSQL (feature for data integrity, requires upfront schema design)
* No built-in sharding (use extensions like Citus if needed later)

## Mitigation Strategies

**Horizontal scaling complexity:**
* Use Alembic for versioned schema migrations from day 1
* Implement connection pooling immediately (prevents connection exhaustion)
* Plan sharding strategy for >1M users (partition by user_id if needed)
* Consider read replicas for analytics queries

**Performance optimization:**
* Create indexes on foreign keys and frequently queried columns
* Use EXPLAIN ANALYZE to profile slow queries
* Implement query result caching (Redis) for expensive aggregations
* Monitor slow query log in production

**Schema migration risks:**
* Test migrations on staging environment first
* Use online schema change tools for zero-downtime migrations
* Keep migrations reversible (down migrations)
* Version lock database schema with application code

## Database Schema Design Principles

**Core Tables:**
```sql
users           - User authentication and profile
workouts        - Individual workout sessions
exercise_types  - Supported exercises (push-ups, jump rope)
statistics      - Aggregated stats (computed view or materialized view)
```

**Indexing Strategy:**
* Primary keys: UUID for distributed scalability
* Foreign keys: B-tree indexes on all FK columns
* Query patterns: Index on (user_id, created_at) for workout history
* Full-text: GIN index on exercise descriptions (future)

See [DATABASE_SCHEMA.md](../architecture/DATABASE_SCHEMA.md) for detailed schema.

## Validation

**Success Criteria:**

* Query response time <50ms (p95) for single record lookups
* Analytics queries <500ms (p95) for 1-year workout history
* Support 100M+ workout records without performance degradation
* Zero data loss in production (ACID guarantees)
* Successful backup/restore tested quarterly

## Confidence Level

**High** (9/10)

PostgreSQL is battle-tested for decades and used by companies at massive scale. It's the most advanced open-source relational database. Risk is minimal - worst case, we can add read replicas or use Citus for sharding if needed beyond 10M users.

## Related Decisions

* Related to [ADR-003](003-fastapi-backend.md) - SQLAlchemy integration
* Related to [ADR-007](007-docker-containerization.md) - Database containerization
* Related to [ADR-009](009-vercel-railway-hosting.md) - Managed PostgreSQL on Railway

## References

* [PostgreSQL Documentation](https://www.postgresql.org/docs/)
* [SQLAlchemy Async Support](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
* [Alembic Migrations](https://alembic.sqlalchemy.org/)
* [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
* Implementation: [server/app/models/](../../server/app/models/)
* Migrations: [server/alembic/](../../server/alembic/)
