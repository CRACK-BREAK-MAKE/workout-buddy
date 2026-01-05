# Authentication Security & Compliance Guide

## Current Implementation Analysis

### What Data We're Storing

#### 1. **Access Token (localStorage)**
- **Location**: `localStorage.workout_buddy_access_token`
- **Type**: JWT (15-60 min lifetime)
- **Contains**: User ID, email, expiration time
- **Risk**: XSS vulnerable (but acceptable for short-lived tokens)
- **GDPR**: Contains personal data - needs clear consent

#### 2. **Refresh Token (httpOnly Cookie)**
- **Location**: Backend-managed httpOnly cookie
- **Type**: JWT (7-30 days lifetime)
- **Contains**: User ID, token ID, expiration
- **Risk**: XSS protected ✅, CSRF protected with SameSite
- **GDPR**: Contains personal data - needs clear consent

#### 3. **User Profile (Zustand Store - In-Memory)**
- **Location**: `useAuthStore` (lost on page refresh)
- **Data Stored**:
  - `id`: UUID
  - `email`: User's email address
  - `username`: Username (e.g., "mohansharma")
  - `full_name`: Full name (e.g., "Mohan Sharma")
  - `avatar_url`: Profile picture URL
  - `auth_provider`: "google" | "github" | "discord"
  - `is_active`: Boolean
  - `created_at`: ISO timestamp
  - `updated_at`: ISO timestamp
- **Risk**: Lost on refresh (need to re-fetch)
- **GDPR**: Contains personal data

### GDPR/SOX Compliance Requirements

#### ✅ What We're Doing Right
1. **Minimal Data Collection**: Only collecting what's necessary
2. **Secure Storage**: Refresh token in httpOnly cookie (XSS protected)
3. **Short-Lived Access Tokens**: Reduces attack window
4. **OAuth with Google**: Google handles password security

#### ⚠️ What We Need to Implement

##### 1. **Right to Access (GDPR Article 15)**
```typescript
// Need to implement: GET /api/v1/users/me/export
// Returns all user data in JSON format
```

##### 2. **Right to Erasure (GDPR Article 17)**
```typescript
// Already exists: DELETE /api/v1/users/me
// Needs to also:
// - Revoke all refresh tokens
// - Delete all workout data
// - Remove from Google OAuth connections
```

##### 3. **Right to Rectification (GDPR Article 16)**
```typescript
// Already exists: PUT /api/v1/users/me
// User can update: username, full_name
// Cannot update: email (tied to OAuth)
```

##### 4. **Data Retention Policy**
- Define how long we keep workout data after account deletion
- Default: 30 days (recovery period), then permanent deletion

##### 5. **Consent Management**
- Need explicit consent on first login
- Privacy policy link
- Terms of service acceptance

##### 6. **Clear Data on Demand**
Currently missing a "Clear All Data" button in UI that:
1. Calls backend to revoke all tokens
2. Calls backend to delete account
3. Clears localStorage
4. Clears cookies
5. Redirects to login

---

## Session Persistence Behavior

### Current Flow

#### **Scenario 1: Page Refresh**
```
1. User refreshes browser
2. Zustand store is cleared (in-memory)
3. Access token still in localStorage ✅
4. Refresh token still in httpOnly cookie ✅
5. ❌ App has NO initialization logic to restore session
6. ❌ User appears logged out (but tokens are valid!)
```

**Problem**: User must click "Login with Google" again, but backend should recognize existing session.

#### **Scenario 2: Server Restart**
```
1. Backend restarts
2. Tokens are still valid (JWT is stateless)
3. httpOnly cookie still in browser ✅
4. Access token still in localStorage ✅
5. ❌ Same problem - no initialization logic
```

#### **Scenario 3: Access Token Expired (15-60 min)**
```
1. User tries to make API call
2. Backend returns 401 Unauthorized
3. ✅ apiClient automatically calls refresh endpoint
4. ✅ New access token saved to localStorage
5. ✅ Request retried with new token
6. ❌ But user profile not re-fetched
```

