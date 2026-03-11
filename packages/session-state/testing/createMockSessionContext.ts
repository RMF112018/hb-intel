import type { ISessionStateContext } from '../src/types/ISessionState.js';

/**
 * Creates a mock session context for testing.
 */
export function createMockSessionContext(
  overrides: Partial<ISessionStateContext> = {},
): ISessionStateContext {
  return {
    connectivity: 'online',
    queuedOperations: [],
    pendingCount: 0,
    triggerSync: async () => {},
    saveDraft: () => {},
    loadDraft: <T>() => null as T | null,
    clearDraft: () => {},
    queueOperation: () => {},
    ...overrides,
  };
}
