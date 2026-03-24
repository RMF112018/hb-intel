/**
 * P3-E11-T10 Stage 4 Permit Posting Verification testing fixture factory.
 */

import type { IPermitVerificationDetail } from '../src/startup/permit-posting/types.js';

export const createMockPermitVerificationDetail = (
  overrides: Partial<IPermitVerificationDetail> = {},
): IPermitVerificationDetail => ({
  detailId: 'pvd-001',
  taskInstanceId: 'inst-401',
  projectId: 'proj-001',
  permitType: 'Master',
  physicalEvidenceAttachmentIds: [],
  verifiedBy: null,
  verifiedAt: null,
  discrepancyReason: null,
  permitModuleRecordRef: null,
  permitStatusFromModule: null,
  permitExpirationFromModule: null,
  lastCrossRefreshedAt: null,
  createdAt: '2026-03-24T00:00:00.000Z',
  lastModifiedAt: '2026-03-24T00:00:00.000Z',
  ...overrides,
});
