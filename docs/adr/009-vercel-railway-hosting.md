# ADR-009: Vercel (Frontend) + Railway (Backend) for MVP Hosting

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, DevOps Engineer

## Context and Problem Statement

We need cost-effective, reliable hosting infrastructure for the MVP phase that can scale to support future growth. The solution must support automatic deployments from Git, provide excellent developer experience with minimal configuration, and keep operational costs low during the initial user acquisition phase (0-1000 users).

## Decision Drivers

* Must minimize hosting costs during MVP phase (<$50/month target)
* Must support automatic deployments from Git (CI/CD integration)
* Should provide zero-downtime deployments
* Must include HTTPS/SSL certificates automatically
* Should offer good monitoring and logging capabilities
* Must support preview deployments for pull requests (testing before merge)
* Should minimize DevOps overhead (focus on product development)
* Must be able to scale beyond MVP if product succeeds
* Should provide global CDN for frontend assets

## Considered Options

1. **Vercel (frontend) + Railway (backend + DB)** - Specialized platforms for each layer
2. **AWS (EC2 + RDS + S3 + CloudFront)** - Full control, enterprise-grade, complex setup
3. **Heroku** - All-in-one platform, easy but expensive ($25-100/month minimum)
4. **DigitalOcean App Platform** - Middle ground between complexity and simplicity
5. **Google Cloud Run** - Serverless containers with auto-scaling

## Decision

Use **Vercel for frontend hosting** and **Railway for backend + PostgreSQL database**

## Rationale

### Vercel for Frontend
* **Zero-Config Deployment:** Automatic detection of Vite/React projects
* **Global CDN:** 100+ edge locations worldwide for fast load times
* **Preview Deployments:** Every PR gets unique URL for testing
* **Free Tier:** 100GB bandwidth, unlimited deployments (sufficient for MVP)
* **DX Excellence:** Best developer experience for frontend deployments
* **Automatic Optimization:** Image optimization, code splitting, compression
* **Analytics:** Built-in web vitals and performance monitoring

### Railway for Backend + Database
* **Free Tier:** $5/month credit (covers MVP usage)
* **Managed PostgreSQL:** Automated backups, connection pooling
* **Auto Deploy:** Git push triggers deployment automatically
* **Environment Variables:** Secure secrets management
* **Logs & Monitoring:** Real-time logs and resource usage metrics
* **Easy Scaling:** Vertical scaling with slider (no config changes)
* **Docker Support:** Deploys from Dockerfile or buildpacks

### Combined Benefits
* **Total MVP Cost:** $0-50/month (vs $200-500/month on AWS)
* **Deployment Speed:** Seconds, not hours (vs 30-60 min AWS setup)
* **Zero Server Management:** No EC2 instances, load balancers, or VPC configuration
* **Instant SSL:** Automatic HTTPS certificates for all domains
* **Migration Path:** Easy to migrate to AWS/GCP later if needed

## Consequences

### Positive

