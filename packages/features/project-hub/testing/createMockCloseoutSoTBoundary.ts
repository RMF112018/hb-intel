/**
 * P3-E10-T01 Closeout Module testing fixture factory.
 */

import type { ICloseoutSoTBoundary } from '../src/closeout/foundation/types.js';

export const createMockCloseoutSoTBoundary = (
  overrides: Partial<ICloseoutSoTBoundary> = {},
): ICloseoutSoTBoundary => ({
  dataConcern: 'Checklist item result',
  sotOwner: '@hbc/project-closeout',
  whoWrites: 'PM, SUPT',
  whoReads: 'PM, SUPT, PE, PER, Reports (snapshot)',
  ...overrides,
});
