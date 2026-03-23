import type { ICommercialImpactRecord } from '../src/constraints/delay-ledger/types.js';

export const createMockCommercialImpactRecord = (
  overrides?: Partial<ICommercialImpactRecord>,
): ICommercialImpactRecord => ({
  hasCostImpact: true,
  costImpactEstimate: 45000,
  costImpactConfidence: 'Rough',
  costImpactDescription:
    'Estimated general conditions extension cost for 14 calendar day delay including site supervision, temporary facilities, and equipment rental.',
  costImpactBreakdown: [],
  linkedChangeEventId: null,
  separationConfirmed: true,
  ...overrides,
});
