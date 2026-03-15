/**
 * W0-G5-T08: MSW HTTP handlers for provisioning API mock.
 */
import { http, HttpResponse } from 'msw';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';

const BASE_URL = 'http://localhost:7071';

const MOCK_REQUEST: IProjectSetupRequest = {
  requestId: 'req-001',
  projectId: 'proj-001',
  projectName: 'Test Project',
  projectLocation: 'New York',
  projectType: 'GC',
  projectStage: 'Pursuit',
  submittedBy: 'user@test.com',
  submittedAt: '2026-03-01T00:00:00.000Z',
  state: 'Submitted',
  groupMembers: ['member@test.com'],
  retryCount: 0,
};

const MOCK_COMPLETED_REQUEST: IProjectSetupRequest = {
  ...MOCK_REQUEST,
  requestId: 'req-002',
  projectId: 'proj-002',
  projectName: 'Completed Project',
  state: 'Completed',
  completedAt: '2026-03-10T00:00:00.000Z',
  siteUrl: 'https://contoso.sharepoint.com/sites/proj-002',
};

const MOCK_FAILED_REQUEST: IProjectSetupRequest = {
  ...MOCK_REQUEST,
  requestId: 'req-003',
  projectId: 'proj-003',
  projectName: 'Failed Project',
  state: 'Failed',
};

const MOCK_PROVISIONING_STATUS: IProvisioningStatus = {
  projectId: 'proj-002',
  projectNumber: '26-001-01',
  projectName: 'Completed Project',
  correlationId: 'corr-001',
  overallStatus: 'Completed',
  currentStep: 7,
  steps: [],
  siteUrl: 'https://contoso.sharepoint.com/sites/proj-002',
  triggeredBy: 'user@test.com',
  submittedBy: 'user@test.com',
  groupMembers: ['member@test.com'],
  startedAt: '2026-03-10T00:00:00.000Z',
  completedAt: '2026-03-10T00:05:00.000Z',
  step5DeferredToTimer: false,
  step5TimerRetryCount: 0,
  retryCount: 0,
};

export const handlers = [
  http.get(`${BASE_URL}/api/project-setup-requests`, ({ request }) => {
    const url = new URL(request.url);
    const submitterId = url.searchParams.get('submitterId');
    if (submitterId) {
      return HttpResponse.json([MOCK_REQUEST, MOCK_COMPLETED_REQUEST, MOCK_FAILED_REQUEST]);
    }
    return HttpResponse.json([MOCK_REQUEST, MOCK_COMPLETED_REQUEST, MOCK_FAILED_REQUEST]);
  }),

  http.post(`${BASE_URL}/api/project-setup-requests`, async ({ request }) => {
    const body = await request.json() as Partial<IProjectSetupRequest>;
    return HttpResponse.json({
      ...MOCK_REQUEST,
      ...body,
      requestId: 'req-new-001',
      projectId: 'proj-new-001',
      state: 'Submitted',
      submittedAt: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/api/provisioning-status/:projectId`, ({ params }) => {
    if (params.projectId === 'proj-002') {
      return HttpResponse.json(MOCK_PROVISIONING_STATUS);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];

export { MOCK_REQUEST, MOCK_COMPLETED_REQUEST, MOCK_FAILED_REQUEST, MOCK_PROVISIONING_STATUS };
