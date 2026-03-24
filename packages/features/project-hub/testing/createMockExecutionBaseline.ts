/**
 * P3-E11-T10 Stage 7 Execution Baseline testing fixture factory.
 */

import type { IProjectExecutionBaseline } from '../src/startup/execution-baseline/types.js';

export const createMockExecutionBaseline = (
  overrides: Partial<IProjectExecutionBaseline> = {},
): IProjectExecutionBaseline => ({
  baselineId: 'bl-001',
  programId: 'prg-001',
  projectId: 'proj-001',
  projectName: 'Test Project',
  projectNumber: 'TP-2026-001',
  submittedBy: null,
  submittedByUserId: null,
  approvedBy: null,
  approvedByUserId: null,
  planDate: null,
  status: 'Draft',
  lastModifiedAt: '2026-03-24T00:00:00.000Z',
  createdAt: '2026-03-24T00:00:00.000Z',
  distributionResidential: [],
  distributionCommercial: [],
  certificationStatus: 'NOT_SUBMITTED',
  ...overrides,
});
