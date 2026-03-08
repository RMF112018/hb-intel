import type { IBicOwner } from '../src/types/IBicNextMove';

/**
 * Creates a mock IBicOwner with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 *
 * @example
 * const owner = createMockBicOwner({ displayName: 'Jane Smith', role: 'Director' });
 */
export function createMockBicOwner(overrides?: Partial<IBicOwner>): IBicOwner {
  return {
    userId: 'mock-user-id-001',
    displayName: 'Mock Owner',
    role: 'Mock Role',
    groupContext: undefined,
    ...overrides,
  };
}
