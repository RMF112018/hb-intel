/**
 * P3-E10-T04 Closeout Lifecycle testing fixture factories.
 */

import type { ICloseoutMilestoneRecord, IArchiveReadyContext } from '../src/closeout/lifecycle/types.js';

export const createMockCloseoutMilestoneRecord = (
  overrides: Partial<ICloseoutMilestoneRecord> = {},
): ICloseoutMilestoneRecord => ({
  milestoneId: 'ms-001',
  projectId: 'proj-001',
  milestoneKey: 'CHECKLIST_ACTIVATED',
  milestoneLabel: 'Checklist Activated',
  status: 'PENDING',
  evidenceType: 'System',
  evidenceRecordId: null,
  evidenceDate: null,
  externalDependency: false,
  approvalRequired: false,
  approvedAt: null,
  approvedBy: null,
  spineEvent: null,
  notes: null,
  ...overrides,
});

export const createMockArchiveReadyContext = (
  overrides: Partial<IArchiveReadyContext> = {},
): IArchiveReadyContext => ({
  completionPercentage: 100,
  allNonYesItemsHaveNaJustification: true,
  section6CompletionPercentage: 100,
  item311YesWithDate: true,
  item415Yes: true,
  scorecardsCompleteMilestoneApproved: true,
  lessonsApprovedMilestoneApproved: true,
  autopsyCompleteMilestoneApproved: true,
  financialFinalPaymentConfirmed: true,
  ...overrides,
});
