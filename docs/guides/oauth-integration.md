# OAuth Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Model](#security-model)
4. [Implementation Guide](#implementation-guide)
5. [Token Management](#token-management)
6. [Error Handling](#error-handling)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Considerations](#deployment-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

This guide documents the OAuth 2.0 authentication implementation for Workout Buddy, using Google as the OAuth provider. The implementation follows industry best practices for secure token management, automatic token refresh, and comprehensive error handling.

### Key Features

- ✅ **Google OAuth 2.0** integration
- ✅ **Cookie-based refresh tokens** (httpOnly, secure, XSS-proof)
- ✅ **Automatic token refresh** on 401 errors with request queueing
- ✅ **Token rotation** for enhanced security
- ✅ **CSRF protection** via SameSite cookies
- ✅ **Production-grade error handling** with user-friendly messages
- ✅ **Feature-based architecture** following SOLID principles

### Tech Stack

**Frontend:**
- React 19.2.0 + TypeScript 5.9.3
- React Router 7.11.0 (client-side routing)
- Zustand 5.0.9 (state management)
- Axios 1.13.2 (HTTP client)

**Backend:**
- FastAPI 0.128.0 (Python 3.14.2)
- PostgreSQL 18.1 (user storage)
- python-jose (JWT generation/validation)
- Authlib 1.4.0+ (OAuth integration)

---

## Architecture

### High-Level Flow

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ 1. User clicks "Login with Google"
       ▼
┌─────────────────┐
│ LoginPage.tsx   │
│ calls:          │
│ loginWithGoogle()│
└──────┬──────────┘
       │ 2. Redirect to backend
       ▼
┌──────────────────────────┐
│  FastAPI Backend         │
│  /api/v1/auth/oauth/     │
│  google/login            │
└──────┬───────────────────┘
       │ 3. Redirect to Google OAuth
       ▼
┌─────────────────┐
│  Google OAuth   │
│  Consent Screen │
└──────┬──────────┘
       │ 4. User grants permissions
       ▼
┌──────────────────────────┐
│  FastAPI Backend         │
│  /api/v1/auth/oauth/     │
│  google/callback         │
│                          │
│  - Exchange code for     │
│    Google tokens         │
│  - Create/update user    │
│  - Generate JWT tokens   │
│  - Set refresh token in  │
│    httpOnly cookie       │
└──────┬───────────────────┘
       │ 5. Redirect to frontend with access token in URL
       ▼
┌──────────────────────────┐
│  Frontend Callback       │
│  /auth/callback?token=   │
│                          │
│  - Extract access token  │
│  - Fetch user profile    │
│  - Save to state/storage │
│  - Redirect to dashboard │
└──────────────────────────┘
```

### Directory Structure

```
client/src/features/auth/
├── components/           # UI components (none for MVP)
├── hooks/
│   └── useAuth.ts       # Auth hook (wrapper around store)
├── services/
│   └── authService.ts   # OAuth business logic (API orchestration)
├── store/
│   └── authStore.ts     # Zustand state management
├── utils/
│   ├── tokenStorage.ts      # localStorage operations (access token)
│   ├── tokenRefresh.ts      # Automatic refresh logic + queueing
│   └── tokenValidation.ts   # JWT decoding + expiration checks
├── types/
│   └── auth.types.ts    # TypeScript interfaces
└── constants/
    └── auth.constants.ts # API endpoints, config

client/src/shared/utils/
├── apiClient.ts         # Axios instance with interceptors
└── logger.ts            # Structured logging utility

client/src/pages/
├── LoginPage.tsx        # Login UI with Google button
├── AuthCallbackPage.tsx # OAuth callback handler
└── HomePage.tsx         # Protected dashboard
```

---

## Security Model

### Token Strategy

#### Access Token (Short-lived)
- **Lifetime**: 15 minutes
- **Storage**: localStorage (key: `workout_buddy_access_token`)
- **Transport**: Authorization header (`Bearer <token>`)
- **Purpose**: Authenticate API requests
- **Rotation**: Issued on login + every refresh

**Why localStorage?**
- React doesn't expose httpOnly cookies to JS (by design)
- Access tokens are short-lived (15 min), limiting exposure window
- React escapes all content by default, preventing XSS
- Alternative (storing in memory only) loses auth on page refresh

#### Refresh Token (Long-lived)
- **Lifetime**: 7 days
- **Storage**: httpOnly cookie (backend-managed)
- **Transport**: Automatically sent by browser with credentials
- **Purpose**: Generate new access tokens without re-login
- **Rotation**: New refresh token issued on every refresh (rotation strategy)

**Why httpOnly cookie?**
- **XSS-proof**: JavaScript cannot access httpOnly cookies
- **Automatic**: Browser sends cookie automatically (withCredentials: true)
- **CSRF-proof**: SameSite=Lax prevents cross-site attacks
- **Token rotation**: Old refresh token invalidated on use

### Cookie Attributes

```python
# Backend sets refresh token cookie with these attributes
response.set_cookie(
    key="refresh_token",
    value=tokens.refresh_token,
    max_age=7 * 24 * 60 * 60,  # 7 days
    httponly=True,              # No JavaScript access (XSS protection)
    secure=False,               # True in production (HTTPS only)
    samesite="lax",             # CSRF protection
    domain=None,                # Same domain only
    path="/",                   # All paths
)
```

### Attack Prevention

| Attack Vector | Mitigation | Implementation |
|--------------|------------|----------------|
| **XSS (Cross-Site Scripting)** | Refresh token in httpOnly cookie | React escapes content, no `dangerouslySetInnerHTML` |
| **CSRF (Cross-Site Request Forgery)** | SameSite=Lax cookies | Cookie attribute + JWT validation |
| **Token Theft** | Short-lived access tokens (15 min) | JWT expiration enforced |
| **Replay Attacks** | Token rotation on refresh | Old refresh token invalidated |
| **Man-in-the-Middle** | HTTPS only in production | `secure=True` cookie attribute |
| **Session Fixation** | New tokens on every login | Backend generates fresh tokens |

---

## Implementation Guide

### Step 1: Backend OAuth Endpoints

The backend provides three OAuth endpoints:

#### 1. Initiate Login (`GET /api/v1/auth/oauth/google/login`)

**Purpose**: Redirects user to Google consent screen

**Code**: [server/app/features/auth/routes/oauth_routes.py](../../server/app/features/auth/routes/oauth_routes.py)

```python
@router.get("/oauth/{provider}/login")
async def oauth_login(provider: str):
    """Redirect to Google OAuth consent screen"""
    redirect_uri = f"{settings.BACKEND_URL}/api/v1/auth/oauth/{provider}/callback"

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri,
        scope="openid email profile"
    )
```

#### 2. Handle Callback (`GET /api/v1/auth/oauth/google/callback`)

**Purpose**: Exchange authorization code for tokens, create user, redirect to frontend

**Flow**:
1. Exchange code for Google tokens
2. Fetch user info from Google
3. Create/update user in database
4. Generate JWT access + refresh tokens
5. Set refresh token in httpOnly cookie
6. Redirect to frontend with access token in URL

```python
@router.get("/oauth/{provider}/callback")
async def oauth_callback(provider: str, request: Request, response: Response):
    """Handle OAuth callback from Google"""
    # Exchange code for Google tokens
    token = await oauth.google.authorize_access_token(request)

    # Get user info from Google
    user_info = token.get("userinfo")

    # Create/update user in database
    user = await user_service.create_or_update_oauth_user(
        provider=provider,
        provider_user_id=user_info["sub"],
        email=user_info["email"],
        full_name=user_info.get("name"),
        username=user_info.get("preferred_username") or user_info["email"].split("@")[0]
    )

    # Generate JWT tokens
    tokens, expires_in = token_service.create_tokens_for_user(user.id)

    # Set refresh token in httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=False,  # True in production
        samesite="lax",
    )

    # Redirect to frontend with access token
    frontend_callback_url = f"{settings.FRONTEND_URL}/auth/callback?token={tokens.access_token}"
    return RedirectResponse(url=frontend_callback_url)
```

#### 3. Refresh Token (`POST /api/v1/auth/oauth/refresh`)

**Purpose**: Generate new access token using refresh token from cookie

**Flow**:
1. Read refresh token from httpOnly cookie
2. Validate refresh token (JWT signature + expiration)
3. Generate new access token + refresh token
4. Update refresh token cookie (rotation)
5. Return new access token in response body

```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    response: Response,
    token_service: TokenService = Depends(get_token_service),
) -> TokenResponse:
    # Read refresh token from httpOnly cookie
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing. Please log in again.",
        )

    # Validate and generate new tokens
    user_id = token_service.validate_refresh_token(refresh_token)
    tokens, expires_in = token_service.create_tokens_for_user(user_id)

    # Set new refresh token in httpOnly cookie (rotation)
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return TokenResponse(
        access_token=tokens.access_token,
        token_type="bearer",
        expires_in=expires_in,
    )
