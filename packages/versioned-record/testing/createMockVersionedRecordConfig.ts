import type { IVersionedRecordConfig, VersionTrigger } from '../src/types';
import { vi } from 'vitest';

/**
 * Creates a typed mock `IVersionedRecordConfig<T>` for use in consuming
 * package tests. All functions are vi.fn() stubs with sensible defaults.
 */
export function createMockVersionedRecordConfig<T>(
  overrides: Partial<IVersionedRecordConfig<T>> = {}
): IVersionedRecordConfig<T> {
  return {
    recordType: 'mock-record',
    triggers: ['on-submit', 'on-approve'] as VersionTrigger[],
    generateChangeSummary: vi.fn().mockReturnValue('Mock change summary'),
    excludeFields: [],
    maxVersions: 0,
    getStakeholders: vi.fn().mockReturnValue(['mock-user-1', 'mock-user-2']),
    onVersionCreated: vi.fn(),
    ...overrides,
  };
}
