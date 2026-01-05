/**
 * Vitest Test Setup
 *
 * Global test configuration and mocks
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

global.localStorage = localStorageMock as Storage;

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:7002',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  } as Partial<Location> as Location,
});

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:7001/api/v1',
    DEV: true,
  },
});
