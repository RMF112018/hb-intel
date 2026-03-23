import type { IExternalParticipantRecord } from '../src/schedule/types/index.js';

export const createMockExternalParticipantRecord = (
  overrides?: Partial<IExternalParticipantRecord>,
): IExternalParticipantRecord => ({
  participantId: 'ext-001',
  projectId: 'proj-001',
  externalUserId: 'ext-user-001',
  organizationName: 'ABC Subcontractors',
  permittedWorkflows: ['FieldCommitment', 'BlockerResolution'],
  permittedRecordTypes: ['FieldWorkPackage', 'CommitmentRecord', 'BlockerRecord'],
  sensitivityClassExclusions: ['INTERNAL_ANALYTICS'],
  auditEnabled: true,
  approvedBy: 'user-pm-001',
  approvedAt: '2026-03-01T00:00:00Z',
  expiresAt: '2026-12-31T23:59:59Z',
  ...overrides,
});
