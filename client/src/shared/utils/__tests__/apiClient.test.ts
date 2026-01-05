/**
 * API Client Tests
 *
 * TDD: Write tests FIRST
 * DRY: Single axios instance for all API calls
 * SRP: Only handles HTTP requests (no business logic)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient, setAuthToken, clearAuthToken } from '../apiClient';

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    // Mock the apiClient instance, not axios default
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
    clearAuthToken();
  });

  it('should have correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:7001/api/v1');
  });

  it('should have correct timeout', () => {
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  it('should have correct default headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have withCredentials enabled for cookie-based auth', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  describe('setAuthToken', () => {
    it('should set Authorization header with Bearer token', () => {
      const token = 'test-access-token';

      setAuthToken(token);

      expect(apiClient.defaults.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should overwrite existing Authorization header', () => {
      setAuthToken('old-token');
      setAuthToken('new-token');

      expect(apiClient.defaults.headers.Authorization).toBe('Bearer new-token');
    });
  });

  describe('clearAuthToken', () => {
    it('should remove Authorization header', () => {
      setAuthToken('test-token');
      clearAuthToken();

      expect(apiClient.defaults.headers.Authorization).toBeUndefined();
    });

    it('should not throw if no Authorization header exists', () => {
      expect(() => clearAuthToken()).not.toThrow();
    });
  });

  describe('request interceptor', () => {
    it('should automatically add Authorization header if token exists in localStorage', async () => {
      localStorage.setItem('workout_buddy_access_token', 'stored-token');

      mock.onGet('/test').reply(config => {
        expect(config.headers?.Authorization).toBe('Bearer stored-token');
        return [200, { success: true }];
      });

      await apiClient.get('/test');
    });

    it('should not add Authorization header if no token in localStorage', async () => {
      mock.onGet('/test').reply(config => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      await apiClient.get('/test');
    });
  });

  describe('response interceptor', () => {
    it('should return response data on success', async () => {
      const responseData = { message: 'success' };
      mock.onGet('/test').reply(200, responseData);

      const response = await apiClient.get('/test');

      expect(response.data).toEqual(responseData);
    });

    it('should throw error with backend error message on 4xx error', async () => {
      mock.onGet('/test').reply(400, {
        detail: 'Validation error',
        status_code: 400,
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Validation error');
    });

    it('should throw error with backend error message on 5xx error', async () => {
      mock.onGet('/test').reply(500, {
        detail: 'Internal server error',
        status_code: 500,
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Internal server error');
    });

    it('should throw generic error if backend does not return detail', async () => {
      mock.onGet('/test').reply(500, { error: 'Something went wrong' });

      await expect(apiClient.get('/test')).rejects.toThrow('An unexpected error occurred');
    });

    it('should throw network error on network failure', async () => {
      mock.onGet('/test').networkError();

      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });
});
