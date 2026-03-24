/**
 * P3-E11-T10 Stage 3 Safety Readiness testing fixture factory.
 */

import type { ISafetyReadinessItem } from '../src/startup/safety-readiness/types.js';

export const createMockSafetyReadinessItem = (
  overrides: Partial<ISafetyReadinessItem> = {},
): ISafetyReadinessItem => ({
  itemId: 'sri-001',
  sectionId: 'sec-001',
  itemNumber: '1.1',
  description: 'Fall Exposures',
  result: null,
  assessedBy: null,
  assessedAt: null,
  lastModifiedAt: null,
  lastModifiedBy: null,
  hasOpenRemediation: false,
  ...overrides,
});
