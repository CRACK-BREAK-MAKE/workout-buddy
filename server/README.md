# Workout Buddy API - Backend

FastAPI backend with PostgreSQL, OAuth2 authentication, and feature-based architecture following SOLID principles.

## Tech Stack

- **Python:** 3.14.2
- **Framework:** FastAPI 0.128.0
- **Database:** PostgreSQL 18 (async with asyncpg)
- **ORM:** SQLAlchemy 2.0+ (async)
- **Migrations:** Alembic 1.14+
- **Authentication:** Google OAuth2 + JWT
- **Package Manager:** uv (10-100x faster than pip)

## Prerequisites

- Python 3.14+
- [uv](https://github.com/astral-sh/uv) package manager
- Docker & Docker Compose (for PostgreSQL)
- Google OAuth credentials (see below)

## Quick Start

### 1. Install uv (if not installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
```

### 2. Install Dependencies

```bash
cd server

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Install dependencies
uv pip install -e .
uv pip install -e ".[dev]"
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set required values:
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:7001/api/v1/auth/oauth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 5. Start Database (Docker)

```bash
# From project root
docker-compose up -d postgres

# Verify database is running
docker-compose ps
```

### 6. Run Database Migrations

```bash
# Generate initial migration
uv run alembic revision --autogenerate -m "Initial migration - users table"

# Apply migrations
uv run alembic upgrade head
```

### 7. Start Development Server

```bash
# Run with uvicorn
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 7001

# Or with Docker Compose (full stack)
docker-compose up backend
```

Server will be available at:
- **API:** http://localhost:7001
- **Docs:** http://localhost:7001/docs (Swagger UI)
- **ReDoc:** http://localhost:7001/redoc

## Project Structure

```
server/
├── app/
│   ├── core/                    # Core infrastructure
│   │   ├── config/              # Configuration (SRP)
│   │   │   ├── base_settings.py
│   │   │   ├── oauth_settings.py
│   │   │   └── security_settings.py
│   │   ├── security/            # Security utilities
│   │   │   ├── jwt_handler.py
│   │   │   └── password_handler.py
│   │   └── oauth/               # OAuth providers (DIP)
│   │       ├── provider_interface.py
│   │       ├── google_provider.py
│   │       └── oauth_factory.py
│   ├── db/                      # Database
│   │   ├── base.py
│   │   └── session.py
│   ├── features/                # Feature-based structure
│   │   └── auth/                # Authentication feature
│   │       ├── models/          # SQLAlchemy models
│   │       ├── schemas/         # Pydantic schemas
│   │       ├── repositories/    # Data access layer
│   │       ├── services/        # Business logic
│   │       └── routes/          # API endpoints
│   └── main.py                  # FastAPI app
├── alembic/                     # Database migrations
├── tests/                       # Test suite
├── .env.example                 # Environment template
├── pyproject.toml               # Dependencies
└── README.md                    # This file
```

## Development Commands

```bash
# Start dev server with auto-reload
uv run uvicorn app.main:app --reload --port 7001

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app --cov-report=html

# Lint code
uv run ruff check .

# Format code
uv run ruff format .

# Type checking
uv run mypy app

# Security scan
uv run bandit -r app

# Database migrations
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
uv run alembic downgrade -1
```

## API Endpoints

### Authentication

- `GET /api/v1/auth/oauth/google/login` - Initiate Google OAuth
- `GET /api/v1/auth/oauth/google/callback` - OAuth callback
- `POST /api/v1/auth/oauth/refresh` - Refresh access token
- `POST /api/v1/auth/oauth/logout` - Logout user
- `GET /api/v1/auth/oauth/me` - Get current user

### Health Check

- `GET /health` - Public health check

## Architecture Principles

This backend follows strict SOLID principles:

- **SRP** (Single Responsibility): Each file has ONE job
- **OCP** (Open/Closed): Factory pattern for OAuth providers
- **LSP** (Liskov Substitution): BaseRepository for all repos
- **ISP** (Interface Segregation): Small, focused interfaces
- **DIP** (Dependency Inversion): Depend on abstractions

See [BACKEND_IMPLEMENTATION_PLAN.md](../docs/guides/BACKEND_IMPLEMENTATION_PLAN.md) for detailed architecture.

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | localhost:5432 | Yes |
| `SECRET_KEY` | JWT signing key | - | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - | Yes |
| `FRONTEND_URL` | Frontend URL for redirects | http://localhost:7002 | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | ["http://localhost:7002"] | Yes |

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Migration Issues

```bash
# Check migration status
uv run alembic current

# View migration history
uv run alembic history

# Reset database (DANGER: deletes all data)
docker-compose down -v
docker-compose up -d postgres
uv run alembic upgrade head
```

### OAuth Issues

1. Verify Google OAuth credentials in `.env`
2. Check redirect URI matches exactly: `http://localhost:7001/api/v1/auth/oauth/google/callback`
3. Ensure frontend URL is correct in `.env`: `FRONTEND_URL=http://localhost:7002`

## Production Deployment

See [../docs/deployment/](../docs/deployment/) for production deployment guides.

## Testing

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/unit/test_jwt_handler.py

# Run with coverage
uv run pytest --cov=app --cov-report=html
open htmlcov/index.html

# Run integration tests only
uv run pytest tests/integration/
```

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

See [../LICENSE](../LICENSE) for license information.
