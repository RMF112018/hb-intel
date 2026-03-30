import type {
  IProjectSetupRequest,
  IProvisioningStatus,
  ISagaStepResult,
} from '@hbc/models';
import type { IProjectSetupClient } from './types.js';

export const UI_REVIEW_REQUESTS_STORAGE_KEY =
  'hb-intel:estimating:ui-review:project-setup:requests';
export const UI_REVIEW_STATUSES_STORAGE_KEY =
  'hb-intel:estimating:ui-review:project-setup:statuses';

interface IUiReviewState {
  requests: IProjectSetupRequest[];
  statuses: Record<string, IProvisioningStatus>;
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStorage(): Storage {
  return window.localStorage;
}

function nowIso(): string {
  return new Date().toISOString();
}

function offsetIso(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function createStep(
  stepNumber: number,
  stepName: string,
  status: ISagaStepResult['status'],
  timestamps: Partial<Pick<ISagaStepResult, 'startedAt' | 'completedAt' | 'errorMessage'>> = {},
): ISagaStepResult {
  return {
    stepNumber,
    stepName,
    status,
    ...timestamps,
  };
}

function createBaseRequest(
  submittedBy: string,
  overrides: Partial<IProjectSetupRequest>,
): IProjectSetupRequest {
  return {
    requestId: 'req-ui-review-base',
    projectId: 'proj-ui-review-base',
    projectName: 'HB Intel UI Review Project',
    projectLocation: 'Charlotte, NC',
    projectType: 'GC',
    projectStage: 'Pursuit',
    submittedBy,
    submittedAt: nowIso(),
    state: 'Submitted',
    groupMembers: ['team.member@hb.com', 'field.lead@hb.com'],
    groupLeaders: ['leader@hb.com'],
    department: 'commercial',
    retryCount: 0,
    projectLeadId: 'pm@hb.com',
    viewerUPNs: ['viewer@hb.com'],
    addOns: ['bid-board', 'drawing-log'],
    estimatedValue: 1250000,
    clientName: 'City of Charlotte',
    startDate: offsetIso(14),
    contractType: 'CMAR',
    year: new Date().getFullYear(),
    ...overrides,
  };
}

function createSeededState(submittedBy: string): IUiReviewState {
  const underReview = createBaseRequest(submittedBy, {
    requestId: 'req-ui-review-under-review',
    projectId: 'proj-ui-review-under-review',
    projectName: 'Crescent Renovation',
    submittedAt: offsetIso(-5),
    state: 'UnderReview',
  });

  const needsClarification = createBaseRequest(submittedBy, {
    requestId: 'req-ui-review-clarification',
    projectId: 'proj-ui-review-clarification',
    projectName: 'South End Tenant Upfit',
    submittedAt: offsetIso(-4),
    state: 'NeedsClarification',
    clarificationNote: 'Clarify the project lead and target start date before review can continue.',
    clarificationRequestedAt: offsetIso(-2),
    projectStage: 'Active',
  });

  const provisioning = createBaseRequest(submittedBy, {
    requestId: 'req-ui-review-provisioning',
    projectId: 'proj-ui-review-provisioning',
    projectName: 'Raleigh Mixed-Use Tower',
    submittedAt: offsetIso(-3),
    state: 'Provisioning',
    projectNumber: '26-014-02',
    projectStage: 'Active',
  });

  const failed = createBaseRequest(submittedBy, {
    requestId: 'req-ui-review-failed',
    projectId: 'proj-ui-review-failed',
    projectName: 'Ballantyne Medical Office',
    submittedAt: offsetIso(-8),
    state: 'Failed',
    projectNumber: '26-011-07',
    retryCount: 1,
    requesterRetryUsed: true,
    projectStage: 'Active',
  });

  const completed = createBaseRequest(submittedBy, {
    requestId: 'req-ui-review-completed',
    projectId: 'proj-ui-review-completed',
    projectName: 'Greensboro Warehouse Expansion',
    submittedAt: offsetIso(-12),
    state: 'Completed',
    projectNumber: '26-006-03',
    completedAt: offsetIso(-1),
    siteUrl: 'https://hbintel.sharepoint.com/sites/GreensboroWarehouseExpansion',
    projectStage: 'Active',
  });

  const statuses: Record<string, IProvisioningStatus> = {
    [provisioning.projectId]: {
      projectId: provisioning.projectId,
      projectNumber: provisioning.projectNumber ?? '26-014-02',
      projectName: provisioning.projectName,
      correlationId: 'corr-ui-review-provisioning',
      overallStatus: 'InProgress',
      currentStep: 3,
      steps: [
        createStep(1, 'Create Site', 'Completed', {
          startedAt: offsetIso(-1, -5),
          completedAt: offsetIso(-1, -4),
        }),
        createStep(2, 'Apply Template', 'Completed', {
          startedAt: offsetIso(-1, -4),
          completedAt: offsetIso(-1, -3),
        }),
        createStep(3, 'Configure Navigation', 'InProgress', {
          startedAt: offsetIso(-1, -2),
        }),
        createStep(4, 'Provision Lists', 'NotStarted'),
        createStep(5, 'Install Web Parts', 'NotStarted'),
        createStep(6, 'Create Entra Groups', 'NotStarted'),
        createStep(7, 'Finalize Site', 'NotStarted'),
      ],
      triggeredBy: 'controller@hb.com',
      submittedBy,
      groupMembers: provisioning.groupMembers,
      startedAt: offsetIso(-1, -5),
      step5DeferredToTimer: false,
      step5TimerRetryCount: 0,
      retryCount: 0,
      department: provisioning.department,
    },
    [failed.projectId]: {
      projectId: failed.projectId,
      projectNumber: failed.projectNumber ?? '26-011-07',
      projectName: failed.projectName,
      correlationId: 'corr-ui-review-failed',
      overallStatus: 'Failed',
      currentStep: 3,
      steps: [
        createStep(1, 'Create Site', 'Completed', {
          startedAt: offsetIso(-6),
          completedAt: offsetIso(-6),
        }),
        createStep(2, 'Apply Template', 'Completed', {
          startedAt: offsetIso(-6),
          completedAt: offsetIso(-6),
        }),
        createStep(3, 'Configure Navigation', 'Failed', {
          startedAt: offsetIso(-5),
          errorMessage: 'Navigation inheritance could not be reconciled for the review sample.',
        }),
        createStep(4, 'Provision Lists', 'NotStarted'),
        createStep(5, 'Install Web Parts', 'NotStarted'),
        createStep(6, 'Create Entra Groups', 'NotStarted'),
        createStep(7, 'Finalize Site', 'NotStarted'),
      ],
      triggeredBy: 'controller@hb.com',
      submittedBy,
      groupMembers: failed.groupMembers,
      startedAt: offsetIso(-6),
      failedAt: offsetIso(-5),
      step5DeferredToTimer: false,
      step5TimerRetryCount: 0,
      retryCount: 1,
      failureClass: 'transient',
      lastRetryAt: offsetIso(-4),
      department: failed.department,
    },
    [completed.projectId]: {
      projectId: completed.projectId,
      projectNumber: completed.projectNumber ?? '26-006-03',
      projectName: completed.projectName,
      correlationId: 'corr-ui-review-completed',
      overallStatus: 'Completed',
      currentStep: 7,
      steps: [
        createStep(1, 'Create Site', 'Completed', {
          startedAt: offsetIso(-11),
          completedAt: offsetIso(-11),
        }),
        createStep(2, 'Apply Template', 'Completed', {
          startedAt: offsetIso(-11),
          completedAt: offsetIso(-10),
        }),
        createStep(3, 'Configure Navigation', 'Completed', {
          startedAt: offsetIso(-10),
          completedAt: offsetIso(-10),
        }),
        createStep(4, 'Provision Lists', 'Completed', {
          startedAt: offsetIso(-9),
          completedAt: offsetIso(-9),
        }),
        createStep(5, 'Install Web Parts', 'Completed', {
          startedAt: offsetIso(-8),
          completedAt: offsetIso(-8),
        }),
        createStep(6, 'Create Entra Groups', 'Completed', {
          startedAt: offsetIso(-7),
          completedAt: offsetIso(-7),
        }),
        createStep(7, 'Finalize Site', 'Completed', {
          startedAt: offsetIso(-1),
          completedAt: offsetIso(-1),
        }),
      ],
      triggeredBy: 'controller@hb.com',
      submittedBy,
      groupMembers: completed.groupMembers,
      startedAt: offsetIso(-11),
      completedAt: offsetIso(-1),
      siteUrl: completed.siteUrl,
      step5DeferredToTimer: false,
      step5TimerRetryCount: 0,
      retryCount: 0,
      department: completed.department,
    },
  };

  return {
    requests: [underReview, needsClarification, provisioning, failed, completed],
    statuses,
  };
}

function isStatusRecord(value: unknown): value is Record<string, IProvisioningStatus> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readState(submittedBy: string): IUiReviewState {
  const storage = getStorage();
  const requestsRaw = storage.getItem(UI_REVIEW_REQUESTS_STORAGE_KEY);
  const statusesRaw = storage.getItem(UI_REVIEW_STATUSES_STORAGE_KEY);

  if (!requestsRaw || !statusesRaw) {
    const seeded = createSeededState(submittedBy);
    writeState(seeded);
    return seeded;
  }

  try {
    const requests = JSON.parse(requestsRaw) as unknown;
    const statuses = JSON.parse(statusesRaw) as unknown;
    if (!Array.isArray(requests) || !isStatusRecord(statuses)) {
      throw new Error('Invalid ui-review storage shape.');
    }
    return {
      requests: requests as IProjectSetupRequest[],
      statuses: statuses as Record<string, IProvisioningStatus>,
    };
  } catch {
    const seeded = createSeededState(submittedBy);
    writeState(seeded);
    return seeded;
  }
}

function writeState(state: IUiReviewState): void {
  const storage = getStorage();
  storage.setItem(UI_REVIEW_REQUESTS_STORAGE_KEY, JSON.stringify(state.requests));
  storage.setItem(UI_REVIEW_STATUSES_STORAGE_KEY, JSON.stringify(state.statuses));
}

function createRequestId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export function resetUiReviewProjectSetupStorage(): void {
  const storage = getStorage();
  storage.removeItem(UI_REVIEW_REQUESTS_STORAGE_KEY);
  storage.removeItem(UI_REVIEW_STATUSES_STORAGE_KEY);
}

export function createUiReviewProjectSetupClient(submittedBy: string): IProjectSetupClient {
  return {
    async listRequests() {
      const state = readState(submittedBy);
      return clone(
        [...state.requests].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
      );
    },

    async submitRequest(data) {
      const state = readState(submittedBy);
      const submittedAt = nowIso();
      const requestId = createRequestId('req-ui-review');
      const projectId = createRequestId('proj-ui-review');
      const request: IProjectSetupRequest = {
        requestId,
        projectId,
        projectName: data.projectName ?? 'Untitled UI Review Project',
        projectLocation: data.projectLocation ?? '',
        projectType: data.projectType ?? 'GC',
        projectStage: (data.projectStage as IProjectSetupRequest['projectStage']) ?? 'Pursuit',
        submittedBy,
        submittedAt,
        state: 'Submitted',
        groupMembers: data.groupMembers ?? [],
        groupLeaders: data.groupLeaders,
        department: data.department,
        clarificationNote: data.clarificationNote,
        estimatedValue: data.estimatedValue,
        clientName: data.clientName,
        startDate: data.startDate,
        contractType: data.contractType,
        projectLeadId: data.projectLeadId,
        viewerUPNs: data.viewerUPNs,
        addOns: data.addOns,
        retryCount: 0,
        year: data.year ?? new Date(submittedAt).getFullYear(),
      };

      state.requests = [request, ...state.requests];
      state.statuses[projectId] = {
        projectId,
        projectNumber: '',
        projectName: request.projectName,
        correlationId: createRequestId('corr-ui-review'),
        overallStatus: 'NotStarted',
        currentStep: 0,
        steps: [
          createStep(1, 'Create Site', 'NotStarted'),
          createStep(2, 'Apply Template', 'NotStarted'),
          createStep(3, 'Configure Navigation', 'NotStarted'),
          createStep(4, 'Provision Lists', 'NotStarted'),
          createStep(5, 'Install Web Parts', 'NotStarted'),
          createStep(6, 'Create Entra Groups', 'NotStarted'),
          createStep(7, 'Finalize Site', 'NotStarted'),
        ],
        triggeredBy: '',
        submittedBy,
        groupMembers: request.groupMembers,
        startedAt: submittedAt,
        step5DeferredToTimer: false,
        step5TimerRetryCount: 0,
        retryCount: 0,
        department: request.department,
      };
      writeState(state);
      return clone(request);
    },

    async getProvisioningStatus(projectId) {
      const state = readState(submittedBy);
      return clone(state.statuses[projectId] ?? null);
    },

    async retryProvisioning(projectId) {
      const state = readState(submittedBy);
      const status = state.statuses[projectId];
      const request = state.requests.find((candidate) => candidate.projectId === projectId);
      if (!status || !request) return;

      const retriedAt = nowIso();
      status.overallStatus = 'InProgress';
      status.currentStep = 3;
      status.retryCount += 1;
      status.lastRetryAt = retriedAt;
      status.failureClass = undefined;
      status.failedAt = undefined;
      status.steps = status.steps.map((step) => {
        if (step.stepNumber < 3) {
          return step;
        }
        if (step.stepNumber === 3) {
          return {
            ...step,
            status: 'InProgress',
            startedAt: retriedAt,
            completedAt: undefined,
            errorMessage: undefined,
          };
        }
        return {
          ...step,
          status: 'NotStarted',
          completedAt: undefined,
          errorMessage: undefined,
        };
      });

      request.state = 'Provisioning';
      request.retryCount = status.retryCount;
      writeState(state);
    },

    async escalateProvisioning(projectId, escalatedBy) {
      const state = readState(submittedBy);
      const status = state.statuses[projectId];
      if (!status) return;
      status.escalatedBy = escalatedBy;
      status.escalatedAt = nowIso();
      writeState(state);
    },
  };
}
