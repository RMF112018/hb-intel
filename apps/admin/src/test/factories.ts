import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';

const now = '2026-01-15T12:00:00.000Z';

/**
 * Creates a valid IProjectSetupRequest with sensible defaults.
 * All fields overridable via Partial<IProjectSetupRequest>.
 */
export function createTestRequest(
  overrides?: Partial<IProjectSetupRequest>,
): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'p-1',
    projectName: 'Test Project',
    projectLocation: 'Denver, CO',
    projectType: 'Commercial',
    projectStage: 'Active',
    submittedBy: 'coordinator@hb.com',
    submittedAt: now,
    state: 'Submitted',
    groupMembers: ['team@hb.com'],
    retryCount: 0,
    ...overrides,
  };
}

const DEFAULT_STEPS: IProvisioningStatus['steps'] = [
  { stepNumber: 1, stepName: 'Create Site', status: 'Completed', startedAt: now, completedAt: now },
  { stepNumber: 2, stepName: 'Apply Template', status: 'Completed', startedAt: now, completedAt: now },
  { stepNumber: 3, stepName: 'Configure Permissions', status: 'Failed', startedAt: now, errorMessage: 'Transient failure' },
  { stepNumber: 4, stepName: 'Configure Navigation', status: 'NotStarted' },
  { stepNumber: 5, stepName: 'Install Web Parts', status: 'NotStarted' },
  { stepNumber: 6, stepName: 'Create Entra Groups', status: 'NotStarted' },
  { stepNumber: 7, stepName: 'Configure Background Viewer', status: 'NotStarted' },
];

/**
 * Creates a valid IProvisioningStatus with sensible defaults.
 * Seven step entries matching the real provisioning saga.
 * Defaults to Failed status with transient failure class.
 */
export function createTestProvisioningStatus(
  overrides?: Partial<IProvisioningStatus>,
): IProvisioningStatus {
  return {
    projectId: 'p-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'c-1',
    overallStatus: 'Failed',
    currentStep: 3,
    steps: DEFAULT_STEPS.map((s) => ({ ...s })),
    triggeredBy: 'controller@hb.com',
    submittedBy: 'coordinator@hb.com',
    groupMembers: ['team@hb.com'],
    startedAt: now,
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    failureClass: 'transient',
    ...overrides,
  };
}
