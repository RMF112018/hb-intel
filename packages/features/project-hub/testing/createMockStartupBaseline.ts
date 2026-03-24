/**
 * P3-E11-T10 Stage 8 Baseline Lock testing fixture factory.
 */

import type { IStartupBaseline } from '../src/startup/baseline-lock/types.js';

export const createMockStartupBaseline = (
  overrides: Partial<IStartupBaseline> = {},
): IStartupBaseline => ({
  snapshotId: 'snap-001',
  programId: 'prg-001',
  projectId: 'proj-001',
  lockedAt: '2026-04-15T14:00:00.000Z',
  lockedBy: 'user-px-001',
  programStateAtLock: 'BASELINE_LOCKED',
  stabilizationWindowDays: 14,
  stabilizationActualDuration: 12,
  taskLibrarySnapshotAtLock: { totalTasks: 55, yesTasks: 50, noTasks: 2, naTasks: 3, unreviewedTasks: 0, openBlockers: 0 },
  safetyReadinessSnapshotAtLock: { passCount: 28, failCount: 2, naCount: 2, openRemediations: 0, resolvedRemediations: 2 },
  permitPostingSnapshotAtLock: [
    { taskNumber: '4.01', description: 'Master permit', result: 'Yes' },
    { taskNumber: '4.02', description: 'Roofing permit', result: 'Yes' },
    { taskNumber: '4.03', description: 'Plumbing permit', result: 'Yes' },
    { taskNumber: '4.04', description: 'HVAC permit', result: 'Yes' },
    { taskNumber: '4.05', description: 'Electric permit', result: 'Yes' },
    { taskNumber: '4.06', description: 'Fire Alarm permit', result: 'Yes' },
    { taskNumber: '4.07', description: 'Fire Sprinklers permit', result: 'Yes' },
    { taskNumber: '4.08', description: 'Elevator permit', result: 'NA' },
    { taskNumber: '4.09', description: 'Irrigation permit', result: 'NA' },
    { taskNumber: '4.10', description: 'Low Voltage permit', result: 'Yes' },
    { taskNumber: '4.11', description: 'Site-Utilities permits', result: 'Yes' },
    { taskNumber: '4.12', description: 'Right of way, FDOT, MOT plans', result: 'NA' },
  ],
  contractObligationsSnapshotAtLock: { totalObligations: 8, flaggedObligations: 2, openObligations: 1, satisfiedObligations: 5 },
  responsibilitySnapshotAtLock: {
    pmSheetAssigned: true,
    fieldSheetAssigned: true,
    unassignedCategories: [],
    primaryAssignments: [
      { sheet: 'PM', taskCategory: 'PX', roleCode: 'PX', assignedPersonName: 'Jane Doe', assignedUserId: 'user-px-001', acknowledgedAt: '2026-03-28T09:00:00Z' },
    ],
  },
  executionBaselineFieldsAtLock: {
    safetyOfficerName: 'John Smith',
    safetyOfficerRole: 'Safety Director',
    projectStartDate: '2026-04-01',
    substantialCompletionDate: '2027-06-01',
    noticeToProceedDate: '2026-03-15',
    goalSubstantialCompletionDate: '2027-05-15',
    goalFinalCompletionDate: '2027-07-01',
    contractAmount: 15000000,
  },
  pmPlanStatusAtLock: 'Approved',
  certificationSummaryAtLock: [
    { subSurface: 'STARTUP_TASK_LIBRARY', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001'] },
    { subSurface: 'SAFETY_READINESS', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001', 'user-safety-001'] },
    { subSurface: 'PERMIT_POSTING', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001'] },
    { subSurface: 'CONTRACT_OBLIGATIONS', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001'] },
    { subSurface: 'RESPONSIBILITY_MATRIX', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001'] },
    { subSurface: 'EXECUTION_BASELINE', certStatus: 'ACCEPTED', certVersion: 1, certifiedBy: ['user-pm-001'] },
  ],
  approvedWaiversAtLock: [],
  lapsedWaiversAtLock: [],
  openProgramBlockersAtLock: [],
  peFlagsAtLock: [],
  authorizingPEUserId: 'user-px-001',
  authorizationTimestamp: '2026-04-01T08:00:00.000Z',
  ...overrides,
});
