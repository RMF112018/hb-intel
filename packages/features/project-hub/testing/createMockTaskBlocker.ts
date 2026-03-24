/**
 * P3-E11-T10 Stage 2 Startup Task Library testing fixture factory.
 */

import type { ITaskBlocker } from '../src/startup/task-library/types.js';

export const createMockTaskBlocker = (
  overrides: Partial<ITaskBlocker> = {},
): ITaskBlocker => ({
  blockerId: 'blk-001',
  instanceId: 'inst-001',
  programId: 'prg-001',
  projectId: 'proj-001',
  blockerType: 'OTHER',
  description: 'Test blocker description',
  responsibleParty: null,
  dueDate: null,
  blockerStatus: 'OPEN',
  isAutoCreated: false,
  linkedWaiverId: null,
  resolvedAt: null,
  resolvedBy: null,
  createdAt: '2026-03-24T00:00:00.000Z',
  createdBy: 'user-pm-001',
  ...overrides,
});
