import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock @hbc/notification-intelligence so annotation tests don't need the full package
beforeAll(() => {
  vi.mock('@hbc/notification-intelligence', () => ({
    notificationIntelligence: {
      registerEvent: vi.fn(),
    },
  }));
});

// Mock fetch globally for AnnotationApi tests
beforeAll(() => {
  global.fetch = vi.fn();
});
