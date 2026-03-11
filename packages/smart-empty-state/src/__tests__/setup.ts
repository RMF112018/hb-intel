/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock @hbc/complexity to avoid cross-package test dependency
vi.mock('@hbc/complexity', () => ({
  __esModule: true,
}));

// Mock fetch for any network-dependent tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
});
