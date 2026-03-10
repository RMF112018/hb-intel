import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Suppress React act() warnings in unit tests
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Mock @hbc/notification-intelligence at global level so diffEngine
// and VersionApi tests do not require a live notification registry.
vi.mock('@hbc/notification-intelligence', () => ({
  NotificationRegistry: {
    register: vi.fn(),
  },
  NotificationApi: {
    send: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock fetch globally — unit tests should not make real API calls
globalThis.fetch = vi.fn();
