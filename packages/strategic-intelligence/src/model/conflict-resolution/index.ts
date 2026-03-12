import type { IIntelligenceConflict } from '../../types/index.js';

export const createIntelligenceConflict = (
  overrides?: Partial<IIntelligenceConflict>
): IIntelligenceConflict => ({
  conflictId: 'conflict-default',
  type: 'contradiction',
  relatedEntryIds: [],
  resolutionStatus: 'open',
  ...overrides,
});