* Minimal hosting costs during MVP validation phase ($5-20/month)
* Extremely fast deployment cycle (git push → live in 60 seconds)
* Automatic HTTPS/SSL certificates (no Let's Encrypt setup)
* Preview deployments for every PR (test before merging)
* Built-in monitoring and logging (no Datadog/Splunk needed)
* Global CDN included (frontend served from nearest edge location)
* Zero DevOps overhead (no server maintenance, patching, monitoring setup)
* Automatic database backups (Railway handles daily backups)
* One-click rollbacks (revert to previous deployment instantly)
* Focus 100% on product development (not infrastructure)

### Negative

* Vendor lock-in for both platforms (migration effort required later)
* Less control than AWS/GCP (can't customize server configuration)
* Free tier limitations (will need to upgrade at ~1000 active users)
* Limited customization of deployment pipeline (vs full AWS CodePipeline)
* Railway may have occasional cold starts (serverless architecture)
* Cannot use advanced AWS services (Lambda, SQS, etc.) easily
* Pricing becomes expensive at high scale (>10,000 users)
* Limited geographic regions for backend (vs AWS multi-region)

### Neutral

* Requires learning Vercel and Railway platforms (but minimal learning curve)
* Environment variables managed in web UI (not Infrastructure as Code)
* Database access limited to Railway CLI or connection string (no AWS RDS console)

## Migration Path

We acknowledge that Vercel + Railway are optimal for MVP but may need migration at scale:

### Phase 1: MVP (0-1,000 users)
* **Frontend:** Vercel Free/Hobby plan
* **Backend:** Railway Hobby plan ($5/month)
* **Database:** Railway PostgreSQL (shared)
* **Cost:** $5-20/month

### Phase 2: Growth (1,000-10,000 users)
* **Frontend:** Vercel Pro ($20/month) - increased bandwidth
* **Backend:** Railway Pro or migrate to AWS ECS Fargate
* **Database:** Railway Pro or AWS RDS PostgreSQL
* **Cost:** $100-300/month

### Phase 3: Scale (10,000-100,000 users)
* **Frontend:** Keep Vercel Enterprise or migrate to Cloudflare
* **Backend:** AWS ECS/EKS with auto-scaling
* **Database:** AWS RDS Multi-AZ with read replicas
* **Cost:** $500-2000/month

### Phase 4: Enterprise (100,000+ users)
* **Full AWS/GCP/Azure:** Kubernetes, microservices, multi-region
* **Cost:** $5,000+/month

## Mitigation Strategies

**Risk: Vendor lock-in makes migration difficult**
* **Mitigation:** Use Docker for backend (portable to any platform)
* Use standard PostgreSQL (easy database migration)
* Keep infrastructure as code in Git (docker-compose mirrors production)
* Document migration path to AWS/GCP in advance

**Risk: Costs spike unexpectedly at scale**
* **Mitigation:** Set up billing alerts on both platforms
* Monitor usage metrics weekly (bandwidth, database size, compute time)
* Plan migration to AWS/GCP before hitting 5,000 active users
* Keep Railway/Vercel cost comparison sheet updated

**Risk: Platform outages impact service**
* **Mitigation:** Both platforms have 99.9% SLA
* Implement health check endpoints for monitoring
* Set up status page (status.exercise-buddy.com)
* Have rollback plan ready (previous deployment)

**Risk: Limited customization blocks features**
* **Mitigation:** Design features to work within platform constraints
* Use serverless functions (Vercel Edge Functions) for edge logic
* Evaluate AWS migration if constraints become blocking

## Validation

### Success Criteria

* **Cost Efficiency:** Hosting costs <$50/month for first 1000 users
* **Deployment Speed:** Average deployment time <2 minutes
* **Uptime:** Achieve >99.5% uptime in first 3 months
* **Developer Satisfaction:** >80% of team prefers this setup over AWS
* **Time to Deploy:** New features deployed to production within 10 minutes of merge
* **Preview Deployments:** 100% of PRs have working preview URLs for testing

### Metrics to Track

* Monthly hosting costs (Vercel + Railway bills)
* Average deployment duration (git push to live)
* Deployment success rate (% successful deployments)
* Uptime percentage (use UptimeRobot or similar)
* Time to rollback (when needed)
* Developer time spent on DevOps tasks (should be <2 hours/month)

## Confidence Level

**High** (8/10)

Vercel and Railway are proven platforms used by thousands of startups. The risk of premature scaling issues is acceptable because:
* We can monitor usage and plan migration in advance
* Both platforms are reliable (backed by major VCs)
* Migration path to AWS/GCP is well-documented
* Cost savings during MVP phase ($150-400/month saved) far outweigh migration risk
* Many successful companies started on similar platforms (Vercel hosts Next.js, Railway hosts many YC companies)

The 2-point deduction accounts for eventual migration effort and vendor lock-in concerns.

## Related Decisions

* Related to [ADR-002](002-react-vite-frontend.md) - Vercel has first-class Vite support
* Related to [ADR-003](003-fastapi-backend.md) - Railway supports Python/FastAPI natively
* Related to [ADR-004](004-postgresql-database.md) - Railway provides managed PostgreSQL
* Related to [ADR-007](007-docker-containerization.md) - Railway deploys from Dockerfile
* Related to [ADR-005](005-monorepo-structure.md) - Separate deployments for client/server

## References

### Platform Documentation
* [Vercel Documentation](https://vercel.com/docs)
* [Railway Documentation](https://docs.railway.app/)
* [Vercel Pricing](https://vercel.com/pricing)
* [Railway Pricing](https://railway.app/pricing)

### Deployment Guides
* [Deploying Vite to Vercel](https://vercel.com/docs/frameworks/vite)
* [Deploying FastAPI to Railway](https://docs.railway.app/guides/fastapi)
* [Railway PostgreSQL Setup](https://docs.railway.app/databases/postgresql)

### Alternatives Research
* [AWS vs Vercel Cost Comparison](https://vercel.com/blog/vercel-vs-aws)
* [Heroku vs Railway Migration Guide](https://railway.app/heroku)

### Implementation
* Frontend deployment: [client/vercel.json](../../client/vercel.json) (if needed)
* Backend deployment: [server/railway.json](../../server/railway.json) (if needed)
* Environment variables documented in [.env.example](../../.env.example)
* Deployment workflow: [.github/workflows/deploy-production.yml](../../.github/workflows/deploy-production.yml)

### Monitoring
* Vercel Analytics: Built-in (Web Vitals, page views)
* Railway Logs: Built-in (application logs, metrics)
* Future: Add Sentry for error tracking (Phase 2)
