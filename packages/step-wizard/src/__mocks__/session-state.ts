/**
 * Mock for @hbc/session-state (SF-12 — Deferred Scope).
 * Provides a mutable module-level store so createWizardWrapper can
 * inject initial draft state into tests.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let __mockDraftData: any = null;

export function __setMockDraft(data: unknown): void {
  __mockDraftData = data;
}

export function __resetMockDraft(): void {
  __mockDraftData = null;
}

export function useDraftStore(_draftKey: string | null) {
  return {
    read<T>(): T | null {
      return __mockDraftData as T | null;
    },
    write(_data: unknown): void {
      // no-op in tests — draft persistence is not under test
    },
  };
}