### What SHOULD Happen (Best Practice)

#### On App Load
```typescript
// App.tsx or AuthProvider
useEffect(() => {
  const initializeAuth = async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      // No token - user not logged in
      return;
    }

    if (isTokenExpired(accessToken)) {
      // Token expired - try to refresh
      try {
        await refresh(); // Uses refresh token from cookie
        // After refresh, fetch user profile
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        // Refresh failed - clear auth and force re-login
        clearAuth();
      }
    } else {
      // Token valid - fetch user profile
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        // Profile fetch failed - clear auth
        clearAuth();
      }
    }
  };

  initializeAuth();
}, []);
```

---

## Google OAuth Best Practices for Production

### 1. **Token Lifetimes** (Recommended)

```
Access Token:  15-60 minutes (we use 15-30 min)
Refresh Token: 7-30 days (we use 7 days)
```

**Why short-lived access tokens?**
- Limits damage from XSS attacks
- Forces regular refresh (detects revoked tokens faster)
- Google recommends 15-60 minutes

**Why long-lived refresh tokens?**
- Better UX (user stays logged in)
- Stored in httpOnly cookie (XSS protected)
- Can be revoked server-side

### 2. **Token Storage** (Our Implementation ✅)

| Token Type | Storage | Why |
|------------|---------|-----|
| Access Token | localStorage | Short-lived, needs to be accessible to JS for API calls |
| Refresh Token | httpOnly cookie | Long-lived, XSS protected, auto-sent with requests |

**Alternative**: Store access token in memory (more secure but lost on refresh)
- **Pros**: XSS proof
- **Cons**: User must re-login on every page refresh (bad UX)

### 3. **Security Features to Implement**

#### ✅ Already Implemented
- [x] httpOnly cookies for refresh tokens
- [x] HTTPS only (Vercel/Railway)
- [x] CORS whitelist
- [x] JWT validation
- [x] Refresh token rotation (backend should implement)
- [x] Proactive token expiration checks
- [x] Network retry with backoff

#### ⚠️ Missing (Should Implement)

1. **PKCE (Proof Key for Code Exchange)**
   - Backend OAuth flow should use PKCE
   - Prevents authorization code interception
   - Google recommends for all OAuth flows

2. **Token Revocation List**
   - Backend should track revoked refresh tokens
   - Check on refresh endpoint
   - Clear on logout

3. **Device/Session Management**
   - Show user all active sessions
   - Allow revoking specific devices
   - "Logout from all devices" button

4. **Rate Limiting** (Backend)
   ```
   /auth/oauth/refresh: 10 requests/minute per IP
   /auth/oauth/login: 5 requests/minute per IP
   ```

5. **Audit Logging**
   - Log all auth events (login, logout, refresh)
   - IP address, user agent, timestamp
   - Required for SOX compliance

### 4. **User Experience Best Practices**

#### Silent Refresh (What We Do ✅)
```typescript
// In apiClient.ts - automatic refresh on 401
if (error.response?.status === 401) {
  const newToken = await handleTokenRefresh();
  // Retry request with new token
}
```

#### Proactive Refresh (What We Do ✅)
```typescript
// Check token expiration BEFORE making request
if (isTokenExpired(token)) {
  const newToken = await handleTokenRefresh();
}
```

#### Session Persistence (Missing ❌)
```typescript
// Restore session on page load
useEffect(() => {
  if (hasValidAccessToken()) {
    restoreUserSession();
  }
}, []);
```

### 5. **Google OAuth Scopes (Minimal Data)**

Current scopes (should be minimal):
```
- openid (required for OAuth)
- email (to identify user)
- profile (name, picture)
```

**Don't request**:
- Gmail access
- Google Drive access
- Calendar access
- Unless you actually need them!

### 6. **Logout Best Practices**

#### Our Current Implementation
```typescript
// 1. Call backend logout endpoint (revokes refresh token)
await apiClient.post('/auth/oauth/logout');

// 2. Clear localStorage
removeAccessToken();

// 3. Clear Zustand store
clearAuth();

// 4. Redirect to login
window.location.href = '/login';
```

