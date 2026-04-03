import { describe, it, expect } from 'vitest';
import { buildEvidencePayload } from '../build-evidence-payload.js';
import type { IProvisioningStatus } from '@hbc/models';
import type { IPermissionDiagnostic, ISiteGrantReadiness } from '../../../utils/diagnose-permissions.js';

const permissionDiag: IPermissionDiagnostic = {
  model: 'sites-selected',
  groupReadWriteExpected: true,
  summary: 'Path A (Sites.Selected) — preferred least-privilege model.',
};

const grantReadiness: ISiteGrantReadiness = {
  permissionModel: 'sites-selected',
  grantConfirmed: true,
  automatedGrantAvailable: false,
  operatorAction: 'Manual grant workflow confirmed.',
};

function makeStatus(overrides?: Partial<IProvisioningStatus>): IProvisioningStatus {
  return {
    projectId: 'test-project',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'Completed',
    currentStep: 7,
    steps: [
      { stepNumber: 1, stepName: 'Create Site', status: 'Completed', metadata: { durationMs: 1200, attemptCount: 1 } },
      { stepNumber: 2, stepName: 'Create Document Library', status: 'Completed', metadata: { durationMs: 800, attemptCount: 1 } },
      { stepNumber: 3, stepName: 'Upload Template Files', status: 'Completed', metadata: { durationMs: 2500, attemptCount: 1 } },
      { stepNumber: 4, stepName: 'Create Data Lists', status: 'Completed', metadata: { durationMs: 3200, attemptCount: 1 } },
      { stepNumber: 5, stepName: 'Install Web Parts', status: 'Completed', metadata: { durationMs: 45000, attemptCount: 1 } },
      { stepNumber: 6, stepName: 'Set Permissions', status: 'Completed', metadata: { durationMs: 1500, attemptCount: 1 } },
      { stepNumber: 7, stepName: 'Associate Hub Site', status: 'Completed', metadata: { durationMs: 900, attemptCount: 1 } },
    ],
    triggeredBy: 'admin@hb.com',
    submittedBy: 'coord@hb.com',
    groupMembers: ['m1@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

describe('buildEvidencePayload', () => {
  it('builds a complete evidence payload for a successful run', () => {
    const status = makeStatus();
    const evidence = buildEvidencePayload(status, 55000, permissionDiag, grantReadiness);

    expect(evidence.schemaVersion).toBe(1);
    expect(evidence.sagaDurationMs).toBe(55000);
    expect(evidence.overallStatus).toBe('Completed');
    expect(evidence.failureClass).toBeNull();
    expect(evidence.failedAtStep).toBeNull();
    expect(evidence.retryCount).toBe(0);
    expect(evidence.parentCorrelationId).toBeNull();
    expect(evidence.step5Deferred).toBe(false);
    expect(evidence.capturedAt).toBeTruthy();
  });

  it('includes per-step evidence with durations from metadata', () => {
    const status = makeStatus();
    const evidence = buildEvidencePayload(status, 55000, permissionDiag, grantReadiness);

    expect(evidence.steps).toHaveLength(7);
    expect(evidence.steps[0].stepNumber).toBe(1);
    expect(evidence.steps[0].durationMs).toBe(1200);
    expect(evidence.steps[0].attemptCount).toBe(1);
    expect(evidence.steps[0].errorMessage).toBeNull();
  });

  it('captures failure details for failed runs', () => {
    const status = makeStatus({
      overallStatus: 'Failed',
      failureClass: 'permissions',
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'Completed', metadata: { durationMs: 1200, attemptCount: 1 } },
        { stepNumber: 6, stepName: 'Set Permissions', status: 'Failed', errorMessage: 'Graph 403', metadata: { durationMs: 500, attemptCount: 3 } },
      ],
    });

    const evidence = buildEvidencePayload(status, 5000, permissionDiag, grantReadiness);

    expect(evidence.failureClass).toBe('permissions');
    expect(evidence.failedAtStep).toBe(6);
    expect(evidence.steps[1].errorMessage).toBe('Graph 403');
    expect(evidence.steps[1].attemptCount).toBe(3);
  });

  it('captures permission posture', () => {
    const evidence = buildEvidencePayload(makeStatus(), 1000, permissionDiag, grantReadiness);

    expect(evidence.permissionPosture.model).toBe('sites-selected');
    expect(evidence.permissionPosture.grantConfirmed).toBe(true);
    expect(evidence.permissionPosture.automatedGrantAvailable).toBe(false);
  });

  it('captures parent correlation ID for retries', () => {
    const evidence = buildEvidencePayload(
      makeStatus({ retryCount: 1 }), 1000, permissionDiag, grantReadiness, 'parent-corr-id',
    );

    expect(evidence.parentCorrelationId).toBe('parent-corr-id');
    expect(evidence.retryCount).toBe(1);
  });

  it('captures Step 5 deferral state', () => {
    const evidence = buildEvidencePayload(
      makeStatus({ step5DeferredToTimer: true, overallStatus: 'WebPartsPending' }),
      1000, permissionDiag, grantReadiness,
    );

    expect(evidence.step5Deferred).toBe(true);
    expect(evidence.overallStatus).toBe('WebPartsPending');
  });

  it('captures department when set', () => {
    const evidence = buildEvidencePayload(
      makeStatus({ department: 'commercial' }),
      1000, permissionDiag, grantReadiness,
    );

    expect(evidence.department).toBe('commercial');
  });

  it('handles steps without metadata gracefully', () => {
    const status = makeStatus({
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'Completed' },
      ],
    });

    const evidence = buildEvidencePayload(status, 1000, permissionDiag, grantReadiness);

    expect(evidence.steps[0].durationMs).toBeNull();
    expect(evidence.steps[0].attemptCount).toBe(1); // defaults to 1 for completed
    expect(evidence.steps[0].metadata).toBeNull();
  });

  it('handles NotStarted steps with zero attempt count', () => {
    const status = makeStatus({
      steps: [
        { stepNumber: 1, stepName: 'Create Site', status: 'NotStarted' },
      ],
    });

    const evidence = buildEvidencePayload(status, 0, permissionDiag, grantReadiness);

    expect(evidence.steps[0].attemptCount).toBe(0);
  });
});
