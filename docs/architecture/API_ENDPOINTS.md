# API Endpoints

**Version:** 1.0
**Last Updated:** 2026-01-03
**Base URL:** `/api/v1`
**Framework:** FastAPI 0.128+
**Authentication:** JWT Bearer Token

---

## Overview

The Workout Buddy REST API follows RESTful conventions and provides endpoints for user authentication, workout tracking, and statistics retrieval. All endpoints return JSON responses and use standard HTTP status codes.

### API Principles

* **Versioned API:** All endpoints prefixed with `/api/v1` for future-proofing
* **RESTful Design:** Standard HTTP methods (GET, POST, PUT, DELETE)
* **JWT Authentication:** Bearer token authentication for protected endpoints
* **Consistent Responses:** Standardized error/success response format
* **Auto-Documentation:** Swagger UI at `/docs` and ReDoc at `/redoc`
* **CORS Enabled:** Configured for frontend domain (production-only)

### Base URLs

| Environment | Base URL |
|-------------|----------|
| Local Development | `http://localhost:8000/api/v1` |
| Staging | `https://api-staging.workout-buddy.com/api/v1` |
| Production | `https://api.workout-buddy.com/api/v1` |

---

## Authentication

All authentication endpoints are **public** (no token required).

### POST `/api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
* `email`: Valid email format (validated by Pydantic EmailStr)
* `username`: 3-50 characters, alphanumeric + underscores/hyphens
* `password`: Minimum 8 characters (hashed with bcrypt)

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "username": "john_doe",
  "is_active": true,
  "created_at": "2026-01-03T10:30:00Z"
}
```

**Error Responses:**
* `400 Bad Request` - Validation error (email/username format invalid)
* `409 Conflict` - Email or username already exists

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

---

### POST `/api/v1/auth/login`

Login with credentials and receive JWT access token.

**Request Body:**
```json
{
  "username": "john@example.com",
  "password": "SecurePass123!"
}
```

**Note:** `username` field accepts either email OR username.

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Token Details:**
* `access_token`: Short-lived token (15 minutes) for API requests
* `refresh_token`: Long-lived token (7 days) for renewing access token
* `expires_in`: Access token expiration time in seconds

**Error Responses:**
* `401 Unauthorized` - Invalid credentials
* `403 Forbidden` - Account is deactivated (`is_active=false`)

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### POST `/api/v1/auth/refresh`

Refresh an expired access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Note:** Refresh token rotation is implemented - old refresh token is invalidated, new one issued.

**Error Responses:**
* `401 Unauthorized` - Invalid or expired refresh token

---

## Users

All user endpoints require JWT authentication.

**Authentication Header:**
```
Authorization: Bearer <access_token>
```

### GET `/api/v1/users/me`

Get current authenticated user's profile.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "username": "john_doe",
  "is_active": true,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T10:30:00Z"
}
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

---

### PUT `/api/v1/users/me`

Update current user's profile (full update).

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "username": "new_username"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newemail@example.com",
  "username": "new_username",
  "is_active": true,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T15:45:00Z"
}
```

**Error Responses:**
* `400 Bad Request` - Validation error
* `401 Unauthorized` - Missing or invalid token
* `409 Conflict` - Email or username already taken

---

### DELETE `/api/v1/users/me`

Delete current user's account (soft delete - sets `is_active=false`).

**Response (204 No Content):**
```
(empty response body)
```

**Note:** User's workouts are CASCADE deleted from database.

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token

---

## Workouts

All workout endpoints require JWT authentication.

### POST `/api/v1/workouts`

Save a completed workout session.

**Request Body:**
```json
{
  "exercise_type": "push-up",
  "reps_count": 25,
  "duration_seconds": 180,
  "calories_burned": 12.5
}
```

**Validation Rules:**
* `exercise_type`: Must be one of: `"push-up"`, `"jump-rope"`
* `reps_count`: Integer >= 0
* `duration_seconds`: Integer >= 0
* `calories_burned`: Float >= 0 (optional)

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise_type": "push-up",
  "reps_count": 25,
  "duration_seconds": 180,
  "calories_burned": 12.5,
  "created_at": "2026-01-03T16:20:00Z"
}
```

**Error Responses:**
* `400 Bad Request` - Validation error (invalid exercise_type, negative values)
* `401 Unauthorized` - Missing or invalid token

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/workouts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_type": "push-up",
    "reps_count": 25,
    "duration_seconds": 180,
    "calories_burned": 12.5
  }'
```

---

### GET `/api/v1/workouts`

Get current user's workout history (paginated).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Number of records to skip (pagination offset) |
| `limit` | integer | 20 | Maximum number of records to return |
| `exercise_type` | string | null | Filter by exercise type (`push-up`, `jump-rope`) |

**Response (200 OK):**
```json
{
  "total": 145,
  "skip": 0,
  "limit": 20,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "exercise_type": "push-up",
      "reps_count": 25,
      "duration_seconds": 180,
      "calories_burned": 12.5,
      "created_at": "2026-01-03T16:20:00Z"
    },
    ...
  ]
}
```

**Sorting:** Results are ordered by `created_at DESC` (newest first).

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token

**Example:**
```bash
# Get page 2 (skip first 20 workouts)
curl -X GET "http://localhost:8000/api/v1/workouts?skip=20&limit=20" \
  -H "Authorization: Bearer <access_token>"

# Filter by exercise type
curl -X GET "http://localhost:8000/api/v1/workouts?exercise_type=push-up" \
  -H "Authorization: Bearer <access_token>"
```

