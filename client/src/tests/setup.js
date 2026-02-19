import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';

// Create mock adapter for API calls
const mockApi = new MockAdapter(api);

// Reset mock API before each test
beforeEach(() => {
  mockApi.reset();
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Export mock adapter so tests can use it
global.mockApi = mockApi;

// Mock environment variables
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:5000/api'
    }
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
