import type { IWorkPackageLinkRecord } from '../src/schedule/types/index.js';

export const createMockWorkPackageLinkRecord = (
  overrides?: Partial<IWorkPackageLinkRecord>,
): IWorkPackageLinkRecord => ({
  linkId: 'link-001',
  projectId: 'proj-001',
  predecessorWorkPackageId: 'wp-001',
  successorWorkPackageId: 'wp-002',
  linkType: 'FS',
  lagDays: 0,
  promotionEligible: false,
  createdBy: 'user-foreman-001',
  createdAt: '2026-04-05T09:00:00Z',
  ...overrides,
});
