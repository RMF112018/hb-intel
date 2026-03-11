/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock @hbc/complexity to avoid cross-package test dependency
vi.mock('@hbc/complexity', () => ({
  __esModule: true,
  useComplexity: () => ({
    tier: 'standard',
    showCoaching: false,
    lockedBy: undefined,
    lockedUntil: undefined,
    isLocked: false,
    atLeast: () => true,
    is: (t: string) => t === 'standard',
    setTier: () => {},
    setShowCoaching: () => {},
  }),
}));

// Mock fetch for any network-dependent tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
});
