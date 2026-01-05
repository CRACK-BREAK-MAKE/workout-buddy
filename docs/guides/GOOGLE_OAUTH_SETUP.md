# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `workout-buddy` (or any name)
4. Click **"Create"**

## Step 2: Enable Google+ API

1. In the Google Cloud Console, select your project
2. Go to **APIs & Services** → **Library**
3. Search for **"Google+ API"** or **"Google Identity"**
4. Click **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (for testing with any Google account)
3. Click **"Create"**

### Fill in App Information:
- **App name**: `Workout Buddy`
- **User support email**: Your email
- **App logo**: (optional for testing)
- **Application home page**: `http://localhost:5173` (Vite dev server)
- **Authorized domains**: Leave empty for local development
- **Developer contact**: Your email

4. Click **"Save and Continue"**

### Add Scopes:
1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `openid`
   - `email`
   - `profile`
   - Or manually add: `.../auth/userinfo.email`, `.../auth/userinfo.profile`
3. Click **"Update"** → **"Save and Continue"**

### Add Test Users (for External apps):
1. Click **"Add Users"**
2. Add your email address
3. Click **"Save and Continue"**

4. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

### Configure OAuth Client:
- **Name**: `Workout Buddy Web Client`
- **Authorized JavaScript origins**:
  - `http://localhost:5173` (Vite frontend)
  - `http://localhost:7002` (if different port)
- **Authorized redirect URIs**:
  - `http://localhost:7001/api/v1/auth/oauth/google/callback` (backend callback)

4. Click **"Create"**

### Save Credentials:
- Copy **Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
- Copy **Client Secret** (looks like: `GOCSPX-abc123...`)

**IMPORTANT**: Keep these secret! Never commit to Git.

## Step 5: Add Credentials to .env

1. Open `server/.env` file
2. Add your credentials:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:7001/api/v1/auth/oauth/google/callback
```

## Step 6: Test OAuth Flow

### Start the Backend:
```bash
cd server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 7001
```

### Test Authorization URL:
```bash
# Get authorization URL
curl http://localhost:7001/api/v1/auth/oauth/google/login

# Response will be:
# {
#   "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
# }
```

### Test Full Flow (in browser):
1. Copy the `authorization_url` from above
2. Paste into browser
3. Sign in with Google account (must be test user if External)
4. Grant permissions
5. You'll be redirected to callback with JWT tokens

### Expected Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "you@gmail.com",
    "username": "you",
    "full_name": "Your Name",
    "avatar_url": "https://...",
    "auth_provider": "google"
  }
}
```

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: Redirect URI doesn't match Google Console configuration

**Fix**:
1. Check `.env` file: `GOOGLE_REDIRECT_URI` value
2. Ensure it EXACTLY matches Google Console → Credentials → Your OAuth Client → Authorized redirect URIs
3. Must include protocol (`http://`), host, port, and full path
4. No trailing slash

### Error: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured or missing scopes

**Fix**:
1. Go to OAuth consent screen
2. Add required scopes (`email`, `profile`, `openid`)
3. Add your email as test user

### Error: "invalid_client"
**Cause**: Wrong client ID or secret

**Fix**:
1. Verify credentials in `.env` file
2. Regenerate client secret if needed (Google Console → Credentials → Edit → Reset Secret)

### Error: "User not in test users"
**Cause**: App is in External mode but user not added

**Fix**:
1. Go to OAuth consent screen → Test users
2. Add the Google account you're testing with
3. Or publish the app (requires verification for production)

## Production Deployment

### Update Redirect URIs:
When deploying to production (e.g., Railway, Vercel):

1. Go to Google Console → Credentials → Edit OAuth Client
2. Add production URIs:
   - Authorized origins: `https://yourdomain.com`
   - Redirect URIs: `https://api.yourdomain.com/api/v1/auth/oauth/google/callback`

### Update Environment Variables:
```bash
# Production .env (Railway, etc.)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/oauth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### Publish OAuth Consent Screen:
1. Go to OAuth consent screen
2. Click **"Publish App"**
3. Submit for verification (if requesting sensitive scopes)
4. Google will review (takes 1-2 weeks)

**Note**: For basic scopes (`email`, `profile`, `openid`), verification not required!

## Security Best Practices

1. **Never commit credentials**: Use `.env` file (already in `.gitignore`)
2. **Rotate secrets regularly**: Reset client secret every 6 months
3. **Restrict redirect URIs**: Only add URIs you control
4. **Use HTTPS in production**: Never use OAuth over HTTP in production
5. **Validate state parameter**: Already implemented in code
6. **Rate limit OAuth endpoints**: Prevent abuse (covered in Phase 4)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) - Test API calls
- [Google Cloud Console](https://console.cloud.google.com/)