---

### GET `/api/v1/workouts/:id`

Get a specific workout by ID.

**Path Parameters:**
* `id` (UUID) - Workout identifier

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise_type": "push-up",
  "reps_count": 25,
  "duration_seconds": 180,
  "calories_burned": 12.5,
  "created_at": "2026-01-03T16:20:00Z"
}
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token
* `403 Forbidden` - Workout belongs to a different user
* `404 Not Found` - Workout ID does not exist

---

### DELETE `/api/v1/workouts/:id`

Delete a workout by ID.

**Path Parameters:**
* `id` (UUID) - Workout identifier

**Response (204 No Content):**
```
(empty response body)
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token
* `403 Forbidden` - Workout belongs to a different user
* `404 Not Found` - Workout ID does not exist

---

## Statistics

All statistics endpoints require JWT authentication and return data for the current user only.

### GET `/api/v1/statistics/summary`

Get overall workout statistics (all time).

**Response (200 OK):**
```json
{
  "total_workouts": 145,
  "total_reps": 3625,
  "total_duration_seconds": 26100,
  "total_calories_burned": 1812.5,
  "average_reps_per_workout": 25,
  "personal_records": {
    "push-up": 50,
    "jump-rope": 200
  },
  "workout_count_by_type": {
    "push-up": 80,
    "jump-rope": 65
  }
}
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token

---

### GET `/api/v1/statistics/weekly`

Get workout statistics for the last 7 days, grouped by day.

**Response (200 OK):**
```json
{
  "period": "last_7_days",
  "start_date": "2025-12-28",
  "end_date": "2026-01-03",
  "daily_stats": [
    {
      "date": "2026-01-03",
      "total_workouts": 2,
      "total_reps": 50,
      "total_duration_seconds": 360,
      "total_calories_burned": 25.0
    },
    {
      "date": "2026-01-02",
      "total_workouts": 3,
      "total_reps": 75,
      "total_duration_seconds": 540,
      "total_calories_burned": 37.5
    },
    ...
  ]
}
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token

---

### GET `/api/v1/statistics/exercise/:type`

Get statistics for a specific exercise type.

**Path Parameters:**
* `type` (string) - Exercise type: `push-up` or `jump-rope`

**Response (200 OK):**
```json
{
  "exercise_type": "push-up",
  "total_workouts": 80,
  "total_reps": 2000,
  "average_reps_per_workout": 25,
  "personal_record": 50,
  "last_workout": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "reps_count": 25,
    "duration_seconds": 180,
    "created_at": "2026-01-03T16:20:00Z"
  }
}
```

**Error Responses:**
* `400 Bad Request` - Invalid exercise type
* `401 Unauthorized` - Missing or invalid token

---

## Health Check

### GET `/health`

Public health check endpoint (no authentication required).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-03T17:00:00Z"
}
```

**Use Case:** Used by Railway, monitoring services, and load balancers to verify API is running.

---

### GET `/api/v1/health`

Detailed health check (requires authentication).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2026-01-03T17:00:00Z"
}
```

**Error Responses:**
* `401 Unauthorized` - Missing or invalid token
* `503 Service Unavailable` - Database connection failed

---

## Error Response Format

All API errors follow a consistent format:

```json
{
  "detail": "Error message here",
  "status_code": 400,
  "timestamp": "2026-01-03T17:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET/PUT request |
| `201` | Created | Successful POST request (resource created) |
| `204` | No Content | Successful DELETE request |
| `400` | Bad Request | Validation error, malformed request |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (email/username already exists) |
| `422` | Unprocessable Entity | Semantic validation error (Pydantic) |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Database or external service down |

---

## Rate Limiting

**MVP Phase:** No rate limiting implemented.

**Production Phase (Future):**
* Login endpoint: 5 requests per minute per IP
* Registration endpoint: 3 requests per hour per IP
* All other endpoints: 100 requests per minute per user

---

## CORS Configuration

**Development:**
```python
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000"   # Alternative dev port
]
```

**Production:**
```python
CORS_ORIGINS = [
    "https://exercise-buddy.com",
    "https://www.exercise-buddy.com"
]
```

---

## Auto-Generated Documentation

FastAPI automatically generates interactive API documentation:

* **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **OpenAPI JSON:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

Use Swagger UI to test endpoints directly in the browser (includes auth token support).

---

## Testing API Endpoints

### Using cURL

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' | jq -r '.access_token')

# Get user profile
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Create workout
curl -X POST http://localhost:8000/api/v1/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exercise_type":"push-up","reps_count":25,"duration_seconds":180,"calories_burned":12.5}'
```

### Using Postman

1. Import OpenAPI spec: `http://localhost:8000/openapi.json`
2. Set environment variable `base_url` = `http://localhost:8000`
3. Add auth token to Authorization header automatically via collection settings

---

## References

* [ADR-003: FastAPI Backend](../adr/003-fastapi-backend.md)
* [ADR-006: JWT Authentication](../adr/006-jwt-authentication.md)
* [Database Schema](DATABASE_SCHEMA.md)
* [FastAPI Documentation](https://fastapi.tiangolo.com/)
* [REST API Best Practices](https://restfulapi.net/)

---

**Last Updated:** 2026-01-03
**Maintained By:** Exercise Buddy Development Team
