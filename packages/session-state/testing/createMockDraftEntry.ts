import type { IDraftEntry } from '../src/types/ISessionState.js';

/**
 * Creates a mock draft entry for testing.
 */
export function createMockDraftEntry(
  overrides: Partial<IDraftEntry> = {},
): IDraftEntry {
  return {
    draftKey: 'form:001',
    value: { name: 'Demo' },
    savedAt: '2026-03-10T12:00:00Z',
    ttlHours: 72,
    ...overrides,
  };
}
