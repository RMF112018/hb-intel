/**
 * P3-E11-T10 Stage 2 Startup Task Library testing fixture factory.
 */

import type { IStartupTaskInstance } from '../src/startup/task-library/types.js';

export const createMockStartupTaskInstance = (
  overrides: Partial<IStartupTaskInstance> = {},
): IStartupTaskInstance => ({
  instanceId: 'inst-001',
  programId: 'prg-001',
  projectId: 'proj-001',
  templateId: 'tmpl-001',
  templateVersion: 1,
  taskNumber: '2.1',
  title: 'Review Bonding / SDI Requirements',
  sectionCode: 'JOB_STARTUP',
  category: 'CONTRACTUAL_OBLIGATION',
  severity: 'CRITICAL',
  gatingImpact: 'BLOCKS_CERTIFICATION',
  ownerRoleCode: 'PX',
  activeDuringStabilization: false,
  result: null,
  notes: null,
  evidenceAttachmentIds: [],
  evidenceNotes: null,
  assignedUserId: null,
  dueDate: null,
  isOverdue: false,
  hasActiveBlocker: false,
  publicationState: 'DRAFT',
  lastModifiedAt: '2026-03-24T00:00:00.000Z',
  lastModifiedBy: null,
  ...overrides,
});
