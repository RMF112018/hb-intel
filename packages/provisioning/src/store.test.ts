import { beforeEach, describe, expect, it } from 'vitest';
import type { IProjectSetupRequest, IProvisioningProgressEvent, IProvisioningStatus } from '@hbc/models';
import { useProvisioningStore } from './store.js';

function createStatus(): IProvisioningStatus {
  const now = new Date().toISOString();
  return {
    projectId: 'p-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'c-1',
    overallStatus: 'InProgress',
    currentStep: 1,
    steps: [
      {
        stepNumber: 1,
        stepName: 'Create Site',
        status: 'InProgress',
        startedAt: now,
      },
    ],
    triggeredBy: 'controller@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['team@hb.com'],
    startedAt: now,
    step5DeferredToTimer: false,
    retryCount: 0,
  };
}

function createRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'p-1',
    projectId: 'p-1',
    projectName: 'Test Project',
    projectLocation: '',
    projectType: 'GC',
    projectStage: 'Pursuit',
    submittedBy: 'submitter@hb.com',
    submittedAt: new Date().toISOString(),
    state: 'Provisioning',
    groupMembers: ['team@hb.com'],
    retryCount: 0,
    ...overrides,
  };
}

function createProgressEvent(
  overallStatus: IProvisioningStatus['overallStatus'],
  stepOverrides?: Partial<IProvisioningProgressEvent>,
): IProvisioningProgressEvent {
  return {
    projectId: 'p-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'c-1',
    stepNumber: 1,
    stepName: 'Create Site',
    status: 'Completed',
    overallStatus,
    timestamp: new Date().toISOString(),
    ...stepOverrides,
  };
}

function resetStore() {
  useProvisioningStore.setState({
    requests: [],
    requestsLoading: false,
    requestsError: null,
    statusByProjectId: {},
    latestEventByProjectId: {},
    signalRConnected: false,
  });
}

describe('D-PH6-09 useProvisioningStore handleProgressEvent', () => {
  beforeEach(resetStore);

  it('updates latestEventByProjectId and matching status step', () => {
    const initialStatus = createStatus();
    useProvisioningStore.getState().setProvisioningStatus(initialStatus);

    const event = createProgressEvent('Completed');
    useProvisioningStore.getState().handleProgressEvent(event);

    const state = useProvisioningStore.getState();
    expect(state.latestEventByProjectId['p-1']).toEqual(event);
    expect(state.statusByProjectId['p-1'].overallStatus).toBe('Completed');
    expect(state.statusByProjectId['p-1'].steps[0].status).toBe('Completed');
    expect(state.statusByProjectId['p-1'].steps[0].completedAt).toBe(event.timestamp);
  });

  it('creates skeleton status when event arrives before API fetch', () => {
    // No status in store — simulate SignalR event arriving before API response
    const event = createProgressEvent('InProgress', { stepNumber: 2, stepName: 'Create Doc Lib' });
    useProvisioningStore.getState().handleProgressEvent(event);

    const state = useProvisioningStore.getState();
    const status = state.statusByProjectId['p-1'];
    expect(status).toBeDefined();
    expect(status.projectId).toBe('p-1');
    expect(status.projectNumber).toBe('25-001-01');
    expect(status.overallStatus).toBe('InProgress');
    expect(status.steps).toHaveLength(7);
    expect(status.steps[1].status).toBe('Completed'); // stepNumber 2 updated
  });

  it('propagates terminal Completed event to matching request', () => {
    useProvisioningStore.getState().setRequests([createRequest({ state: 'Provisioning' })]);
    useProvisioningStore.getState().setProvisioningStatus(createStatus());

    const event = createProgressEvent('Completed');
    useProvisioningStore.getState().handleProgressEvent(event);

    const state = useProvisioningStore.getState();
    expect(state.requests[0].state).toBe('Completed');
  });

  it('propagates terminal Failed event to matching request', () => {
    useProvisioningStore.getState().setRequests([createRequest({ state: 'Provisioning' })]);
    useProvisioningStore.getState().setProvisioningStatus(createStatus());

    const event = createProgressEvent('Failed', { status: 'Failed', errorMessage: 'Step 1 failed' });
    useProvisioningStore.getState().handleProgressEvent(event);

    const state = useProvisioningStore.getState();
    expect(state.requests[0].state).toBe('Failed');
    expect(state.statusByProjectId['p-1'].steps[0].errorMessage).toBe('Step 1 failed');
  });

  it('does not modify requests for non-terminal events', () => {
    useProvisioningStore.getState().setRequests([createRequest({ state: 'Provisioning' })]);
    useProvisioningStore.getState().setProvisioningStatus(createStatus());

    const event = createProgressEvent('InProgress');
    useProvisioningStore.getState().handleProgressEvent(event);

    const state = useProvisioningStore.getState();
    expect(state.requests[0].state).toBe('Provisioning');
  });
});
