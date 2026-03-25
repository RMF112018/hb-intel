// D-PH7-BW-10: Vitest setup for project-hub webpart tests
import '@testing-library/jest-dom';
import { vi } from 'vitest';

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

// Mock window._spPageContextInfo so resolveAuthMode() returns 'mock' in tests
Object.defineProperty(window, '_spPageContextInfo', {
  value: undefined,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
