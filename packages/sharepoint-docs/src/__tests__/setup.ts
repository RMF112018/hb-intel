import { cleanup } from '@testing-library/react';
import { server } from './mocks/server.js';

// MSW server for mocking Graph API calls through the Azure Functions proxy
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock sessionStorage for OfflineQueueManager tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => true,
});

// Mock crypto.randomUUID for deterministic test IDs (Gap 1 fix)
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
