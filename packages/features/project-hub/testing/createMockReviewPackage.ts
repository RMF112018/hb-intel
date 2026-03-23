import type { IReviewPackage } from '../src/constraints/publication/types.js';

export const createMockReviewPackage = (
  overrides?: Partial<IReviewPackage>,
): IReviewPackage => ({
  reviewPackageId: 'rp-001',
  projectId: 'proj-001',
  packageNumber: 'RP-001',
  reviewPeriod: 'March 2026 Monthly Review',
  ledgersIncluded: ['Risk', 'Constraint', 'Delay', 'Change'],
  snapshotData: {},
  publishedAt: '2026-03-20T16:00:00Z',
  publishedBy: 'user-pm-001',
  status: 'Active',
  ...overrides,
});
