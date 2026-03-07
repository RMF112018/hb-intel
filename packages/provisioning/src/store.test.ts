import { beforeEach, describe, expect, it } from 'vitest';
import type { IProvisioningProgressEvent, IProvisioningStatus } from '@hbc/models';
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

function createProgressEvent(status: IProvisioningStatus['overallStatus']): IProvisioningProgressEvent {
  return {
    projectId: 'p-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'c-1',
    stepNumber: 1,
    stepName: 'Create Site',
    status: 'Completed',
    overallStatus: status,
    timestamp: new Date().toISOString(),
  };
}

describe('D-PH6-09 useProvisioningStore handleProgressEvent', () => {
  beforeEach(() => {
    useProvisioningStore.setState({
      requests: [],
      requestsLoading: false,
      requestsError: null,
      statusByProjectId: {},
      latestEventByProjectId: {},
      signalRConnected: false,
    });
  });

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
});
