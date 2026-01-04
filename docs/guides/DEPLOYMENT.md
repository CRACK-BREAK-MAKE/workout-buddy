# Deployment Guide

**Version:** 1.0
**Last Updated:** 2026-01-03

---

## Overview

Workout Buddy uses a modern deployment stack optimized for MVP development:

* **Frontend:** Vercel (global CDN, automatic HTTPS)
* **Backend:** Railway (managed PostgreSQL, auto-deploy)
* **CI/CD:** GitHub Actions (automated testing + deployment)

See [ADR-009: Vercel + Railway Hosting](../adr/009-vercel-railway-hosting.md) for architectural decisions.

---

## Deployment Architecture

```
GitHub Repository (Main Branch)
       ↓
   GitHub Actions (CI/CD)
       ├─→ Test Frontend → Deploy to Vercel
       └─→ Test Backend → Deploy to Railway
                    ↓
            Production Environment
```

---

## Prerequisites

### 1. Vercel Account Setup

1. Sign up at [vercel.com](https://vercel.com/)
2. Install Vercel CLI: `npm install -g vercel`
3. Login: `vercel login`

### 2. Railway Account Setup

1. Sign up at [railway.app](https://railway.app/)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### 3. Environment Variables

Prepare production environment variables:

**Frontend (Vercel):**
```bash
VITE_API_URL=https://api.workout-buddy.com/api/v1
VITE_ENVIRONMENT=production
```

**Backend (Railway):**
```bash
DATABASE_URL=<railway-postgresql-connection-string>
SECRET_KEY=<generate-strong-random-key>
DEBUG=false
CORS_ORIGINS=["https://workout-buddy.com"]
```

---

## Initial Deployment

### Deploy Frontend to Vercel

```bash
cd client

# Deploy to Vercel (first time)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: workout-buddy
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Or use Vercel GitHub Integration:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from GitHub: `your-org/workout-buddy`
4. Set Root Directory: `client`
5. Add environment variables
6. Click "Deploy"

**Automatic Deployments:**
* Push to `main` → Production deployment
* Pull requests → Preview deployment (unique URL)

---

### Deploy Backend to Railway

```bash
cd server

# Login to Railway
railway login

# Initialize project
railway init

# Link to PostgreSQL
railway add postgresql

# Deploy backend
railway up

# Get DATABASE_URL
railway variables

# Set environment variables
railway variables set SECRET_KEY=<your-secret>
railway variables set DEBUG=false
railway variables set CORS_ORIGINS='["https://workout-buddy.com"]'
```

**Or use Railway GitHub Integration:**

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub"
3. Select repository: `your-org/workout-buddy`
4. Add PostgreSQL database
5. Set Root Directory: `server`
6. Add environment variables
7. Click "Deploy"

**Automatic Deployments:**
* Push to `main` → Automatic backend deployment
* Database migrations run automatically (if configured)

---

## Database Migrations

### Manual Migration (Railway)

```bash
# Connect to Railway project
railway link

# Run migrations
railway run alembic upgrade head

# OR use Railway CLI with environment
railway run bash
source .venv/bin/activate
alembic upgrade head
exit
```

### Automated Migrations (GitHub Actions)

Add to `.github/workflows/deploy-production.yml`:

```yaml
- name: Run database migrations
  run: |
    railway link <project-id>
    railway run alembic upgrade head
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## CI/CD Pipeline (GitHub Actions)

### Frontend Pipeline

**File:** `.github/workflows/ci-frontend.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: cd client && pnpm install

      - name: Run linters
        run: cd client && pnpm lint

      - name: Run tests
        run: cd client && pnpm test

      - name: Build
        run: cd client && pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
```

### Backend Pipeline

**File:** `.github/workflows/ci-backend.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.14'

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: cd server && uv sync --dev

      - name: Run linters
        run: cd server && uv run ruff check .

      - name: Run type checker
        run: cd server && uv run mypy app

      - name: Run tests
        run: cd server && uv run pytest --cov=app
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Required Secrets

Add to GitHub repository secrets (Settings → Secrets):

```
VERCEL_TOKEN          # From Vercel dashboard
VERCEL_ORG_ID         # From Vercel dashboard
VERCEL_PROJECT_ID     # From Vercel dashboard
RAILWAY_TOKEN         # From Railway dashboard
RAILWAY_PROJECT_ID    # From Railway dashboard
```

---

## Environment Configuration

### Production Environment Variables

**Frontend (Vercel Dashboard):**
```
VITE_API_URL=https://api.workout-buddy.com/api/v1
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=<sentry-dsn>  # Optional: Error tracking
```

**Backend (Railway Dashboard):**
```
DATABASE_URL=<railway-postgresql-url>  # Auto-provided by Railway
SECRET_KEY=<generate-256-bit-random-key>
DEBUG=false
CORS_ORIGINS=["https://workout-buddy.com","https://www.workout-buddy.com"]
LOG_LEVEL=info
SENTRY_DSN=<sentry-dsn>  # Optional: Error tracking
```

### Generating Secrets

```bash
# Generate SECRET_KEY (256-bit)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use OpenSSL
openssl rand -base64 32
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] CORS origins set to production domain
- [ ] SECRET_KEY is strong and unique
- [ ] DEBUG=false in production
- [ ] SSL/HTTPS certificates configured (automatic on Vercel/Railway)
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring/alerting set up
- [ ] Database backups enabled (Railway auto-backup)
- [ ] Rollback plan documented
- [ ] Load testing completed (100 concurrent users)

---

## Rollback Procedures

### Rollback Frontend (Vercel)

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or use Vercel dashboard (one-click rollback)
```

### Rollback Backend (Railway)

1. Go to Railway dashboard
2. Select deployment from history
3. Click "Redeploy"

**Database Rollback:**
```bash
railway link
railway run alembic downgrade -1  # Rollback one migration
```

---

## Monitoring & Logs

### Frontend Logs (Vercel)

```bash
# View deployment logs
vercel logs <deployment-url>

# Real-time logs
vercel logs --follow
```

**Or use Vercel Dashboard:**
* View deployment status
* Error logs
* Analytics (page views, web vitals)

### Backend Logs (Railway)

```bash
# View logs
railway logs

# Real-time logs
railway logs --follow
```

**Or use Railway Dashboard:**
* View application logs
* Database logs
* Resource usage metrics

---

## Cost Estimates

### MVP Phase (0-1,000 users)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Free | $0/month |
| **Railway** | Hobby | $5/month |
| **Total** | | **$5/month** |

### Growth Phase (1,000-10,000 users)

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Pro | $20/month |
| **Railway** | Pro | $20-50/month |
| **Total** | | **$40-70/month** |

See [ADR-009: Vercel + Railway Hosting](../adr/009-vercel-railway-hosting.md) for detailed cost analysis.

---

## Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to repository → Actions tab
2. Click failed workflow
3. Review error logs

**Common Issues:**
* Environment variables missing
* Tests failing
* Build errors (check dependencies)

### Backend Not Responding

```bash
# Check Railway status
railway status

# View logs
railway logs

# Restart service
railway restart
```

### Database Connection Issues

```bash
# Check DATABASE_URL
railway variables

# Test connection
railway run python -c "import psycopg2; conn = psycopg2.connect('$DATABASE_URL'); print('Connected!')"
```

### CORS Errors

Verify CORS_ORIGINS includes production domain:
```bash
railway variables get CORS_ORIGINS
# Should be: ["https://workout-buddy.com"]
```

---

## Additional Resources

* [Vercel Documentation](https://vercel.com/docs)
* [Railway Documentation](https://docs.railway.app/)
* [GitHub Actions Documentation](https://docs.github.com/actions)
* [ADR-009: Hosting Strategy](../adr/009-vercel-railway-hosting.md)

---

**Last Updated:** 2026-01-03
