import type { IBlockerRecord, IFieldCommitmentRecord, IReadinessRecord } from '../src/schedule/types/index.js';

/** Blocker scenarios for roll-up testing. */
export const blockerRollUpScenarios = {
  criticalOpen: {
    blockerId: 'b-1', projectId: 'proj-001', workPackageId: null, externalActivityKey: null,
    blockerName: 'Critical', blockerDescription: '', blockerType: 'Design' as const,
    causationCode: 'DESIGN', severity: 'Critical' as const, status: 'Open' as const,
    ownerUserId: 'u1', reportedBy: 'u2', identifiedAt: '2026-04-01T00:00:00Z',
    targetResolutionDate: '2026-04-10', resolvedAt: null, resolutionNotes: null,
    scheduledImpactDays: 10, linkedArtifacts: [], escalationDueAt: null,
    syncStatus: 'Synced' as const, createdAt: '2026-04-01T00:00:00Z',
  } satisfies IBlockerRecord,
  informationalOpen: {
    blockerId: 'b-2', projectId: 'proj-001', workPackageId: null, externalActivityKey: null,
    blockerName: 'Info', blockerDescription: '', blockerType: 'Other' as const,
    causationCode: 'OTHER', severity: 'Informational' as const, status: 'Open' as const,
    ownerUserId: 'u1', reportedBy: 'u2', identifiedAt: '2026-04-01T00:00:00Z',
    targetResolutionDate: '2026-04-10', resolvedAt: null, resolutionNotes: null,
    scheduledImpactDays: null, linkedArtifacts: [], escalationDueAt: null,
    syncStatus: 'Synced' as const, createdAt: '2026-04-01T00:00:00Z',
  } satisfies IBlockerRecord,
  resolvedCritical: {
    blockerId: 'b-3', projectId: 'proj-001', workPackageId: null, externalActivityKey: null,
    blockerName: 'Resolved', blockerDescription: '', blockerType: 'Material' as const,
    causationCode: 'MAT', severity: 'Critical' as const, status: 'Resolved' as const,
    ownerUserId: 'u1', reportedBy: 'u2', identifiedAt: '2026-04-01T00:00:00Z',
    targetResolutionDate: '2026-04-10', resolvedAt: '2026-04-08T00:00:00Z', resolutionNotes: 'Fixed',
    scheduledImpactDays: null, linkedArtifacts: [], escalationDueAt: null,
    syncStatus: 'Synced' as const, createdAt: '2026-04-01T00:00:00Z',
  } satisfies IBlockerRecord,
};

/** Commitment scenarios for roll-up testing. */
export const commitmentRollUpScenarios = {
  missed: {
    commitmentId: 'c1', projectId: 'proj-001', workPackageId: null, externalActivityKey: null,
    commitmentType: 'Completion' as const, responsibleUserId: 'u1', responsibleRole: 'Foreman',
    committedDate: '2026-04-10', committedQuantity: null, windowStart: '2026-04-07', windowEnd: '2026-04-20',
    status: 'Missed' as const, acknowledgedAt: null, keptAt: null, missedAt: '2026-04-11T00:00:00Z',
    missedCausationCode: 'WEATHER', missedExplanation: 'Rain', ppcCounted: true,
    reminderDueAt: null, escalationDueAt: null, createdBy: 'u1', createdAt: '2026-04-01T00:00:00Z',
    syncStatus: 'Synced' as const,
  } satisfies IFieldCommitmentRecord,
  accepted: {
    commitmentId: 'c2', projectId: 'proj-001', workPackageId: null, externalActivityKey: null,
    commitmentType: 'Completion' as const, responsibleUserId: 'u2', responsibleRole: 'Foreman',
    committedDate: '2026-04-15', committedQuantity: null, windowStart: '2026-04-07', windowEnd: '2026-04-20',
    status: 'Accepted' as const, acknowledgedAt: '2026-04-02T00:00:00Z', keptAt: null, missedAt: null,
    missedCausationCode: null, missedExplanation: null, ppcCounted: true,
    reminderDueAt: null, escalationDueAt: null, createdBy: 'u1', createdAt: '2026-04-01T00:00:00Z',
    syncStatus: 'Synced' as const,
  } satisfies IFieldCommitmentRecord,
};
