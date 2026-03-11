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

// Mock @hbc/ui-kit/icons to avoid cross-package dependency in tests
vi.mock('@hbc/ui-kit/icons', () => {
  const { createElement } = require('react');
  const createMockIcon = (name: string) => {
    const MockIcon = (props: Record<string, unknown>) =>
      createElement('span', { 'data-testid': `icon-${name}`, 'data-size': props.size });
    MockIcon.displayName = name;
    return MockIcon;
  };
  return {
    __esModule: true,
    Search: createMockIcon('Search'),
    StatusDraftIcon: createMockIcon('StatusDraftIcon'),
    Filter: createMockIcon('Filter'),
    HardHat: createMockIcon('HardHat'),
    StatusAttentionIcon: createMockIcon('StatusAttentionIcon'),
    StatusInfoIcon: createMockIcon('StatusInfoIcon'),
  };
});

// Mock fetch for any network-dependent tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
});
