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
      projectLocation: 'Nashville, TN',
      groupMembers: ['pm@hb.com'],
    });

    const requests = await client.listRequests();
    const storedStatus = await client.getProvisioningStatus(result.projectId);

    expect(requests[0]?.requestId).toBe(result.requestId);
    expect(result.submittedBy).toBe(submittedBy);
    expect(storedStatus?.overallStatus).toBe('NotStarted');
    expect(storedStatus?.projectName).toBe('Created In Review Mode');
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
