/**
 * P3-E10-T10 Integration testing fixture factory.
 */

import type { IRelatedItemsPair } from '../src/closeout/integration/types.js';

export const createMockRelatedItemsPair = (
  overrides: Partial<IRelatedItemsPair> = {},
): IRelatedItemsPair => ({
  relationship: 'closeout-item → permit',
  source: 'CloseoutChecklistItem',
  target: 'IssuedPermit',
  items: 'Items 2.8, 3.9',
  behavior: 'Suggests readiness when permit reaches FINAL',
  ...overrides,
});
