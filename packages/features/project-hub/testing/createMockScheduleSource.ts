import type { ICanonicalScheduleSource } from '../src/schedule/types/index.js';

export const createMockScheduleSource = (
  overrides?: Partial<ICanonicalScheduleSource>,
): ICanonicalScheduleSource => ({
  sourceId: 'src-001',
  projectId: 'proj-001',
  sourceName: 'Primavera P6 — General Contractor',
  sourceSystem: 'PrimaveraP6',
  isCanonical: true,
  sourceOwnerRole: 'PM',
  registeredBy: 'user-001',
  registeredAt: '2026-01-15T09:00:00Z',
  promotedToCanonicalAt: null,
  promotedBy: null,
  deregisteredAt: null,
  notes: null,
  ...overrides,
});
