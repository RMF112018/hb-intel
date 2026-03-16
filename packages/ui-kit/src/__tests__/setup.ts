/**
 * Vitest setup for @hbc/ui-kit
 * WS1-T11 — Verification Overhaul
 */
import '@testing-library/jest-dom';

// jsdom does not implement window.matchMedia — stub it for hooks that rely on it
// (usePrefersReducedMotion, useTouchSize, etc.)
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
