import type { IPermitApplication } from '../src/permits/records/types.js';

export const createMockPermitApplication = (
  overrides?: Partial<IPermitApplication>,
): IPermitApplication => ({
  applicationId: 'app-001',
  projectId: 'proj-001',
  permitType: 'MASTER_BUILDING',
  jurisdictionName: 'City of Austin Development Services',
  jurisdictionContact: { contactName: 'Jane Doe', title: 'Plan Reviewer', phone: '(512) 555-0100', email: 'jdoe@austintexas.gov', address: null, officeHours: 'M-F 8am-5pm', portalUrl: 'https://abc.austintexas.gov' },
  applicationDate: '2026-01-15',
  submittedById: 'user-001',
  submittedByName: 'John Smith',
  applicationStatus: 'SUBMITTED',
  submissionMethod: 'PORTAL',
  trackingNumber: 'BP-2026-001234',
  estimatedResponseDate: '2026-03-15',
  applicationFeeAmount: 2500,
  bondAmountRequired: 0,
  feesPaid: true,
  jurisdictionResponseDate: null,
  rejectionReason: null,
  issuedPermitId: null,
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-01-15T09:00:00Z',
  createdByUserId: 'user-001',
  ...overrides,
});
