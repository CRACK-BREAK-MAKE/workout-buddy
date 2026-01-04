---
name: docker-setup
description: Set up Docker containers for local development with PostgreSQL, frontend, backend, and docker-compose configuration. Use when user asks to dockerize the app or set up containers.
allowed-tools: Write, Read, Edit, Bash
---

# Docker Setup Skill

Configure Docker containers for local development environment.

## Container Architecture

```
exercise-buddy/
├── client/          → React frontend (Node 24 LTS)
├── server/          → FastAPI backend (Python 3.14.2)
└── postgres/        → PostgreSQL 18.1 database
```

## Docker Files to Create

### 1. Frontend Dockerfile

`client/Dockerfile`:
```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

`client/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # React Router support (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional, for development)
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Backend Dockerfile

`server/Dockerfile`:
```dockerfile
FROM python:3.14.2-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv (fast package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy dependency files
COPY pyproject.toml ./

# Install Python dependencies with uv
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run migrations and start server
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Docker Compose for Development

`docker-compose.yml`:
```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:18.1-alpine
    container_name: exercise-buddy-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-dev}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpass}
      POSTGRES_DB: ${POSTGRES_DB:-exercise_counter_dev}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: exercise-buddy-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-dev}:${POSTGRES_PASSWORD:-devpass}@postgres:5432/${POSTGRES_DB:-exercise_counter_dev}
      SECRET_KEY: ${SECRET_KEY:-dev-secret-change-in-production}
      DEBUG: ${DEBUG:-true}
      CORS_ORIGINS: '["http://localhost:5173", "http://localhost:80"]'
    ports:
      - "8000:8000"
    volumes:
      - ./server:/app
      - backend_cache:/app/.venv
    command: sh -c "
      .venv/bin/alembic upgrade head &&
      .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
      "
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # React Frontend (Development)
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    container_name: exercise-buddy-web
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
      VITE_ENVIRONMENT: development
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules
    command: pnpm dev --host

volumes:
  postgres_data:
    driver: local
  backend_cache:
    driver: local

networks:
  default:
    name: exercise-buddy-network
```

### 4. Frontend Development Dockerfile

`client/Dockerfile.dev`:
```dockerfile
FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
```

### 5. Environment Variables

`.env` (create from `.env.example`):
```bash
# PostgreSQL
POSTGRES_USER=dev
POSTGRES_PASSWORD=devpass
POSTGRES_DB=exercise_counter_dev

# Backend
SECRET_KEY=dev-secret-key-change-in-production-use-openssl-rand-hex-32
DEBUG=true

# Frontend (automatically read by Vite)
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
```

### 6. Docker Ignore Files

`client/.dockerignore`:
```
node_modules
dist
.git
.env
.env.local
*.log
coverage
```

`server/.dockerignore`:
```
.venv
__pycache__
*.pyc
.git
.env
*.log
.pytest_cache
htmlcov
```

## Usage Commands

### Initial Setup
```bash
# Create .env file
cp .env.example .env

# Build and start all containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check container status
docker-compose ps
```

### Development Workflow
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend bash
docker-compose exec postgres psql -U dev -d exercise_counter_dev

# Run migrations
docker-compose exec backend .venv/bin/alembic upgrade head

# Run tests
docker-compose exec backend .venv/bin/pytest
docker-compose exec frontend pnpm test
```

### Database Operations
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U dev -d exercise_counter_dev

# Backup database
docker-compose exec postgres pg_dump -U dev exercise_counter_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U dev -d exercise_counter_dev < backup.sql

# Reset database
docker-compose down -v  # Warning: deletes all data!
docker-compose up -d
```

### Maintenance
```bash
# Remove stopped containers
docker-compose down

# Remove containers and volumes (fresh start)
docker-compose down -v

# View resource usage
docker stats

# Clean up unused images/volumes
docker system prune -a --volumes
```

## Production Dockerfile (Backend)

`server/Dockerfile.prod`:
```dockerfile
FROM python:3.14.2-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy and install dependencies
COPY pyproject.toml ./
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install -e .

# Copy application
COPY . .

# Production stage
FROM python:3.14.2-slim

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run with Gunicorn for production
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
```

## Docker Compose for Production

`docker-compose.prod.yml`:
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:18.1-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile.prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      DEBUG: false
      CORS_ORIGINS: ${CORS_ORIGINS}
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: ${VITE_API_URL}

volumes:
  postgres_data:
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
lsof -i :8000
lsof -i :5432

# Rebuild container
docker-compose up -d --build backend
```

### Database connection issues
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U dev -d exercise_counter_dev

# Check environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### Hot reload not working
```bash
# Ensure volumes are mounted correctly
docker-compose ps

# Restart container
docker-compose restart frontend
```

## Health Checks

### Backend Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"1.0.0"}
```

### Frontend Health Check
```bash
curl http://localhost:5173
# Expected: HTML content
```

### Database Health Check
```bash
docker-compose exec postgres pg_isready -U dev
# Expected: postgres:5432 - accepting connections
```

## Best Practices

✅ **DO:**
- Use multi-stage builds for smaller images
- Set health checks for all services
- Use named volumes for data persistence
- Run containers as non-root user in production
- Use .dockerignore to exclude unnecessary files
- Set resource limits in production

❌ **DON'T:**
- Commit .env files to Git
- Run as root in production
- Use `latest` tags in production
- Store secrets in Dockerfiles
- Expose database ports in production

## Verification

After Docker setup:
- [ ] All containers start successfully
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API accessible at http://localhost:8000
- [ ] API docs at http://localhost:8000/docs
- [ ] Database migrations run successfully
- [ ] Hot reload works for both frontend and backend
- [ ] Health checks pass for all services
