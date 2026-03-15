import type { IMyWorkRegistryEntry } from '../src/types/index.js';
import { createMockSourceAdapter } from './createMockSourceAdapter.js';

/** Factory for mock `IMyWorkRegistryEntry` instances */
export function createMockRegistryEntry(overrides?: Partial<IMyWorkRegistryEntry>): IMyWorkRegistryEntry {
  const source = overrides?.source ?? 'bic-next-move';
  return {
    source,
    adapter: createMockSourceAdapter({ source }),
    enabledByDefault: true,
    rankingWeight: 0.5,
    ...overrides,
  };
}
