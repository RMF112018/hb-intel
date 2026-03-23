import type { IIntentRecord } from '../src/schedule/types/index.js';

export const createMockIntentRecord = (
  overrides?: Partial<IIntentRecord>,
): IIntentRecord => ({
  intentId: 'intent-001',
  deviceId: 'device-ipad-001',
  userId: 'user-foreman-001',
  createdAt: '2026-04-10T08:00:00Z',
  operationType: 'Create',
  recordType: 'FieldWorkPackage',
  targetId: 'wp-offline-001',
  payload: { workPackageName: 'Framing — Created Offline' },
  replayStatus: 'Pending',
  replayedAt: null,
  conflictDetails: null,
  retryCount: 0,
  ...overrides,
});
