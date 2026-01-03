# Database Schema

**Version:** 1.0
**Last Updated:** 2026-01-03
**Database:** PostgreSQL 18
**ORM:** SQLAlchemy 2.0 (Async)

---

## Overview

The Exercise Buddy application uses PostgreSQL as its primary database ([ADR-004](../adr/004-postgresql-database.md)). The schema is designed for simplicity during MVP phase while supporting future scalability.

### Design Principles

* **UUID Primary Keys:** Distributed-friendly, no sequential ID vulnerabilities
* **JSONB Support:** Flexible data storage for future exercise metadata
* **Indexes on Foreign Keys:** Fast joins and lookups
* **Timestamps:** Track creation/modification for audit trails
* **Cascading Deletes:** Maintain referential integrity (user deletion removes workouts)
* **No Premature Optimization:** Start simple, add complexity when data proves it necessary

---

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│          users                  │
├─────────────────────────────────┤
│ id              UUID PK         │
│ email           VARCHAR(255) UK │
│ username        VARCHAR(50) UK  │
│ hashed_password VARCHAR(255)    │
│ is_active       BOOLEAN         │
│ created_at      TIMESTAMP       │
│ updated_at      TIMESTAMP       │
└─────────────────┬───────────────┘
                  │
                  │ 1:N
                  │
┌─────────────────▼───────────────┐
│          workouts               │
├─────────────────────────────────┤
│ id                UUID PK       │
│ user_id           UUID FK       │
│ exercise_type     VARCHAR(50)   │
│ reps_count        INTEGER       │
│ duration_seconds  INTEGER       │
│ calories_burned   FLOAT         │
│ created_at        TIMESTAMP     │
└─────────────────────────────────┘
```

**Relationships:**
* One User → Many Workouts (1:N)
* Cascade delete: Deleting a user deletes all their workouts

---

## Table Definitions

### `users` Table

Stores user account information with authentication credentials.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (used for login) |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Display name (3-50 characters) |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password (never plaintext) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status (for soft deletes/bans) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last profile update timestamp |

**Business Rules:**
* Email must be valid format (validated by Pydantic EmailStr)
* Username must be 3-50 characters (alphanumeric, underscores, hyphens)
* Password must be hashed using bcrypt (min 8 characters plaintext)
* Soft delete via `is_active=false` (preserve workout history)

**Sample Data:**
```sql
INSERT INTO users (id, email, username, hashed_password) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john@example.com', 'john_doe', '$2b$12$...');
```

---

### `workouts` Table

Stores completed workout sessions with exercise details.

```sql
CREATE TABLE workouts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_type     VARCHAR(50) NOT NULL CHECK (exercise_type IN ('push-up', 'jump-rope')),
    reps_count        INTEGER NOT NULL CHECK (reps_count >= 0),
    duration_seconds  INTEGER NOT NULL CHECK (duration_seconds >= 0),
    calories_burned   FLOAT CHECK (calories_burned >= 0),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);
CREATE INDEX idx_workouts_exercise_type ON workouts(exercise_type);
```

**Column Descriptions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique workout identifier |
| `user_id` | UUID | FK → users(id), NOT NULL | User who completed the workout |
| `exercise_type` | VARCHAR(50) | NOT NULL, CHECK | Exercise type: 'push-up' or 'jump-rope' |
| `reps_count` | INTEGER | NOT NULL, >= 0 | Number of repetitions counted |
| `duration_seconds` | INTEGER | NOT NULL, >= 0 | Workout duration in seconds |
| `calories_burned` | FLOAT | >= 0 | Estimated calories (nullable, calculated client-side) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When workout was completed |

**Business Rules:**
* `exercise_type` must be one of: `'push-up'`, `'jump-rope'` (enforced via CHECK constraint)
* `reps_count` must be non-negative (>= 0)
* `duration_seconds` must be non-negative (>= 0)
* `calories_burned` is optional (calculated client-side using simple formula)
* Cascade delete: Removing a user deletes all their workouts

**Sample Data:**
```sql
INSERT INTO workouts (id, user_id, exercise_type, reps_count, duration_seconds, calories_burned) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'push-up', 25, 180, 12.5);
```

---

## Indexes

### Purpose
Indexes optimize query performance for common access patterns:
* User lookups by email/username (authentication)
* Workout history retrieval (user_id + created_at)
* Exercise-specific statistics (exercise_type filtering)

### Index Definitions

```sql
-- User indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);           -- Login via email
CREATE UNIQUE INDEX idx_users_username ON users(username);     -- Login via username
CREATE INDEX idx_users_created_at ON users(created_at);        -- User registration trends

