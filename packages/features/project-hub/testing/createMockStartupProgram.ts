/**
 * P3-E11-T10 Stage 1 Startup Module testing fixture factory.
 */

import type { IStartupProgram } from '../src/startup/foundation/types.js';

export const createMockStartupProgram = (
  overrides: Partial<IStartupProgram> = {},
): IStartupProgram => ({
  programId: 'prg-001',
  projectId: 'proj-001',
  projectName: 'Test Project',
  projectNumber: 'TP-2026-001',
  currentStateCode: 'DRAFT',
  stabilizationWindowDays: 14,
  stabilizationWindowOpensAt: null,
  stabilizationWindowClosesAt: null,
  baselineLockedAt: null,
  baselineLockedBy: null,
  createdAt: '2026-03-24T00:00:00.000Z',
  createdBy: 'user-pm-001',
  lastModifiedAt: '2026-03-24T00:00:00.000Z',
  lastModifiedBy: null,
  ...overrides,
});
