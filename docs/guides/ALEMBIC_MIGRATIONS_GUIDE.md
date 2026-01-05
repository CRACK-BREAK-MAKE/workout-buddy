# Alembic Database Migrations Guide

## Table of Contents
1. [What is Alembic?](#what-is-alembic)
2. [How Alembic Works](#how-alembic-works)
3. [Project Setup](#project-setup)
4. [Creating Migrations](#creating-migrations)
5. [Running Migrations](#running-migrations)
6. [Common Scenarios](#common-scenarios)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## What is Alembic?

**Alembic** is a database migration tool for SQLAlchemy, the most popular Python ORM (Object-Relational Mapping) library. It allows you to:

- **Version control your database schema** - Track changes to database structure over time
- **Safely modify production databases** - Apply incremental changes without data loss
- **Collaborate with team members** - Share schema changes through code
- **Rollback changes** - Revert to previous database states if needed
- **Auto-generate migrations** - Alembic can detect model changes and create migration scripts

Think of Alembic as "Git for your database schema" - it tracks every change and allows you to move forward or backward through versions.

---

## How Alembic Works

### The Migration Workflow

```
┌─────────────────┐
│ SQLAlchemy Model│  1. You define/modify models
│   (Python ORM)  │     in app/features/*/models/
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Alembic Revision│  2. Alembic detects changes
│  (Auto-generate)│     and creates migration script
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Migration Script│  3. Migration file created in
│  (Python code)  │     alembic/versions/
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Apply Migration │  4. Run alembic upgrade head
│  (Database DDL) │     to apply changes to database
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database Schema │  5. Database now reflects
│    Updated      │     your model changes
└─────────────────┘
```

### Key Concepts

1. **Migration Scripts** (alembic/versions/*.py)
   - Python files that describe schema changes
   - Each migration has a unique revision ID (hash)
   - Contains `upgrade()` and `downgrade()` functions

2. **Revision Chain**
   - Migrations are linked together in a chain
   - Each migration knows its parent (previous migration)
   - Example: `None → b5fa6c46 → ab52a8c0 → <next>`

3. **alembic_version Table**
   - Special table created by Alembic in your database
   - Stores the current migration version (revision ID)
   - Used to determine which migrations to apply

4. **env.py Configuration**
   - Located at `server/alembic/env.py`
   - Configures how Alembic connects to your database
   - Imports your SQLAlchemy models for auto-detection

---

## Project Setup

### Directory Structure

```
server/
├── alembic/                          # Alembic configuration
│   ├── versions/                     # Migration scripts
│   │   ├── b5fa6c4653db_initial_migration_users_table.py
│   │   └── ab52a8c0fcb8_add_workouts_table_with_foreign_key_to_.py
│   ├── env.py                        # Alembic environment config
│   ├── script.py.mako                # Migration template
│   └── README
├── alembic.ini                       # Alembic settings
├── app/
│   ├── db/
│   │   ├── base.py                   # ⭐ Imports all models (critical!)
│   │   └── session.py                # Database session management
│   └── features/
│       ├── auth/models/user.py       # User model
│       └── workouts/models/workout.py # Workout model
└── .env                              # Database connection string
```

### Critical Files

#### 1. `server/alembic/env.py` - Environment Configuration

```python
# This file tells Alembic:
# - How to connect to the database
# - Which models to track for changes
# - How to generate migrations

from app.db.base import Base  # ⭐ Imports ALL models via base.py
target_metadata = Base.metadata  # SQLAlchemy metadata for auto-detection
```

#### 2. `server/app/db/base.py` - Model Registry

```python
# ⭐ CRITICAL: Import ALL models here for Alembic to detect them
from app.db.session import Base

# Import all models so Alembic can auto-detect changes
from app.features.auth.models.user import User
from app.features.workouts.models.workout import Workout
# Add new models here as you create them!

# This makes Base.metadata aware of all tables
```

**Why is this important?**
- Alembic uses `Base.metadata` to know about all tables
- If you don't import a model in `base.py`, Alembic won't detect it
- Auto-generation will miss your new tables/columns

#### 3. `server/alembic.ini` - Alembic Configuration

```ini
[alembic]
script_location = alembic
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(rev)s_%%(slug)s

# Database URL is read from .env file (see env.py)
# sqlalchemy.url = postgresql://...  # Not used, configured in env.py
```

---

## Creating Migrations

### Workflow Overview

```bash
# 1. Modify or create SQLAlchemy models
# 2. Import model in app/db/base.py
# 3. Generate migration
# 4. Review migration script
# 5. Apply migration
```

### Step-by-Step: Creating a Migration

#### Step 1: Define/Modify Your Model

Let's say you want to add a new `Exercise` model:

```python
# server/app/features/exercises/models/exercise.py
from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base, TimestampMixin

class Exercise(Base, TimestampMixin):
    """Exercise template model."""
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), nullable=False)  # beginner, intermediate, advanced
    is_active = Column(Boolean, default=True, nullable=False)
```

#### Step 2: Register Model in base.py

**⭐ CRITICAL STEP - Don't skip this!**

```python
# server/app/db/base.py
from app.db.session import Base

# Existing imports
from app.features.auth.models.user import User
from app.features.workouts.models.workout import Workout

# ⭐ Add your new model import
from app.features.exercises.models.exercise import Exercise  # NEW!
```

#### Step 3: Generate Migration

```bash
cd server

# Auto-generate migration from model changes
uv run alembic revision --autogenerate -m "add exercises table"

# Output:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.autogenerate.compare] Detected added table 'exercises'
# Generating /path/to/server/alembic/versions/202601_0530_abc123def_add_exercises_table.py ... done
```

**What just happened?**
1. Alembic compared your SQLAlchemy models to the current database schema
2. Detected differences (new `exercises` table)
3. Generated a migration script with `upgrade()` and `downgrade()` functions

#### Step 4: Review the Generated Migration

```python
# server/alembic/versions/202601_0530_abc123def_add_exercises_table.py

"""add exercises table

Revision ID: abc123def
Revises: ab52a8c0fcb8
Create Date: 2026-01-05 05:30:00.123456
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'abc123def'
down_revision = 'ab52a8c0fcb8'  # Links to previous migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Apply migration - creates exercises table."""
    op.create_table(
        'exercises',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_exercises_name'), 'exercises', ['name'], unique=True)

def downgrade() -> None:
    """Rollback migration - drops exercises table."""
    op.drop_index(op.f('ix_exercises_name'), table_name='exercises')
    op.drop_table('exercises')
```

**Review Checklist:**
- ✅ Column types match your model
- ✅ Constraints are correct (PRIMARY KEY, UNIQUE, NOT NULL)
- ✅ Indexes are created where needed
- ✅ `downgrade()` correctly reverses `upgrade()`

#### Step 5: Apply the Migration

```bash
# Apply migration to database
uv run alembic upgrade head

# Output:
# INFO  [alembic.runtime.migration] Running upgrade ab52a8c0fcb8 -> abc123def, add exercises table
```

#### Step 6: Verify Migration

```bash
# Check current migration version
uv run alembic current

# Output:
# abc123def (head)

# Check database
docker exec workout-buddy-db psql -U dev -d workout_buddy_dev -c "\dt"
# Should show 'exercises' table

# View table structure
docker exec workout-buddy-db psql -U dev -d workout_buddy_dev -c "\d exercises"
```

---

## Running Migrations

### Basic Commands

```bash
# Show migration history
uv run alembic history

# Show current migration version
uv run alembic current

# Upgrade to latest version
uv run alembic upgrade head

# Upgrade one version at a time
uv run alembic upgrade +1

# Downgrade one version
uv run alembic downgrade -1

# Downgrade to specific version
uv run alembic downgrade abc123def

# Downgrade to initial state (DANGEROUS!)
uv run alembic downgrade base

# Show SQL without applying (dry run)
uv run alembic upgrade head --sql
```

### Migration in Different Environments

#### Local Development

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd server
uv run alembic upgrade head
```

#### CI/CD Pipeline

```yaml
# .github/workflows/ci-backend.yml
- name: Run migrations
  run: |
    cd server
    uv run alembic upgrade head
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

#### Production Deployment

```bash
# ⚠️ ALWAYS backup database first!
pg_dump -U user -d production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
cd server
uv run alembic upgrade head

# Verify success
uv run alembic current

# If something goes wrong, rollback:
# uv run alembic downgrade -1
```

---

## Common Scenarios

### Scenario 1: Adding a New Column to Existing Table

**Goal:** Add `avatar_url` column to `users` table (already exists in our schema, but let's see the process)

#### Step 1: Modify the Model

```python
# server/app/features/auth/models/user.py
class User(Base, TimestampMixin):
    __tablename__ = "users"

    # Existing columns...
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)

    # NEW: Add avatar column
    avatar_url = Column(String(500), nullable=True)  # NEW!
```

#### Step 2: Generate Migration

```bash
uv run alembic revision --autogenerate -m "add avatar_url to users"
```

#### Step 3: Review Generated Migration

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_url', sa.String(length=500), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'avatar_url')
```

#### Step 4: Apply Migration

```bash
uv run alembic upgrade head
```

---

### Scenario 2: Adding a New Table with Foreign Key

**Goal:** Add `exercise_logs` table that references `workouts`

#### Step 1: Create Model

```python
# server/app/features/workouts/models/exercise_log.py
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.session import Base, TimestampMixin

class ExerciseLog(Base, TimestampMixin):
    """Detailed log of each exercise set within a workout."""
    __tablename__ = "exercise_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workout_id = Column(UUID(as_uuid=True), ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    set_number = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    notes = Column(String(500), nullable=True)

    # Relationship
    workout = relationship("Workout", back_populates="exercise_logs")
```

#### Step 2: Update Parent Model (Optional)

```python
# server/app/features/workouts/models/workout.py
class Workout(Base, TimestampMixin):
    # ... existing columns ...

    # NEW: Add relationship
    exercise_logs = relationship("ExerciseLog", back_populates="workout", cascade="all, delete-orphan")
```

#### Step 3: Register in base.py

```python
# server/app/db/base.py
from app.features.workouts.models.exercise_log import ExerciseLog  # NEW!
```

#### Step 4: Generate Migration

```bash
uv run alembic revision --autogenerate -m "add exercise_logs table with foreign key to workouts"
```

#### Step 5: Review Migration

```python
def upgrade() -> None:
    op.create_table(
        'exercise_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('workout_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('set_number', sa.Integer(), nullable=False),
        sa.Column('reps', sa.Integer(), nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workout_id'], ['workouts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exercise_logs_workout_id'), 'exercise_logs', ['workout_id'], unique=False)
```

---

### Scenario 3: Renaming a Column

**Goal:** Rename `reps_count` to `total_reps` in `workouts` table

⚠️ **Warning:** Column renames are risky in production! Consider deprecation strategy.

#### Option A: Auto-generate (May create drop + add)

```bash
# Modify model first
# workouts.py: reps_count → total_reps

uv run alembic revision --autogenerate -m "rename reps_count to total_reps"
```

**Problem:** Alembic might generate:
```python
def upgrade():
    op.drop_column('workouts', 'reps_count')  # ❌ Data loss!
    op.add_column('workouts', sa.Column('total_reps', sa.Integer(), nullable=False))
```

#### Option B: Manual Rename (Recommended)

```bash
# Create empty migration
uv run alembic revision -m "rename reps_count to total_reps"
```

Edit migration manually:
```python
def upgrade() -> None:
    # Rename column (preserves data)
    op.alter_column('workouts', 'reps_count', new_column_name='total_reps')

def downgrade() -> None:
    op.alter_column('workouts', 'total_reps', new_column_name='reps_count')
```

---

### Scenario 4: Adding an Enum Type

**Goal:** Add `WorkoutStatus` enum (planned, in_progress, completed)

#### Step 1: Update Model

```python
# server/app/features/workouts/models/workout.py
import enum
from sqlalchemy import Enum

class WorkoutStatus(str, enum.Enum):
    """Workout status enum."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Workout(Base, TimestampMixin):
    # ... existing columns ...

    # NEW: Add status column
    status = Column(
        Enum(WorkoutStatus, name="workout_status_enum", create_type=True),
        default=WorkoutStatus.COMPLETED,
        nullable=False
    )
```

#### Step 2: Generate Migration

```bash
uv run alembic revision --autogenerate -m "add workout status enum"
```

#### Step 3: Review Migration

```python
def upgrade() -> None:
    # Create enum type
    workout_status_enum = postgresql.ENUM('planned', 'in_progress', 'completed', name='workout_status_enum')
    workout_status_enum.create(op.get_bind())

    # Add column using enum
    op.add_column('workouts', sa.Column('status', sa.Enum('planned', 'in_progress', 'completed', name='workout_status_enum'), nullable=False, server_default='completed'))

def downgrade() -> None:
    op.drop_column('workouts', 'status')
    # Drop enum type
    op.execute('DROP TYPE workout_status_enum')
```

---

### Scenario 5: Adding an Index

**Goal:** Add index on `workouts.created_at` for faster queries

#### Step 1: Update Model

```python
# server/app/features/workouts/models/workout.py
from sqlalchemy import Index

class Workout(Base, TimestampMixin):
    # ... columns ...

    # Add index (can be at class level)
    __table_args__ = (
        Index('ix_workouts_created_at', 'created_at'),
    )
```

#### Step 2: Generate Migration

```bash
uv run alembic revision --autogenerate -m "add index on workouts created_at"
```

#### Step 3: Migration (Auto-generated)

```python
def upgrade() -> None:
    op.create_index('ix_workouts_created_at', 'workouts', ['created_at'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_workouts_created_at', table_name='workouts')
```

---

### Scenario 6: Data Migration (Populating Data)

**Goal:** Add default exercises to `exercises` table after creating it

#### Step 1: Create Migration (Manual)

```bash
# Don't use --autogenerate for data migrations
uv run alembic revision -m "seed default exercises"
```

#### Step 2: Write Data Migration

```python
"""seed default exercises

Revision ID: def456ghi
Revises: abc123def
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy.dialects.postgresql import UUID
import uuid

revision = 'def456ghi'
down_revision = 'abc123def'

def upgrade() -> None:
    # Define table structure for data operations
    exercises_table = table(
        'exercises',
        column('id', UUID),
        column('name', sa.String),
        column('description', sa.String),
        column('difficulty', sa.String),
        column('is_active', sa.Boolean),
    )

    # Insert default exercises
    op.bulk_insert(
        exercises_table,
        [
            {
                'id': uuid.uuid4(),
                'name': 'Push-ups',
                'description': 'Classic upper body exercise',
                'difficulty': 'beginner',
                'is_active': True,
            },
            {
                'id': uuid.uuid4(),
                'name': 'Jump Rope',
                'description': 'Cardio exercise with rope',
                'difficulty': 'intermediate',
                'is_active': True,
            },
        ]
    )

def downgrade() -> None:
    # Delete seeded data
    op.execute("DELETE FROM exercises WHERE name IN ('Push-ups', 'Jump Rope')")
```

---

## Best Practices

### 1. Always Review Auto-Generated Migrations

```bash
# After generating migration
uv run alembic revision --autogenerate -m "description"

# ⭐ IMPORTANT: Open the file and review!
# Check: alembic/versions/<timestamp>_<slug>.py
```

**Why?**
- Alembic might not detect all changes (especially renames)
- Generated SQL might need optimization
- You might need to add data migrations

### 2. Import Models in base.py

```python
# ❌ BAD: Model not imported
# server/app/features/exercises/models/exercise.py exists
# But not imported in base.py
# Result: Alembic won't detect the new table!

# ✅ GOOD: Always import in base.py
# server/app/db/base.py
from app.features.exercises.models.exercise import Exercise
```

### 3. Use Descriptive Migration Messages

```bash
# ❌ BAD
uv run alembic revision --autogenerate -m "update"
uv run alembic revision --autogenerate -m "fix"
uv run alembic revision --autogenerate -m "changes"

# ✅ GOOD
uv run alembic revision --autogenerate -m "add avatar_url to users"
uv run alembic revision --autogenerate -m "create exercises table"
uv run alembic revision --autogenerate -m "add index on workouts created_at"
```

### 4. Test Migrations Locally First

```bash
# Create migration
uv run alembic revision --autogenerate -m "add new feature"

# Test upgrade
uv run alembic upgrade head

# Test downgrade (verify rollback works)
uv run alembic downgrade -1

# Test upgrade again
uv run alembic upgrade head

# ✅ Only then commit the migration file
git add alembic/versions/<new_migration>.py
git commit -m "feat(db): add new feature migration"
```

### 5. Never Modify Applied Migrations

```bash
# ❌ NEVER DO THIS:
# 1. Migration applied to production
# 2. You edit the migration file
# 3. Results: Database and code are out of sync!

# ✅ CORRECT APPROACH:
# Create a new migration to fix issues
uv run alembic revision --autogenerate -m "fix previous migration issue"
```

### 6. Backup Before Production Migrations

```bash
# ⚠️ ALWAYS backup before applying migrations in production
pg_dump -U user -d production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
uv run alembic upgrade head

# If something goes wrong:
# psql -U user -d production_db < backup_20260105_143000.sql
```

### 7. Use Transactions (Enabled by Default)

```python
# Alembic uses transactions by default
# If upgrade() fails, entire migration is rolled back

# For PostgreSQL, you can control this in alembic.ini:
# transaction_per_migration = true  # ✅ Recommended
```

### 8. Add Comments to Complex Migrations

```python
def upgrade() -> None:
    """
    Add workout_status column with default value.

    This migration:
    1. Creates enum type 'workout_status_enum'
    2. Adds status column with default='completed'
    3. Sets existing rows to 'completed' (via server_default)
    """
    # Create enum
    workout_status_enum = postgresql.ENUM(...)
    # ... rest of migration
```

### 9. Use Indexes for Foreign Keys

```python
# ✅ GOOD: Index on foreign key column
workout_id = Column(UUID, ForeignKey("workouts.id"), nullable=False, index=True)

# Or explicitly:
__table_args__ = (
    Index('ix_exercise_logs_workout_id', 'workout_id'),
)
```

### 10. Handle Nullable Columns Carefully

```python
# ❌ BAD: Adding non-nullable column to table with data
# Will fail if table has existing rows!
op.add_column('users', sa.Column('phone', sa.String(), nullable=False))

# ✅ GOOD: Add as nullable first, then populate, then make non-nullable
def upgrade() -> None:
    # Step 1: Add as nullable
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))

    # Step 2: Populate with default values (if needed)
    op.execute("UPDATE users SET phone = 'unknown' WHERE phone IS NULL")

    # Step 3: Make non-nullable
    op.alter_column('users', 'phone', nullable=False)
```

---

## Troubleshooting

### Problem 1: Alembic Can't Detect My New Model

**Symptom:**
```bash
uv run alembic revision --autogenerate -m "add exercises table"
# Output: INFO  [alembic.autogenerate.compare] Detected no changes
```

**Solution:**
```python
# Check: Is model imported in app/db/base.py?
# server/app/db/base.py

from app.features.exercises.models.exercise import Exercise  # ← Add this!
```

---

### Problem 2: Migration Fails with "relation already exists"

**Symptom:**
```bash
uv run alembic upgrade head
# ERROR: relation "users" already exists
```

**Cause:** Database already has the table (manual creation or previous migration)

**Solution A:** Mark migration as applied without running it
```bash
# Stamp database with migration ID
uv run alembic stamp b5fa6c4653db
```

**Solution B:** Drop table and rerun migration (development only!)
```bash
docker exec workout-buddy-db psql -U dev -d workout_buddy_dev -c "DROP TABLE users CASCADE;"
uv run alembic upgrade head
```

---

### Problem 3: Downgrade Fails

**Symptom:**
```bash
uv run alembic downgrade -1
# ERROR: Cannot drop table users because workout table depends on it
```

**Cause:** Foreign key constraint prevents table drop

**Solution:** Ensure `downgrade()` drops dependent tables first
```python
def downgrade() -> None:
    op.drop_table('workouts')  # Drop child first
    op.drop_table('users')     # Then parent
```

---

### Problem 4: Multiple Heads (Branched Migrations)

**Symptom:**
```bash
uv run alembic upgrade head
# ERROR: Multiple head revisions are present
```

**Cause:** Two migrations created from same parent (team collaboration)

**Solution:** Merge migrations
```bash
uv run alembic merge -m "merge migrations" abc123 def456
# Creates merge migration that resolves conflict
```

---

### Problem 5: Database Connection Errors

**Symptom:**
```bash
uv run alembic upgrade head
# ERROR: could not connect to server
```

**Solution:**
```bash
# 1. Check PostgreSQL is running
docker ps | grep workout-buddy-db

# 2. Check .env file has correct DATABASE_URL
cat server/.env | grep DATABASE_URL

# 3. Test connection manually
docker exec workout-buddy-db psql -U dev -d workout_buddy_dev -c "SELECT 1;"
```

---

## Quick Reference

### Essential Commands

```bash
# Generate migration from model changes
uv run alembic revision --autogenerate -m "description"

# Create empty migration (for manual edits)
uv run alembic revision -m "description"

# Apply all pending migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1

# Show current version
uv run alembic current

# Show migration history
uv run alembic history --verbose

# Show SQL without applying (dry run)
uv run alembic upgrade head --sql
```

### Migration File Template

```python
"""<description>

Revision ID: <auto-generated>
Revises: <parent-revision>
Create Date: <timestamp>
"""
from alembic import op
import sqlalchemy as sa

revision = '<auto-generated>'
down_revision = '<parent-revision>'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Apply schema changes."""
    pass

def downgrade() -> None:
    """Revert schema changes."""
    pass
```

---

## Additional Resources

- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **SQLAlchemy ORM**: https://docs.sqlalchemy.org/en/20/orm/
- **PostgreSQL Data Types**: https://www.postgresql.org/docs/current/datatype.html
- **Project Database Models**: [server/app/features/*/models/](../../server/app/features/)
- **Alembic Env Config**: [server/alembic/env.py](../../server/alembic/env.py)

---

**Questions or Issues?**
- Check [server/README.md](../../server/README.md) for project-specific setup
- Review existing migrations in [server/alembic/versions/](../../server/alembic/versions/)
- Test migrations in development before applying to production!