```

### Step 2: Frontend Setup

#### 2.1 Configure Axios with Credentials

**File**: [client/src/shared/utils/apiClient.ts](../../client/src/shared/utils/apiClient.ts)

```typescript
export const apiClient = axios.create({
  baseURL: API_CONFIG.SERVER_URL,  // http://localhost:7001/api/v1
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // ⚠️ CRITICAL: Enables sending httpOnly cookies
});
```

**Why `withCredentials: true`?**
- Tells browser to send cookies with cross-origin requests
- Required for httpOnly refresh token cookie to be sent to backend
- Without this, refresh endpoint will always fail with 401

#### 2.2 Request Interceptor (Inject Access Token)

```typescript
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();  // Read from localStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

#### 2.3 Response Interceptor (Auto-Refresh on 401)

```typescript
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token and get new access token
        const accessToken = await handleTokenRefresh(apiClient, () => {
          // On refresh failure: clear auth and redirect to login
          removeAccessToken();
          clearAuthToken();
          window.location.href = '/login';
        });

        // Update request with new token and retry
        setAuthToken(accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Extract error message from backend
    const errorMessage = error.response?.data?.detail || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);
```

### Step 3: Token Refresh with Queue Management

**File**: [client/src/features/auth/utils/tokenRefresh.ts](../../client/src/features/auth/utils/tokenRefresh.ts)

