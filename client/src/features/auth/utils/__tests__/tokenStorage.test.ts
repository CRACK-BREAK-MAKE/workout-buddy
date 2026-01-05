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
      localStorage.setItem('workout_buddy_access_token', 'test-token');

      const token = getAccessToken();

      expect(token).toBe('test-token');
    });

    it('should return null if no access token exists', () => {
      const token = getAccessToken();

      expect(token).toBeNull();
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
    it('should return true if access token exists', () => {
      localStorage.setItem('workout_buddy_access_token', 'test-token');

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
  });
});
