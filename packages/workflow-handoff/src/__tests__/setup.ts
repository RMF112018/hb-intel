import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

beforeAll(() => {
  vi.mock('@hbc/notification-intelligence', () => ({
    notificationIntelligence: {
      registerEvent: vi.fn(),
    },
  }));

  global.fetch = vi.fn();
});
