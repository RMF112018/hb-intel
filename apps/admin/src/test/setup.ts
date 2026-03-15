// D-PH7-BW-10: Vitest setup for admin webpart tests
import '@testing-library/jest-dom';
import { vi } from 'vitest';

beforeEach(() => {
  vi.resetAllMocks();
});

// Mock window.matchMedia for jsdom (used by HbcThemeProvider).
// Uses a plain function instead of vi.fn() so vi.resetAllMocks() does not clear it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window._spPageContextInfo so resolveAuthMode() returns 'mock' in tests
Object.defineProperty(window, '_spPageContextInfo', {
  value: undefined,
  writable: true,
});