**Problem**: If 10 API calls fail with 401 simultaneously, we don't want 10 concurrent refresh requests.

**Solution**: Queue pattern - only one refresh at a time, others wait in queue.

```typescript
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

export const handleTokenRefresh = async (
  axiosInstance: AxiosInstance,
  onAuthFailure: () => void
): Promise<string> => {
  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Call refresh endpoint (refresh token sent automatically via cookie)
    const accessToken = await refreshAccessToken(axiosInstance);

    // Save new access token
    saveAccessToken(accessToken);

    // Resolve all queued requests with new token
    processQueue(null, accessToken);

    return accessToken;
  } catch (error) {
    // Refresh failed - reject all queued requests and trigger logout
    processQueue(error as Error, null);
    onAuthFailure();
    throw error;
  } finally {
    isRefreshing = false;
  }
};
```

**Flow**:
1. Request A gets 401 → starts refresh (isRefreshing = true)
2. Request B gets 401 → queued (waits for Request A's refresh)
3. Request C gets 401 → queued (waits for Request A's refresh)
4. Request A completes refresh → all queued requests get new token
5. All queued requests retry with new token

### Step 4: OAuth Callback Handler

**File**: [client/src/pages/AuthCallbackPage.tsx](../../client/src/pages/AuthCallbackPage.tsx)

**Purpose**: Extract access token from URL, fetch user profile, redirect to dashboard

**Flow**:
1. Extract `token` query param from URL
2. Handle error if `error` query param present
3. Call backend `/me` endpoint with token to get user profile
4. Save token + user to store
5. Redirect to dashboard after 500ms

```typescript
export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prevent duplicate processing with ref
  const hasProcessedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent duplicate processing (StrictMode, hot reload, etc.)
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const processCallback = async () => {
      // Extract token and error from URL query params
      const token = searchParams.get('token');
      const backendError = searchParams.get('error');

      // Handle error from backend
      if (backendError) {
        setState('error');
        setErrorMessage(getErrorMessage(backendError));
        return;
      }

      // Handle missing token
      if (!token) {
        setState('error');
        setErrorMessage('Authentication token missing. Please try logging in again.');
        return;
      }

      try {
        // Complete authentication
        await handleCallback(token);

        setState('success');

        // Redirect to dashboard after brief success message
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (err) {
        setState('error');
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setErrorMessage(message);
      }
    };

    processCallback();

    // Cleanup: clear timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [searchParams, navigate, handleCallback]);

  // ... render processing/success/error states
};
```

**Race condition prevention**:
- `hasProcessedRef` prevents duplicate processing in React StrictMode
- `redirectTimeoutRef` cleanup prevents navigation after unmount

### Step 5: Auth Hook (State Management)

**File**: [client/src/features/auth/hooks/useAuth.ts](../../client/src/features/auth/hooks/useAuth.ts)

**Purpose**: Provide auth state + actions to components (wrapper around Zustand store)

```typescript
export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setAccessToken,
    clearAuth,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  const loginWithGoogle = () => {
    authService.initiateGoogleLogin();
  };

  const handleCallback = async (token: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const user = await authService.handleOAuthCallback(token);
      setUser(user);
      setAccessToken(token);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);  // Always clear loading state
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      // Logout is best effort - continue even if API fails
      logger.warn('Logout API call failed (continuing with local cleanup)', { error: err });
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    setLoading(true);
    try {
      const tokenPair = await authService.refreshAccessToken();
      setAccessToken(tokenPair.access_token);
    } catch (err) {
      clearAuth();  // If refresh fails, force re-login
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    loginWithGoogle,
    handleCallback,
    logout,
    refresh,
    clearError,
  };
};
```

---

## Token Management

### Token Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                        │
└──────────────────────────────────────────────────────────┘

1. LOGIN
   ├─ User clicks "Login with Google"
   ├─ Redirect to Google → consent → redirect to backend
   ├─ Backend generates JWT tokens
   ├─ Access token (15 min) → URL query param
   └─ Refresh token (7 days) → httpOnly cookie

2. AUTHENTICATED REQUEST
   ├─ Frontend reads access token from localStorage
   ├─ Axios interceptor adds "Authorization: Bearer <token>"
   ├─ Backend validates JWT signature + expiration
   └─ Response returned

3. TOKEN EXPIRATION (Access Token Expires After 15 min)
   ├─ API request fails with 401 Unauthorized
   ├─ Axios response interceptor detects 401
   ├─ Call refresh endpoint (refresh token sent via cookie)
   ├─ Backend validates refresh token
   ├─ Backend generates new access + refresh tokens
   ├─ New access token → response body
   ├─ New refresh token → updated httpOnly cookie
   ├─ Retry failed request with new access token
   └─ All queued requests retry with new token

4. REFRESH TOKEN EXPIRATION (After 7 Days)
   ├─ Refresh request fails with 401
   ├─ Clear auth state (localStorage + Zustand store)
   ├─ Redirect to /login
   └─ User must re-authenticate with Google

5. LOGOUT
   ├─ User clicks logout
   ├─ Call backend /logout (invalidate tokens in DB)
   ├─ Clear localStorage (access token)
   ├─ Clear Zustand store (user + state)
   └─ Backend clears httpOnly cookie (refresh token)
```

### Token Validation

**Client-Side JWT Decoding** (for expiration check only, NOT security)

**File**: [client/src/features/auth/utils/tokenValidation.ts](../../client/src/features/auth/utils/tokenValidation.ts)

```typescript
/**
 * Decode JWT token without verification (client-side only)
 *
 * ⚠️ Note: This is NOT for security - only for reading expiration time.
 * Token verification happens on the backend.
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode Base64URL payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    logger.debug('Failed to decode JWT token', { error });
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  // Check if token is expired (with 10 second buffer for clock skew)
  const now = Math.floor(Date.now() / 1000);
  const buffer = 10;
  return payload.exp < now + buffer;
};

/**
 * Check if token should be refreshed
 *
 * Refresh if token expires within 5 minutes
 */
export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) return false;

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;

  return timeUntilExpiry <= TOKEN_EXPIRATION.REFRESH_THRESHOLD; // 5 minutes
};
```

**Why decode on client-side?**
- Check if token is expired before sending request (avoid unnecessary 401s)
- Determine if token should be proactively refreshed (UX optimization)
- **NOT for security**: Backend always validates signature + expiration

---

## Error Handling

### Error Flow Diagram

```
┌────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                        │
└────────────────────────────────────────────────────────┘

