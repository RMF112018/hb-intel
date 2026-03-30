import { beforeEach, describe, expect, it } from 'vitest';
import { createTestSession } from './renderWithProviders.js';
import {
  createUiReviewProjectSetupClient,
  resetUiReviewProjectSetupStorage,
  UI_REVIEW_REQUESTS_STORAGE_KEY,
  UI_REVIEW_STATUSES_STORAGE_KEY,
} from '../project-setup/backend/uiReviewProjectSetupClient.js';

describe('uiReviewProjectSetupClient', () => {
  const submittedBy = createTestSession().user.email;

  beforeEach(() => {
    resetUiReviewProjectSetupStorage();
  });

  it('seeds realistic sample data on first load', async () => {
    const client = createUiReviewProjectSetupClient(submittedBy);
    const requests = await client.listRequests();

    expect(requests).toHaveLength(5);
    expect(requests.map((request) => request.state)).toEqual(
      expect.arrayContaining([
        'UnderReview',
        'NeedsClarification',
        'Provisioning',
        'Failed',
        'Completed',
      ]),
    );
    expect(requests[0]).toEqual(
      expect.objectContaining({
        projectStreetAddress: expect.any(String),
        projectCity: expect.any(String),
        projectCounty: expect.any(String),
        projectState: expect.any(String),
        projectZip: expect.any(String),
      }),
    );
    expect(window.localStorage.getItem(UI_REVIEW_REQUESTS_STORAGE_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(UI_REVIEW_STATUSES_STORAGE_KEY)).not.toBeNull();
  });

  it('self-heals corrupt localStorage by reseeding', async () => {
    window.localStorage.setItem(UI_REVIEW_REQUESTS_STORAGE_KEY, '{bad-json');
    window.localStorage.setItem(UI_REVIEW_STATUSES_STORAGE_KEY, '[]');

    const client = createUiReviewProjectSetupClient(submittedBy);
    const requests = await client.listRequests();

    expect(requests).toHaveLength(5);
    expect(requests[0]?.requestId).toBeTruthy();
  });

  it('creates a new request and matching stored status', async () => {
    const client = createUiReviewProjectSetupClient(submittedBy);
    const result = await client.submitRequest({
      projectName: 'Created In Review Mode',
      projectStreetAddress: '100 Broadway',
      projectCity: 'Nashville',
      projectCounty: 'Davidson',
      projectState: 'TN',
      projectZip: '37201',
      officeDivision: 'South General Commercial (01-53)',
      department: 'commercial',
      projectType: 'Corporate headquarters',
      projectStage: 'Lead',
      contractType: 'Design-Build (DB) Contract',
      groupMembers: ['pm@hb.com'],
    });

    const requests = await client.listRequests();
    const storedStatus = await client.getProvisioningStatus(result.projectId);

    expect(requests[0]?.requestId).toBe(result.requestId);
    expect(result.submittedBy).toBe(submittedBy);
    expect(result.projectLocation).toBe('100 Broadway, Nashville, Davidson, TN, 37201');
    expect(result.projectStreetAddress).toBe('100 Broadway');
    expect(result.officeDivision).toBe('South General Commercial (01-53)');
    expect(result.projectStage).toBe('Lead');
    expect(storedStatus?.overallStatus).toBe('NotStarted');
    expect(storedStatus?.projectName).toBe('Created In Review Mode');
  });

  it('normalizes older stored requests that only contain legacy projectLocation', async () => {
    window.localStorage.setItem(
      UI_REVIEW_REQUESTS_STORAGE_KEY,
      JSON.stringify([
        {
          requestId: 'req-old',
          projectId: 'proj-old',
          projectName: 'Legacy Request',
          projectLocation: 'Legacy Location',
          projectType: 'GC',
          projectStage: 'Active',
          submittedBy,
          submittedAt: '2026-01-01T00:00:00.000Z',
          state: 'Submitted',
          groupMembers: [],
          retryCount: 0,
        },
      ]),
    );
    window.localStorage.setItem(UI_REVIEW_STATUSES_STORAGE_KEY, JSON.stringify({}));

    const client = createUiReviewProjectSetupClient(submittedBy);
    const requests = await client.listRequests();

      expect(requests[0]).toEqual(
        expect.objectContaining({
          projectLocation: 'Legacy Location',
          projectStreetAddress: 'Legacy Location',
          projectStage: undefined,
          projectType: 'GC',
        }),
      );
  });

  it('updates failed requests into in-progress state on retry', async () => {
    const client = createUiReviewProjectSetupClient(submittedBy);
    const failedRequest = (await client.listRequests()).find(
      (request) => request.state === 'Failed',
    );

    expect(failedRequest).toBeDefined();

    await client.retryProvisioning(failedRequest!.projectId);

    const requests = await client.listRequests();
    const updatedRequest = requests.find(
      (request) => request.projectId === failedRequest!.projectId,
    );
    const updatedStatus = await client.getProvisioningStatus(failedRequest!.projectId);

    expect(updatedRequest?.state).toBe('Provisioning');
    expect(updatedStatus?.overallStatus).toBe('InProgress');
    expect(updatedStatus?.retryCount).toBe(2);
    expect(updatedStatus?.steps[2]?.status).toBe('InProgress');
  });

  it('records escalation metadata without clearing failed state', async () => {
    const client = createUiReviewProjectSetupClient(submittedBy);
    const failedRequest = (await client.listRequests()).find(
      (request) => request.state === 'Failed',
    );

    await client.escalateProvisioning(failedRequest!.projectId, 'admin@hb.com');

    const updatedStatus = await client.getProvisioningStatus(failedRequest!.projectId);
    expect(updatedStatus?.overallStatus).toBe('Failed');
    expect(updatedStatus?.escalatedBy).toBe('admin@hb.com');
    expect(updatedStatus?.escalatedAt).toBeTruthy();
  });
});
