// D-PH7-BW-10: Vitest setup for admin webpart tests
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock @tanstack/react-virtual so HbcDataTable renders all rows in jsdom
// (jsdom elements have 0 dimensions, causing the virtualizer to render 0 rows)
vi.mock('@tanstack/react-virtual', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-virtual')>();
  return {
    ...actual,
    useVirtualizer: (opts: { count: number }) => ({
      getVirtualItems: () =>
        Array.from({ length: opts.count }, (_, i) => ({
          index: i,
          key: i,
          start: i * 40,
          size: 40,
          end: (i + 1) * 40,
          measureElement: () => {},
        })),
      getTotalSize: () => opts.count * 40,
      measureElement: () => {},
    }),
  };
});

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

// Mock getBoundingClientRect so virtualized lists (HbcDataTable) render rows in jsdom
Element.prototype.getBoundingClientRect = () => ({
  x: 0,
  y: 0,
  width: 1000,
  height: 800,
  top: 0,
  right: 1000,
  bottom: 800,
  left: 0,
  toJSON: () => {},
});

// Mock scrollHeight/clientHeight for virtualizer scroll container detection
Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 800 });

// Mock window._spPageContextInfo so resolveAuthMode() returns 'mock' in tests
Object.defineProperty(window, '_spPageContextInfo', {
  value: undefined,
  writable: true,
});
