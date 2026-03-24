/**
 * P3-E11-T10 Stage 5 Contract Obligations Register testing fixture factory.
 */

import type { IContractObligation } from '../src/startup/contract-obligations/types.js';

export const createMockContractObligation = (
  overrides: Partial<IContractObligation> = {},
): IContractObligation => ({
  obligationId: 'obl-001',
  registerId: 'reg-001',
  projectId: 'proj-001',
  article: 'Article 3.2',
  page: 'p. 12',
  exhibitRef: null,
  description: 'Liquidated damages at $1,000/day for late substantial completion',
  category: 'LIQUIDATED_DAMAGES',
  responsibleRoleCode: 'PX',
  responsiblePersonName: null,
  responsibleUserId: null,
  accountableRoleCode: 'PX',
  obligationStatus: 'OPEN',
  flagForMonitoring: true,
  monitoringPriority: 'HIGH',
  triggerBasis: 'MILESTONE_DATE',
  dueDate: null,
  recurrencePeriodDays: null,
  nextMonitoringCheckAt: null,
  notes: null,
  waiverNote: null,
  evidenceAttachmentIds: [],
  satisfiedAt: null,
  satisfiedBy: null,
  createdAt: '2026-03-24T00:00:00.000Z',
  createdBy: 'user-pm-001',
  lastModifiedAt: '2026-03-24T00:00:00.000Z',
  lastModifiedBy: null,
  ...overrides,
});
