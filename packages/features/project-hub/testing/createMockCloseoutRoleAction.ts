/**
 * P3-E10-T09 Permissions testing fixture factory.
 */

import type { ICloseoutRoleAction } from '../src/closeout/permissions/types.js';

export const createMockCloseoutRoleAction = (
  overrides: Partial<ICloseoutRoleAction> = {},
): ICloseoutRoleAction => ({
  category: 'Checklist',
  action: 'View checklist',
  pm: true,
  supt: true,
  pe: true,
  per: true,
  moe: false,
  ...overrides,
});
