/**
 * P3-E11-T10 Stage 6 Responsibility Matrix testing fixture factory.
 */

import type { IResponsibilityAssignment } from '../src/startup/responsibility-matrix/types.js';

export const createMockResponsibilityAssignment = (
  overrides: Partial<IResponsibilityAssignment> = {},
): IResponsibilityAssignment => ({
  assignmentId: 'asgn-001',
  rowId: 'row-001',
  matrixId: 'mtx-001',
  roleCode: 'PX',
  assignedPersonName: null,
  assignedUserId: null,
  value: null,
  effectiveFrom: null,
  acknowledgedAt: null,
  acknowledgedBy: null,
  lastModifiedAt: null,
  lastModifiedBy: null,
  ...overrides,
});
