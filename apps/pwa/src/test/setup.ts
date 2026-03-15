/**
 * W0-G5-T08: Test setup for PWA unit and integration tests.
 * Follows the proven @hbc/sharepoint-docs pattern.
 */
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server.js';

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock window.matchMedia for responsive hooks (useIsMobile, useIsTablet)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => true,
});

// Mock crypto.randomUUID for deterministic test IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  ...crypto,
  randomUUID: vi.fn(() => {
    uuidCounter++;
    return `test-uuid-${String(uuidCounter).padStart(4, '0')}`;
  }),
});

beforeEach(() => {
  uuidCounter = 0;
});

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:7071',
      DEV: false,
    },
  },
});