-- Workout indexes
CREATE INDEX idx_workouts_user_id ON workouts(user_id);        -- User's workout history
CREATE INDEX idx_workouts_created_at ON workouts(created_at);  -- Chronological ordering
CREATE INDEX idx_workouts_exercise_type ON workouts(exercise_type);  -- Exercise-specific stats

-- Composite index for common query pattern (user workouts by date)
CREATE INDEX idx_workouts_user_created ON workouts(user_id, created_at DESC);
```

### Performance Considerations
* UUID primary keys have slight overhead vs integers (16 bytes vs 4 bytes)
* Trade-off is acceptable for distributed architecture benefits
* All foreign keys are indexed automatically
* created_at indexes support pagination and date range queries

---

## Migrations

### Alembic Configuration

Migrations are managed using Alembic 1.14+ ([ADR-007](../adr/007-docker-containerization.md)).

```bash
# Create new migration
cd server
alembic revision --autogenerate -m "add workouts table"

# Apply migrations (local)
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### Migration Files Location
```
server/alembic/versions/
├── 001_create_users_table.py
├── 002_create_workouts_table.py
└── 003_add_workout_indexes.py
```

### Production Migration Strategy
1. **Always backup database first** (Railway auto-backup before deploy)
2. Run migration in transaction (rollback on failure)
3. Zero-downtime migrations (additive changes only)
4. Monitor logs during migration
5. Rollback plan ready

---

## Queries

### Common Query Patterns

#### 1. User Authentication
```sql
-- Find user by email (login)
SELECT id, email, username, hashed_password, is_active
FROM users
WHERE email = 'john@example.com' AND is_active = TRUE;
```

#### 2. User Workout History (Paginated)
```sql
-- Get last 20 workouts for a user
SELECT id, exercise_type, reps_count, duration_seconds, calories_burned, created_at
FROM workouts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

#### 3. User Statistics (All Time)
```sql
-- Calculate user's total reps and workouts
SELECT
    COUNT(*) AS total_workouts,
    SUM(reps_count) AS total_reps,
    SUM(duration_seconds) AS total_duration,
    SUM(calories_burned) AS total_calories
FROM workouts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
```

#### 4. Exercise-Specific Statistics
```sql
-- Get push-up statistics for user
SELECT
    COUNT(*) AS pushup_workouts,
    SUM(reps_count) AS total_pushups,
    AVG(reps_count) AS avg_pushups_per_workout,
    MAX(reps_count) AS personal_record
FROM workouts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND exercise_type = 'push-up';
```

#### 5. Weekly Progress
```sql
-- Get workouts from last 7 days, grouped by day
SELECT
    DATE_TRUNC('day', created_at) AS workout_date,
    COUNT(*) AS workouts_count,
    SUM(reps_count) AS total_reps
FROM workouts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY workout_date DESC;
```

---

## SQLAlchemy Models

### User Model

Location: [`server/app/models/user.py`](../../server/app/models/user.py)

```python
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
```

### Workout Model

Location: [`server/app/models/workout.py`](../../server/app/models/workout.py)

```python
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exercise_type = Column(String(50), nullable=False)
    reps_count = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="workouts")
```

---

## Future Enhancements

**Not in MVP** (YAGNI principle - build only when needed):

### Phase 2: Enhanced Analytics
* `workout_statistics` table (pre-aggregated stats for performance)
* `exercise_metadata` JSONB column (store pose landmarks for ML training)
* `workout_sessions` table (multi-exercise workouts)

### Phase 3: Social Features
* `friendships` table (user connections)
* `workout_shares` table (shared workout links)
* `leaderboards` materialized view

### Phase 4: Scaling
* Partitioning `workouts` by `created_at` (monthly partitions)
* Read replicas for analytics queries
* Redis caching layer for user statistics

---

## Security Considerations

* **Never store plaintext passwords** - Always use bcrypt hashing (cost factor 12)
* **SQL Injection Prevention** - SQLAlchemy ORM uses parameterized queries
* **Row-Level Security** - Users can only access their own workouts (enforced in application layer)
* **Soft Deletes** - Use `is_active=false` instead of hard deletes (preserve audit trail)
* **Regular Backups** - Railway automated daily backups (7-day retention)

---

## References

* [ADR-004: PostgreSQL Database](../adr/004-postgresql-database.md)
* [ADR-003: FastAPI Backend](../adr/003-fastapi-backend.md)
* [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
* [PostgreSQL 18 Documentation](https://www.postgresql.org/docs/18/)
* [Alembic Documentation](https://alembic.sqlalchemy.org/en/latest/)

---

**Last Updated:** 2026-01-03
**Maintained By:** Exercise Buddy Development Team
