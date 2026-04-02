import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  IProjectSetupRequest,
  IProvisioningProgressEvent,
  IProvisioningStatus,
} from '@hbc/models';

export interface IProvisioningStore {
  // Request lifecycle state
  requests: IProjectSetupRequest[];
  requestsLoading: boolean;
  requestsError: string | null;
  setRequests: (requests: IProjectSetupRequest[]) => void;
  setRequestsLoading: (loading: boolean) => void;
  setRequestsError: (error: string | null) => void;
  upsertRequest: (request: IProjectSetupRequest) => void;

  // Provisioning status keyed by projectId
  statusByProjectId: Record<string, IProvisioningStatus>;
  setProvisioningStatus: (status: IProvisioningStatus) => void;

  // Last progress event keyed by projectId
  latestEventByProjectId: Record<string, IProvisioningProgressEvent>;
  handleProgressEvent: (event: IProvisioningProgressEvent) => void;

  // SignalR connection state
  signalRConnected: boolean;
  setSignalRConnected: (connected: boolean) => void;
}

/**
 * D-PH6-09 / P4-03: Shared headless provisioning Zustand slice.
 *
 * **Authoritative status precedence (P4-03):**
 * - `setProvisioningStatus()` performs wholesale replacement from the API endpoint.
 *   This is the authoritative source of truth for provisioning state.
 * - `handleProgressEvent()` performs incremental merge from SignalR events.
 *   SignalR is an enhancement layer — it may update step status and overallStatus
 *   but never overwrites the full status record.
 * - A correlationId stale-event guard ensures events from a different run
 *   than the known status are dropped. The next API fetch will bring the
 *   authoritative status for run transitions.
 *
 * Traceability: docs/reference/provisioning/durable-status-contract.md
 */
export const useProvisioningStore = create<IProvisioningStore>()(
  immer((set) => ({
    requests: [],
    requestsLoading: false,
    requestsError: null,
    statusByProjectId: {},
    latestEventByProjectId: {},
    signalRConnected: false,

    setRequests: (requests) =>
      set((s) => {
        s.requests = requests;
      }),
    setRequestsLoading: (loading) =>
      set((s) => {
        s.requestsLoading = loading;
      }),
    setRequestsError: (error) =>
      set((s) => {
        s.requestsError = error;
      }),

    upsertRequest: (request) =>
      set((s) => {
        const idx = s.requests.findIndex((r) => r.requestId === request.requestId);
        if (idx >= 0) s.requests[idx] = request;
        else s.requests.push(request);
      }),

    // P4-03: Wholesale replacement from the authoritative API endpoint.
    // Overwrites any skeleton or partial SignalR state for this project.
    setProvisioningStatus: (status) =>
      set((s) => {
        s.statusByProjectId[status.projectId] = status;
      }),

    // P4-03: Incremental merge from SignalR enhancement events.
    // SignalR events update step status and overallStatus but never overwrite the
    // full status record. The API endpoint (setProvisioningStatus) is authoritative.
    handleProgressEvent: (event) =>
      set((s) => {
        // Always store the latest event for banner/checklist consumers.
        s.latestEventByProjectId[event.projectId] = event;

        // Keep statusByProjectId synchronized so consumers can render merged step state.
        let existing = s.statusByProjectId[event.projectId];
        if (!existing) {
          // Create a skeleton status so early SignalR events aren't lost
          // when the API-fetched status hasn't arrived yet.
          existing = {
            projectId: event.projectId,
            projectNumber: event.projectNumber,
            projectName: event.projectName,
            correlationId: event.correlationId,
            overallStatus: event.overallStatus,
            currentStep: event.stepNumber,
            steps: Array.from({ length: 7 }, (_, i) => ({
              stepNumber: i + 1,
              stepName: `Step ${i + 1}`,
              status: 'NotStarted' as const,
            })),
            triggeredBy: '',
            submittedBy: '',
            groupMembers: [],
            startedAt: event.timestamp,
            step5DeferredToTimer: false,
            step5TimerRetryCount: 0,
            retryCount: 0,
          };
          s.statusByProjectId[event.projectId] = existing;
        }

        // P4-03: Stale-event guard — drop events from a different run than the
        // known status. On retry the API fetch (setProvisioningStatus) will bring
        // the new run's correlationId; subsequent SignalR events will then match.
        if (existing.correlationId && existing.correlationId !== event.correlationId) {
          return;
        }

        existing.overallStatus = event.overallStatus;
        existing.currentStep = event.stepNumber;
        const stepIdx = existing.steps.findIndex((step) => step.stepNumber === event.stepNumber);
        if (stepIdx >= 0) {
          existing.steps[stepIdx].status = event.status;
          if (event.status === 'Completed') existing.steps[stepIdx].completedAt = event.timestamp;
          if (event.status === 'Failed') existing.steps[stepIdx].errorMessage = event.errorMessage;
        }

        // Propagate terminal provisioning events to the request list so
        // request-level UI updates without requiring a full API refetch.
        if (event.overallStatus === 'Completed' || event.overallStatus === 'Failed') {
          const requestState = event.overallStatus === 'Completed' ? 'Completed' : 'Failed';
          const reqIdx = s.requests.findIndex((r) => r.projectId === event.projectId);
          if (reqIdx >= 0) {
            s.requests[reqIdx].state = requestState;
          }
        }
      }),

    setSignalRConnected: (connected) =>
      set((s) => {
        s.signalRConnected = connected;
      }),
  }))
);
