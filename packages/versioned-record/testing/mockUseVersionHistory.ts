import { vi } from 'vitest';
import type { IUseVersionHistoryResult } from '../src/types';
import { multiVersionState } from './mockVersionedRecordStates';

/**
 * Mock implementation of `useVersionHistory` with vi.fn() stubs
 * for all mutations. Default state is `multiVersionState`.
 */
export const mockUseVersionHistory = {
  /**
   * Returns a mock result object. Override individual fields as needed.
   */
  mockReturnValue(
    overrides: Partial<IUseVersionHistoryResult> = {}
  ): IUseVersionHistoryResult {
    return {
      metadata: multiVersionState.metadata,
      isLoading: false,
      error: null,
      showSuperseded: false,
      setShowSuperseded: vi.fn(),
      hasSuperseded: false,
      refresh: vi.fn(),
      ...overrides,
    };
  },

  /** Stub that simulates a loading state. */
  loading(): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [], isLoading: true });
  },

  /** Stub that simulates an error state. */
  error(message = 'Failed to load version history'): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [], error: new Error(message) });
  },

  /** Stub that simulates an empty history state. */
  empty(): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [] });
  },

  /** Stub that simulates the rollback mutation. */
  withRollback(): IUseVersionHistoryResult {
    return this.mockReturnValue({
      metadata: multiVersionState.metadata,
    });
  },
};