API ERROR
   │
   ├─ 401 Unauthorized
   │   ├─ Is refresh request? → Logout + redirect to login
   │   └─ Not refresh request? → Attempt token refresh
   │       ├─ Success → Retry original request
   │       └─ Failure → Logout + redirect to login
   │
   ├─ 4xx Client Error (400, 403, 404, etc.)
   │   ├─ Extract error message from response.data.detail
   │   ├─ Set error in auth store
   │   └─ Display ErrorAlert component
   │
   ├─ 5xx Server Error
   │   ├─ Extract error message or use generic message
   │   ├─ Log error to Sentry (production)
   │   └─ Display ErrorAlert component
   │
   └─ Network Error (timeout, DNS, connection refused)
       ├─ Detect: error.code === 'ECONNABORTED' || !error.response
       ├─ Log error
       └─ Display "Network error" message
```

### Error Messages

**User-friendly error mapping**:

**File**: [client/src/pages/AuthCallbackPage.tsx:19-28](../../client/src/pages/AuthCallbackPage.tsx#L19-L28)

```typescript
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    oauth_failed: 'OAuth authentication failed. Please try again.',
    invalid_state: 'Invalid authentication state. Please try logging in again.',
    access_denied: 'You denied access. Please grant permissions to continue.',
    server_error: 'Server error occurred. Please try again later.',
  };

  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
};
```

### ErrorAlert Component

**File**: [client/src/shared/components/ui/ErrorAlert.tsx](../../client/src/shared/components/ui/ErrorAlert.tsx)

```typescript
interface ErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  if (!message || message.trim() === '') return null;

  return (
    <div
      role="alert"
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
    >
      {/* Error icon */}
      <div className="flex-shrink-0 text-red-500 dark:text-red-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Error message */}
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
```

**Usage**:

```typescript
const { error, clearError } = useAuth();

<ErrorAlert message={error} onDismiss={clearError} />
```

---

## Testing Strategy

### Test Coverage

**Total tests**: 43 passing ✅

**Test files**:
- `authService.test.ts`: OAuth service business logic
- `tokenStorage.test.ts`: localStorage operations
- `tokenValidation.test.ts`: JWT decoding + expiration
- `useAuth.test.ts`: Auth hook state management
- `ErrorAlert.test.ts`: Error UI component

### Example Test: Token Refresh with Queue

**File**: `client/src/features/auth/utils/__tests__/tokenRefresh.test.ts`

```typescript
describe('handleTokenRefresh', () => {
  it('should queue concurrent refresh requests', async () => {
    const mockAxios = axios.create();
    const mockAdapter = new MockAdapter(mockAxios);

    // Mock refresh endpoint (delayed response)
    mockAdapter
      .onPost('/auth/oauth/refresh')
      .reply(() => new Promise(resolve =>
        setTimeout(() => resolve([200, { access_token: 'new-token' }]), 100)
      ));

    // Start 3 concurrent refresh requests
    const promise1 = handleTokenRefresh(mockAxios, jest.fn());
    const promise2 = handleTokenRefresh(mockAxios, jest.fn());
    const promise3 = handleTokenRefresh(mockAxios, jest.fn());

    const [token1, token2, token3] = await Promise.all([promise1, promise2, promise3]);

    // All should receive the same token
    expect(token1).toBe('new-token');
    expect(token2).toBe('new-token');
    expect(token3).toBe('new-token');

    // Only ONE API call should be made
    expect(mockAdapter.history.post.length).toBe(1);
  });

  it('should reject all queued requests if refresh fails', async () => {
    const mockAxios = axios.create();
    const mockAdapter = new MockAdapter(mockAxios);

    // Mock refresh endpoint failure
    mockAdapter.onPost('/auth/oauth/refresh').reply(401);

    const onAuthFailure = jest.fn();

    // Start 2 concurrent refresh requests
    const promise1 = handleTokenRefresh(mockAxios, onAuthFailure);
    const promise2 = handleTokenRefresh(mockAxios, onAuthFailure);

    // Both should be rejected
    await expect(promise1).rejects.toThrow();
    await expect(promise2).rejects.toThrow();

    // Auth failure callback should be called once
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Best Practices

1. **Mock external dependencies**: Mock axios, localStorage, logger
2. **Test behavior, not implementation**: Test what happens, not how
3. **Arrange-Act-Assert pattern**: Clear test structure
4. **Test edge cases**: Empty strings, null values, network errors
5. **Async testing**: Use `async/await` for promises
6. **Cleanup**: Clear mocks/storage after each test

---

## Deployment Considerations

### Environment Variables

#### Development (`.env.local`)

```bash
# Frontend
VITE_API_URL=http://localhost:7001/api/v1

# Backend
DATABASE_URL=postgresql://dev:devpass@localhost:5432/workout_buddy_dev
SECRET_KEY=dev-secret-change-in-production
DEBUG=true
CORS_ORIGINS=["http://localhost:7002"]

# Google OAuth (create at https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Production (Vercel + Railway)

**Frontend (Vercel env vars)**:
```bash
VITE_API_URL=https://api.workout-buddy.com/api/v1
```

**Backend (Railway env vars)**:
```bash
DATABASE_URL=<railway-postgres-connection-string>
SECRET_KEY=<strong-random-key-from-1password>
DEBUG=false
CORS_ORIGINS=["https://workout-buddy.com"]

# Google OAuth (production credentials)
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>

# Security
BACKEND_URL=https://api.workout-buddy.com
FRONTEND_URL=https://workout-buddy.com
```

### CORS Configuration

**Backend CORS settings**:

```python
# server/app/core/config.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ["https://workout-buddy.com"]
    allow_credentials=True,  # ⚠️ CRITICAL: Required for httpOnly cookies
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Why `allow_credentials=True`?**
- Enables browser to send httpOnly cookies with cross-origin requests
- Required for refresh token cookie to be sent from frontend to backend
- Frontend must also set `withCredentials: true` in axios

### Cookie Security in Production

```python
# Production cookie attributes
response.set_cookie(
    key="refresh_token",
    value=tokens.refresh_token,
    max_age=7 * 24 * 60 * 60,
    httponly=True,
    secure=True,        # ⚠️ HTTPS only in production
    samesite="lax",     # CSRF protection
    domain=".workout-buddy.com",  # Allow subdomains
    path="/",
)
```

**Important**:
- `secure=True` requires HTTPS (cookies won't be sent over HTTP)
- Vercel and Railway provide SSL certificates automatically
- Test OAuth flow on staging before production deploy

---

## Troubleshooting

### Common Issues

#### 1. "Refresh token missing" error

**Symptoms**: All API calls fail after 15 minutes, auto-refresh fails

**Causes**:
- `withCredentials: true` not set in axios
- `allow_credentials=True` not set in CORS middleware
- Cookie domain mismatch (frontend on `localhost:7002`, backend on `127.0.0.1:7001`)
- Browser blocking third-party cookies

**Solution**:
```typescript
// ✅ Correct: withCredentials in axios config
export const apiClient = axios.create({
  baseURL: API_CONFIG.SERVER_URL,
  withCredentials: true,  // MUST BE TRUE
});
```

```python
# ✅ Correct: allow_credentials in CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,  # MUST BE TRUE
)
```

**Debug**:
```bash
# Check if cookie is set in browser DevTools
# Application → Cookies → http://localhost:7001
# Should see: refresh_token (HttpOnly, Lax)

# If cookie missing, check backend logs
# Should see: "Setting refresh token cookie for user: <user_id>"
```

#### 2. Infinite redirect loop between `/login` and `/auth/callback`

**Symptoms**: Browser keeps redirecting, never lands on dashboard

**Causes**:
- Token not saved to localStorage after callback
- `setAccessToken()` not called in handleCallback
- Race condition in AuthCallbackPage (duplicate processing)

**Solution**:
```typescript
// ✅ Prevent duplicate processing with useRef
const hasProcessedRef = useRef(false);

useEffect(() => {
  if (hasProcessedRef.current) return;
  hasProcessedRef.current = true;

  // ... process callback
}, []);
```

#### 3. CORS error: "Access-Control-Allow-Credentials"

**Error message**:
```
Access to XMLHttpRequest at 'http://localhost:7001/api/v1/auth/oauth/refresh'
from origin 'http://localhost:7002' has been blocked by CORS policy:
The value of the 'Access-Control-Allow-Credentials' header in the response is ''
which must be 'true' when the request's credentials mode is 'include'.
```

**Cause**: Backend CORS middleware missing `allow_credentials=True`

**Solution**: See CORS Configuration section above

#### 4. Token expired immediately after login

**Cause**: Clock skew between client and server

**Solution**: Add buffer to expiration check:
```typescript
// tokenValidation.ts
const buffer = 10; // 10 seconds buffer
return payload.exp < now + buffer;
```

#### 5. Google OAuth error: "redirect_uri_mismatch"

**Symptoms**: Google consent screen shows error after clicking "Login with Google"

**Cause**: Redirect URI in Google Console doesn't match backend callback URL

**Solution**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - Development: `http://localhost:7001/api/v1/auth/oauth/google/callback`
   - Production: `https://api.workout-buddy.com/api/v1/auth/oauth/google/callback`

---

## Best Practices

### Security Checklist

- ✅ **Refresh tokens in httpOnly cookies** (XSS-proof)
- ✅ **Access tokens in localStorage** (short-lived, 15 min)
- ✅ **Token rotation** on every refresh
- ✅ **SameSite=Lax cookies** (CSRF protection)
- ✅ **HTTPS in production** (secure cookies)
- ✅ **CORS with credentials** enabled
- ✅ **No tokens in URL** (except callback, immediately consumed)
- ✅ **No secrets in frontend code** (all in backend env vars)
- ✅ **JWT signature validation** on backend
- ✅ **Automatic logout** on refresh failure

### Code Quality Checklist

- ✅ **SOLID principles**: SRP, DRY, YAGNI followed throughout
- ✅ **TypeScript strict mode**: No `any` types
- ✅ **Feature-based structure**: Organized by domain
- ✅ **Comprehensive error handling**: User-friendly messages
- ✅ **Loading states**: Finally blocks ensure cleanup
- ✅ **Race condition prevention**: useRef for duplicate processing
- ✅ **Request queueing**: Prevents duplicate refresh requests
- ✅ **Cleanup**: useEffect cleanup for timeouts
- ✅ **Structured logging**: Production-grade logger
- ✅ **Test coverage**: 43 tests passing

### Performance Optimization

1. **Token refresh queue**: Prevents duplicate refresh requests
2. **Proactive token refresh** (not implemented yet):
   - Check if token expires in <5 min before request
   - Refresh in background before expiration
3. **Request deduplication**: Axios already deduplicates identical concurrent requests
4. **Lazy loading**: Auth components loaded on-demand

### Monitoring Recommendations

**Production monitoring** (implement with Sentry/DataDog):

```typescript
// Track auth metrics
analytics.track('auth.login.success', { provider: 'google', userId });
analytics.track('auth.login.failure', { error: error.message });
analytics.track('auth.token.refresh.success', { userId });
analytics.track('auth.token.refresh.failure', { error: error.message });
analytics.track('auth.logout', { userId, reason: 'user_initiated' });
```

**Metrics to monitor**:
- Login success rate (target: >95%)
- Token refresh success rate (target: >99%)
- Average token refresh latency (target: <500ms)
- Failed login reasons (Google API errors, network issues)
- Logout reasons (user-initiated vs forced by errors)

---

## Additional Resources

### Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project guidelines and principles
- [Backend Auth Routes](../../server/app/features/auth/routes/oauth_routes.py) - FastAPI OAuth implementation
- [React Router Docs](https://reactrouter.com/) - Client-side routing
- [Zustand Docs](https://zustand.docs.pmnd.rs/) - State management
- [Axios Docs](https://axios-http.com/) - HTTP client

### OAuth 2.0 Specifications

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

### Security Best Practices

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Cookie Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

## Changelog

### Version 1.0.0 (2026-01-05)

**Initial implementation**:
- ✅ Google OAuth 2.0 integration
- ✅ Cookie-based refresh tokens with rotation
- ✅ Automatic token refresh on 401
- ✅ Request queueing for concurrent refreshes
- ✅ Comprehensive error handling
- ✅ Production-grade logging
- ✅ 43 tests passing
- ✅ Race condition prevention
- ✅ Loading state management

**Known limitations**:
- Only Google OAuth (GitHub, Discord coming later)
- No proactive token refresh (refresh on demand only)
- No remember me / stay logged in option
- No multi-device logout (logout only clears current device)

---

## Support

For questions or issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Best Practices](#best-practices)
3. Open issue in GitHub repository
4. Contact: [your-email@example.com]

---

**Last updated**: 2026-01-05
**Version**: 1.0.0
**Status**: ✅ Production-ready
