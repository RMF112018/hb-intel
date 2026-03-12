import type { IIntelligenceConflict } from '../src/types/index.js';
import { createIntelligenceConflict } from '../src/model/index.js';

const merge = <T extends object>(base: T, overrides?: Partial<T>): T => ({
  ...base,
  ...(overrides ?? {}),
});

export const createMockIntelligenceConflict = (
  overrides?: Partial<IIntelligenceConflict>
): IIntelligenceConflict =>
  merge(createIntelligenceConflict(), {
    conflictId: 'conflict-mock',
    type: 'contradiction',
    relatedEntryIds: ['living-entry-mock'],
    resolutionStatus: 'open',
    ...overrides,
  });
