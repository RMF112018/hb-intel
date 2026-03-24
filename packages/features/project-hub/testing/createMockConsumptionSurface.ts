/**
 * P3-E10-T08 Project Hub Consumption testing fixture factory.
 */

import type { IProjectProfile, IIndexEntryProfile } from '../src/closeout/consumption/types.js';

export const createMockProjectProfile = (
  overrides: Partial<IProjectProfile> = {},
): IProjectProfile => ({
  marketSector: 'K12Education',
  deliveryMethod: 'GMP',
  sizeBand: 'FifteenToFiftyM',
  ...overrides,
});

export const createMockIndexEntryProfile = (
  overrides: Partial<IIndexEntryProfile> = {},
): IIndexEntryProfile => ({
  marketSector: 'K12Education',
  deliveryMethod: 'GMP',
  projectSizeBand: 'FifteenToFiftyM',
  applicability: 4,
  ...overrides,
});
