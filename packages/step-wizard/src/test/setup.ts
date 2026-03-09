import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { __resetMockDraft } from '../__mocks__/session-state';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  __resetMockDraft();
});

// Mock fetch globally — unit tests should not make real API calls
globalThis.fetch = vi.fn();
