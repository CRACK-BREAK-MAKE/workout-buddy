/**
 * Authentication Types
 *
 * Type definitions for auth feature (SRP - Type safety)
 */

/**
 * User entity returned from backend
 */
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: 'google' | 'github' | 'discord' | 'email';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * JWT token pair from backend
 */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

/**
 * Auth state in Zustand store
 *
 * NOTE: Refresh token is stored in httpOnly cookie (not in state)
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth actions for Zustand store
 */
export interface AuthActions {
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'discord';

/**
 * API Error Response from backend
 */
export interface ApiError {
  detail: string;
  status_code: number;
  timestamp?: string;
}
