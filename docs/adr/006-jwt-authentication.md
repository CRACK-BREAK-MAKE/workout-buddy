# ADR-006: JWT-Based Authentication

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, Security Engineer

## Context and Problem Statement

Users need secure authentication to save workout history and access personal statistics across sessions and devices. The authentication system must be secure, scalable, and support future mobile applications.

## Decision Drivers

* Must support stateless architecture for horizontal scalability
* Must work across multiple devices (web, future mobile apps)
* Must be secure against common auth vulnerabilities
* Should not require database lookup on every request
* Should support future OAuth 2.0 integration (Google, GitHub)
* Must have token refresh mechanism

## Considered Options

1. **JWT (JSON Web Tokens)** - Stateless authentication with signed tokens
2. **Session-based** - Server-side session storage (Redis/database)
3. **OAuth 2.0 only** - Third-party auth only (Google, Facebook, GitHub)
4. **Magic Links** - Email-based passwordless authentication

## Decision

Use **JWT tokens** with refresh token rotation strategy, plus optional OAuth 2.0 providers for future expansion

## Rationale

* **Stateless:** No server-side session storage needed - reduces backend complexity
* **Scalable:** Works seamlessly across multiple backend instances without shared state
* **Mobile-Ready:** Easy to implement in future React Native mobile app
* **Standard:** Industry-standard approach (RFC 7519) with wide library support
* **Flexible:** Can add OAuth 2.0 as supplementary authentication method
* **Performance:** No database lookup on every request - just signature verification
* **Cross-Domain:** Works well with CORS for future subdomain architecture

## Consequences

### Positive

* Easy to scale horizontally (no shared session state required)
* Works well with CDN and load balancers
* Simple mobile app integration in future phases
* Fast authentication checks (cryptographic verification only)
* No database hit on every API request
* Tokens can carry user claims (reducing additional queries)
* Standard libraries available in all languages

### Negative

* Cannot revoke individual tokens before expiry (security concern)
* Tokens are larger than session IDs (bandwidth consideration)
* Need careful refresh token management strategy
* Token expiry management adds complexity
* Vulnerable if secret key is compromised

### Neutral

* Requires secure storage on client side (localStorage has XSS risk, httpOnly cookies preferred)
* Token payload visible (base64 encoded, not encrypted)

## Implementation Details

**Token Strategy:**
```
Access Token: Short-lived (15 minutes)
  - Stored in memory or httpOnly cookie
  - Contains user_id, email, permissions
  - Used for API authentication

Refresh Token: Long-lived (7 days)
  - Stored in httpOnly, secure cookie
  - Used to obtain new access tokens
  - Rotated on each use (refresh token rotation)
  - Can be revoked in database if needed
```

**Security Measures:**
* Access tokens expire quickly (15 minutes) to limit exposure
* Refresh token rotation prevents replay attacks
* HTTPS only (no token transmission over HTTP)
* httpOnly cookies prevent XSS access to tokens
* sameSite=strict prevents CSRF
* Sign tokens with HS256 (HMAC + SHA256) using strong secret
* Optional: Implement token blacklist (Redis) for immediate revocation if needed

## Mitigation Strategies

**Token revocation problem:**
* Short access token lifetime (15 minutes max)
* Implement refresh token rotation
* Use Redis for token blacklist (only if immediate revocation needed)
* Database stores refresh token hashes for revocation

**Token compromise risk:**
* Rotate secret keys periodically (every 90 days)
* Monitor for suspicious token usage patterns
* Implement rate limiting on authentication endpoints
* Use strong, randomly generated secrets (256-bit minimum)

**OAuth 2.0 integration path:**
* Phase 1 (MVP): Email/password authentication with JWT
* Phase 2: Add Google OAuth 2.0
* Phase 3: Add GitHub and Discord OAuth providers
* Keep JWT as fallback for all OAuth users

## Validation

**Success Criteria:**

* Zero password storage vulnerabilities (use Argon2/bcrypt)
* Token validation <5ms (cryptographic verification)
* Support 10,000+ concurrent authenticated users
* Zero session management database queries per request
* Successful penetration testing (third-party audit)

## Confidence Level

**High** (8/10)

JWT is proven at scale by major companies. The short access token lifetime mitigates most revocation concerns. For immediate revocation (account compromise), we can add Redis blacklist if needed in production.

## Related Decisions

* Related to [ADR-003](003-fastapi-backend.md) - FastAPI JWT implementation
* Related to [ADR-004](004-postgresql-database.md) - User storage and refresh tokens
* Related to [ADR-002](002-react-vite-frontend.md) - Client-side token management

## References

* [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
* [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
* [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
* [python-jose Documentation](https://python-jose.readthedocs.io/)
* Implementation: [server/app/core/security.py](../../server/app/core/security.py)