#### Google's Recommendation (Add This)
```typescript
// Also revoke Google OAuth consent
const revokeGoogleAccess = async () => {
  // Backend should call Google's revoke endpoint
  // https://oauth2.googleapis.com/revoke?token={refresh_token}
};
```

---

## Recommended Implementation Plan

### Phase 1: Session Persistence (High Priority)
1. Create `useAuthInitialization` hook
2. Add initialization logic to `App.tsx`
3. Restore user session on page load
4. Update tests

### Phase 2: GDPR Compliance (High Priority)
1. Add "Download My Data" endpoint
2. Update "Delete Account" to revoke all tokens
3. Add consent modal on first login
4. Create privacy policy page
5. Add "Clear All Data" button in settings

### Phase 3: Enhanced Security (Medium Priority)
1. Implement PKCE in backend OAuth flow
2. Add token revocation list
3. Add device/session management
4. Implement audit logging

### Phase 4: Production Hardening (Medium Priority)
1. Add rate limiting
2. Add Sentry error tracking for auth failures
3. Add monitoring/alerting for suspicious activity
4. Penetration testing

---

## Example: Complete Auth Initialization

```typescript
// src/features/auth/hooks/useAuthInitialization.ts
export const useAuthInitialization = () => {
  const { setUser, clearAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          logger.debug('No access token found - user not logged in');
          return;
        }

        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          logger.debug('Access token expired - attempting refresh');

          try {
            // Try to refresh using httpOnly cookie
            const tokenPair = await refreshAccessToken();
            saveAccessToken(tokenPair.access_token);
            setAuthToken(tokenPair.access_token);

            logger.info('Token refreshed successfully on app load');
          } catch (error) {
            logger.warn('Token refresh failed on app load - clearing auth', { error });
            clearAuth();
            return;
          }
        } else {
          // Token valid - set it in apiClient
          setAuthToken(accessToken);
        }

        // Fetch user profile
        logger.debug('Fetching user profile on app load');
        const user = await getCurrentUser();
        setUser(user);

        logger.info('User session restored successfully', { userId: user.id });
        authTelemetry.sessionRestored(user.id);

      } catch (error) {
        logger.error('Failed to initialize auth', { error });
        clearAuth();
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  return { isInitialized };
};
```

---

## Security Checklist for Production

### Authentication
- [x] Access tokens short-lived (15-60 min)
- [x] Refresh tokens in httpOnly cookies
- [x] Automatic token refresh on 401
- [x] Proactive token expiration checks
- [ ] PKCE for OAuth flow
- [ ] Token revocation on logout
- [x] CSRF protection (httpOnly + SameSite cookies)

### Data Protection
- [x] HTTPS only
- [x] Sensitive data in httpOnly cookies
- [ ] Encrypt sensitive fields in database
- [ ] Data retention policy
- [ ] Backup encryption

### Compliance
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent banner
- [ ] GDPR data export
- [ ] GDPR data deletion
- [ ] Audit logging
- [ ] Data processing agreement

### Monitoring
- [ ] Auth failure alerts
- [ ] Suspicious activity detection
- [ ] Rate limiting
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

### Testing
- [x] Unit tests for auth logic
- [ ] Integration tests for OAuth flow
- [ ] Security testing (OWASP)
- [ ] Load testing
- [ ] Penetration testing

---

## Summary

### What Happens on Server Restart/Page Refresh?
**Current**: User appears logged out (tokens valid but session not restored)
**Should Be**: User remains logged in (automatic session restoration)

### What Data Can Users Clear?
**Current**: Only via logout (clears localStorage + cookies)
**Should Be**:
- Logout (clears session)
- Delete account (removes all data)
- Download data (GDPR export)

### Google OAuth Best Practices?
✅ **Doing Right**:
- httpOnly cookies for refresh tokens
- Short-lived access tokens
- Automatic token refresh

⚠️ **Need to Add**:
- Session restoration on page load
- PKCE in OAuth flow
- Token revocation list
- Consent management
- Audit logging
