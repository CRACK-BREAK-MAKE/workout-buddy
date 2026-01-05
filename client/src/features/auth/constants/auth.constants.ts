/**
 * Authentication Constants
 *
 * Centralized constants for auth feature (SRP - Single source of truth)
 */

// API Endpoints (relative to API_CONFIG.SERVER_URL which includes /api/v1)
export const AUTH_ENDPOINTS = {
  OAUTH_LOGIN: (provider: string) => `/auth/oauth/${provider}/login`,
  OAUTH_CALLBACK: (provider: string) => `/auth/oauth/${provider}/callback`,
  OAUTH_REFRESH: '/auth/oauth/refresh',
  OAUTH_LOGOUT: '/auth/oauth/logout',
  OAUTH_ME: '/auth/oauth/me',
} as const;

// OAuth Providers
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  DISCORD: 'discord',
} as const;

// Token Storage Keys
export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'workout_buddy_access_token',
  REFRESH_TOKEN: 'workout_buddy_refresh_token',
  USER: 'workout_buddy_user',
} as const;

// Token Expiration
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN_EXPIRES_IN: 900, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRES_IN: 604800, // 7 days in seconds
  REFRESH_THRESHOLD: 300, // Refresh if token expires in < 5 minutes
} as const;

// API Configuration
export const API_CONFIG = {
  SERVER_URL:
    ((import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL as
      | string
      | undefined) || 'http://localhost:7001/api/v1',
  TIMEOUT: 10000, // 10 seconds
} as const;

// Frontend URLs
export const FRONTEND_URLS = {
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  HOME: '/',
  DASHBOARD: '/dashboard',
} as const;
