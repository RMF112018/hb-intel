// D-PH7-BW-10: Vitest setup for quality-control-warranty webpart tests
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
