import type { IBlockerRecord } from '../src/schedule/types/index.js';

export const createMockBlockerRecord = (
  overrides?: Partial<IBlockerRecord>,
): IBlockerRecord => ({
  blockerId: 'blocker-001',
  projectId: 'proj-001',
  workPackageId: 'wp-001',
  externalActivityKey: null,
  blockerName: 'Missing steel delivery',
  blockerDescription: 'Steel shipment delayed by supplier',
  blockerType: 'Material',
  causationCode: 'MATERIAL_DELAY',
  severity: 'Blocking',
  status: 'Open',
  ownerUserId: 'user-pm-001',
  reportedBy: 'user-foreman-001',
  identifiedAt: '2026-04-05T10:00:00Z',
  targetResolutionDate: '2026-04-12',
  resolvedAt: null,
  resolutionNotes: null,
  scheduledImpactDays: 5,
  linkedArtifacts: [],
  escalationDueAt: '2026-04-10T09:00:00Z',
  syncStatus: 'Synced',
  createdAt: '2026-04-05T10:00:00Z',
  ...overrides,
});
