/**
 * P3-E8-T01 Safety Module testing fixture factory.
 */

import type { ISafetyAuthorityRule } from '../src/safety/foundation/types.js';

export const createMockSafetyAuthorityRule = (
  overrides: Partial<ISafetyAuthorityRule> = {},
): ISafetyAuthorityRule => ({
  role: 'SafetyManager',
  recordFamily: 'SSSPBasePlan',
  allowedActions: ['Create', 'Read', 'Update', 'Approve', 'Configure'],
  ...overrides,
});
