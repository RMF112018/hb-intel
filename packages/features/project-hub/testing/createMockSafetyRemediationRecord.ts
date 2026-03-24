/**
 * P3-E11-T10 Stage 3 Safety Readiness testing fixture factory.
 */

import type { ISafetyRemediationRecord } from '../src/startup/safety-readiness/types.js';

export const createMockSafetyRemediationRecord = (
  overrides: Partial<ISafetyRemediationRecord> = {},
): ISafetyRemediationRecord => ({
  remediationId: 'rem-001',
  itemId: 'sri-001',
  safetyChecklistId: 'sc-001',
  programId: 'prg-001',
  remediationNote: null,
  remediationStatus: 'PENDING',
  assignedRoleCode: null,
  assignedPersonName: null,
  assignedUserId: null,
  dueDate: null,
  evidenceAttachmentIds: [],
  escalationLevel: 'NONE',
  escalatedAt: null,
  escalatedBy: null,
  escalationNote: null,
  programBlockerRef: null,
  resolvedAt: null,
  resolvedBy: null,
  createdAt: '2026-03-24T00:00:00.000Z',
  createdBy: 'SYSTEM',
  ...overrides,
});
