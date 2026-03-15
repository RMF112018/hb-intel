// D-PH7-BW-10: Vitest setup for accounting webpart tests
import '@testing-library/jest-dom';
import { vi } from 'vitest';

beforeEach(() => {
  vi.resetAllMocks();
});

// Mock window._spPageContextInfo so resolveAuthMode() returns 'mock' in tests
Object.defineProperty(window, '_spPageContextInfo', {
  value: undefined,
  writable: true,
});

// jsdom does not implement window.matchMedia — stub for HbcThemeProvider.
// Uses a plain function (not vi.fn()) so vi.resetAllMocks() does not clear it.
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

// Mock @hbc/notification-intelligence — not a direct dependency of accounting,
// but imported dynamically by @hbc/bic-next-move during resolve.
vi.mock('@hbc/notification-intelligence', () => ({
  notificationIntelligence: { registerEvent: vi.fn() },
}));
