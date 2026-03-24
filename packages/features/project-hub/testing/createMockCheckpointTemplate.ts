import type { ICheckpointTemplate } from '../src/permits/inspection/types.js';

export const createMockCheckpointTemplate = (
  overrides?: Partial<ICheckpointTemplate>,
): ICheckpointTemplate => ({
  templateId: 'tpl-001',
  permitType: 'MASTER_BUILDING',
  checkpointName: 'Building Footer & ISO pads',
  codeReference: 'IBC §1809',
  sequence: 1,
  isBlockingCloseout: true,
  blockedByCheckpointNames: [],
  jurisdictionName: null,
  notes: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});
