import type { IDraftEntry } from '../src/types/ISessionState.js';

/**
 * Creates a mock draft entry for testing.
 */
export function createMockDraftEntry(
  overrides: Partial<IDraftEntry> = {},
): IDraftEntry {
  return {
    draftKey: 'draft-1',
    value: {},
    savedAt: new Date().toISOString(),
    ttlHours: 72,
    ...overrides,
  };
}
