/**
 * Token Storage Utility Tests
 *
 * TDD: Write tests FIRST, then implementation
 * SRP: This utility ONLY handles access token storage (refresh token in httpOnly cookie)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
  hasValidAccessToken,
} from '../tokenStorage';

// Valid JWT format: header.payload.signature (3 parts separated by dots)
// Payload: {"sub":"1234567890","exp":4102444800} (expires year 2099)
const VALID_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjo0MTAyNDQ0ODAwfQ.VzvKe_MbnT6bBz2GU6VPLfM2zKKMdQ1LUUzS3HkxZ_s';
const INVALID_JWT_TOKEN_NO_PARTS = 'invalid-token-format';
const INVALID_JWT_TOKEN_TWO_PARTS = 'header.payload';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveAccessToken', () => {
    it('should save access token to localStorage', () => {
      const accessToken = 'test-access-token';

      saveAccessToken(accessToken);

      expect(localStorage.getItem('workout_buddy_access_token')).toBe(accessToken);
    });

    it('should overwrite existing token', () => {
      saveAccessToken('old-access');
      saveAccessToken('new-access');

      expect(localStorage.getItem('workout_buddy_access_token')).toBe('new-access');
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('workout_buddy_access_token', VALID_JWT_TOKEN);

      const token = getAccessToken();

      expect(token).toBe(VALID_JWT_TOKEN);
    });

    it('should return null if no access token exists', () => {
      const token = getAccessToken();

      expect(token).toBeNull();
    });

    it('should return null and clear token if JWT format is invalid (no dots)', () => {
      localStorage.setItem('workout_buddy_access_token', INVALID_JWT_TOKEN_NO_PARTS);

      const token = getAccessToken();

      expect(token).toBeNull();
      expect(localStorage.getItem('workout_buddy_access_token')).toBeNull();
    });

    it('should return null and clear token if JWT format is invalid (only 2 parts)', () => {
      localStorage.setItem('workout_buddy_access_token', INVALID_JWT_TOKEN_TWO_PARTS);

      const token = getAccessToken();

      expect(token).toBeNull();
      expect(localStorage.getItem('workout_buddy_access_token')).toBeNull();
    });
  });

  describe('removeAccessToken', () => {
    it('should remove access token from localStorage', () => {
      localStorage.setItem('workout_buddy_access_token', 'test-access');

      removeAccessToken();

      expect(localStorage.getItem('workout_buddy_access_token')).toBeNull();
    });

    it('should not throw error if token does not exist', () => {
      expect(() => removeAccessToken()).not.toThrow();
    });
  });

  describe('hasValidAccessToken', () => {
    it('should return true if valid JWT access token exists', () => {
      localStorage.setItem('workout_buddy_access_token', VALID_JWT_TOKEN);

      expect(hasValidAccessToken()).toBe(true);
    });

    it('should return false if access token does not exist', () => {
      expect(hasValidAccessToken()).toBe(false);
    });

    it('should return false if access token is empty string', () => {
      localStorage.setItem('workout_buddy_access_token', '');

      expect(hasValidAccessToken()).toBe(false);
    });

    it('should return false if access token is only whitespace', () => {
      localStorage.setItem('workout_buddy_access_token', '   ');

      expect(hasValidAccessToken()).toBe(false);
    });

    it('should return false if JWT format is invalid', () => {
      localStorage.setItem('workout_buddy_access_token', INVALID_JWT_TOKEN_NO_PARTS);

      expect(hasValidAccessToken()).toBe(false);
    });
  });
});
