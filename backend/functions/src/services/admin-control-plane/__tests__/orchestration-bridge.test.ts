import { describe, it, expect } from 'vitest';
import {
  AdminRunStatus,
  AdminStepStatus,
  AdminAdapterOutcome,
  AdminDomain,
  AdminExecutionMode,
  AdminRiskLevel,
} from '@hbc/models/admin-control-plane';
import type { IAdminAdapterInvocationContext, IAdminActorContext } from '@hbc/models/admin-control-plane';
import {
  mapProvisioningStatus,
  mapProvisioningStepStatus,
  mapProvisioningToRunEnvelope,
  createProvisioningBridgeInvoker,
} from '../orchestration-bridge.js';
import type { IProvisioningStatusSnapshot } from '../orchestration-bridge.js';

/**
 * P3-07: Orchestration bridge tests.
 *
 * Validates provisioning-to-admin run model mapping, status translation,
 * step status translation, and bridge adapter invocation.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-1',
  displayName: 'Test Admin',
  capturedAt: '2026-04-02T00:00:00.000Z',
};

const TEST_SNAPSHOT: IProvisioningStatusSnapshot = {
  projectId: 'proj-001',
  projectName: 'Test Project',
  correlationId: 'corr-001',
  overallStatus: 'Running',
  currentStep: 3,
  totalSteps: 7,
  triggeredBy: 'admin@hb.com',
  createdAt: '2026-04-01T10:00:00.000Z',
  stepResults: [
    { stepNumber: 1, stepName: 'Create Site', status: 'Completed', startedAt: '2026-04-01T10:00:01Z', completedAt: '2026-04-01T10:00:05Z' },
    { stepNumber: 2, stepName: 'Document Library', status: 'Completed', startedAt: '2026-04-01T10:00:06Z', completedAt: '2026-04-01T10:00:10Z' },
    { stepNumber: 3, stepName: 'Template Files', status: 'Running', startedAt: '2026-04-01T10:00:11Z' },
  ],
};

describe('P3-07 mapProvisioningStatus', () => {
  it.each([
    ['Queued', AdminRunStatus.Pending],
    ['Pending', AdminRunStatus.Pending],
    ['Running', AdminRunStatus.Running],
    ['InProgress', AdminRunStatus.Running],
    ['Completed', AdminRunStatus.Completed],
    ['Succeeded', AdminRunStatus.Completed],
    ['Failed', AdminRunStatus.Failed],
    ['Cancelled', AdminRunStatus.Cancelled],
    ['WebPartsPending', AdminRunStatus.PartiallyDeferred],
    ['PartiallyDeferred', AdminRunStatus.PartiallyDeferred],
    ['UnknownStatus', AdminRunStatus.Running],
  ])('maps "%s" to %s', (input, expected) => {
    expect(mapProvisioningStatus(input)).toBe(expected);
  });
});

describe('P3-07 mapProvisioningStepStatus', () => {
  it.each([
    ['Pending', AdminStepStatus.Pending],
    ['NotStarted', AdminStepStatus.Pending],
    ['Running', AdminStepStatus.Running],
    ['InProgress', AdminStepStatus.Running],
    ['Completed', AdminStepStatus.Completed],
    ['Succeeded', AdminStepStatus.Completed],
    ['Failed', AdminStepStatus.Failed],
    ['Skipped', AdminStepStatus.Skipped],
    ['Deferred', AdminStepStatus.Deferred],
    ['Compensated', AdminStepStatus.Compensated],
    ['UnknownStatus', AdminStepStatus.Pending],
  ])('maps "%s" to %s', (input, expected) => {
    expect(mapProvisioningStepStatus(input)).toBe(expected);
  });
});

describe('P3-07 mapProvisioningToRunEnvelope', () => {
  it('maps a running provisioning snapshot to an admin run envelope', () => {
    const envelope = mapProvisioningToRunEnvelope(TEST_SNAPSHOT, TEST_ACTOR);

    expect(envelope.runId).toBe('corr-001');
    expect(envelope.parentRunId).toBeNull();
    expect(envelope.domain).toBe(AdminDomain.ProvisioningRollout);
    expect(envelope.riskLevel).toBe(AdminRiskLevel.Moderate);
    expect(envelope.executionMode).toBe(AdminExecutionMode.Seamless);
    expect(envelope.status).toBe(AdminRunStatus.Running);
    expect(envelope.totalSteps).toBe(7);
    expect(envelope.currentStep).toBe(3);
    expect(envelope.targetEntityId).toBe('proj-001');
    expect(envelope.targetEntityLabel).toBe('Test Project');
    expect(envelope.initiatedBy.upn).toBe('admin@hb.com');
    expect(envelope.completedAt).toBeNull();
  });

  it('maps step results with duration calculation', () => {
    const envelope = mapProvisioningToRunEnvelope(TEST_SNAPSHOT);

    expect(envelope.steps).toHaveLength(3);
    expect(envelope.steps[0].stepLabel).toBe('Create Site');
    expect(envelope.steps[0].status).toBe(AdminStepStatus.Completed);
    expect(envelope.steps[0].durationMs).toBe(4000);
    expect(envelope.steps[2].status).toBe(AdminStepStatus.Running);
    expect(envelope.steps[2].durationMs).toBeNull();
  });

  it('maps a failed snapshot with failure summary', () => {
    const failedSnapshot: IProvisioningStatusSnapshot = {
      ...TEST_SNAPSHOT,
      overallStatus: 'Failed',
      failureClass: 'permissions',
      lastError: 'Insufficient permissions for group creation',
      retryCount: 1,
      completedAt: '2026-04-01T10:01:00.000Z',
    };

    const envelope = mapProvisioningToRunEnvelope(failedSnapshot);

    expect(envelope.status).toBe(AdminRunStatus.Failed);
    expect(envelope.failure).not.toBeNull();
    expect(envelope.failure!.failureClass).toBe('permissions');
    expect(envelope.failure!.failureMessage).toBe('Insufficient permissions for group creation');
    expect(envelope.failure!.retryCount).toBe(1);
    expect(envelope.failure!.retryEligible).toBe(true);
    expect(envelope.completedAt).toBeTruthy();
  });

  it('maps a completed snapshot with terminal timestamps', () => {
    const completedSnapshot: IProvisioningStatusSnapshot = {
      ...TEST_SNAPSHOT,
      overallStatus: 'Completed',
      completedAt: '2026-04-01T10:05:00.000Z',
    };

    const envelope = mapProvisioningToRunEnvelope(completedSnapshot);

    expect(envelope.status).toBe(AdminRunStatus.Completed);
    expect(envelope.completedAt).toBe('2026-04-01T10:05:00.000Z');
    expect(envelope.failure).toBeNull();
  });

  it('maps parentCorrelationId to parentRunId for retries', () => {
    const retrySnapshot: IProvisioningStatusSnapshot = {
      ...TEST_SNAPSHOT,
      correlationId: 'corr-002',
      parentCorrelationId: 'corr-001',
    };

    const envelope = mapProvisioningToRunEnvelope(retrySnapshot);
    expect(envelope.runId).toBe('corr-002');
    expect(envelope.parentRunId).toBe('corr-001');
  });

  it('uses triggeredBy as actor when no actor provided', () => {
    const envelope = mapProvisioningToRunEnvelope(TEST_SNAPSHOT);
    expect(envelope.initiatedBy.upn).toBe('admin@hb.com');
    expect(envelope.initiatedBy.displayName).toBe('admin@hb.com');
  });
});

describe('P3-07 createProvisioningBridgeInvoker', () => {
  const invoker = createProvisioningBridgeInvoker();

  const baseContext: IAdminAdapterInvocationContext = {
    runId: 'run-001',
    stepNumber: 1,
    actor: TEST_ACTOR,
    dryRun: false,
    isRetry: false,
    retryAttempt: 0,
    correlationId: 'corr-001',
    input: { projectId: 'proj-001' },
    resolvedConfig: {},
  };

  it('returns Success for live invocation', async () => {
    const result = await invoker(baseContext);

    expect(result.adapterKey).toBe('provisioning:bridge');
    expect(result.outcome).toBe(AdminAdapterOutcome.Success);
    expect(result.summary).toContain('acknowledged');
    expect(result.adapterSpecificData).toMatchObject({
      bridgeType: 'provisioning-saga',
      runId: 'run-001',
    });
  });

  it('returns DryRunComplete for dry-run invocation', async () => {
    const result = await invoker({ ...baseContext, dryRun: true });

    expect(result.outcome).toBe(AdminAdapterOutcome.DryRunComplete);
    expect(result.summary).toContain('dry-run');
    expect(result.adapterSpecificData).toMatchObject({ dryRun: true });
  });

  it('includes bridge delegation warning on live invocation', async () => {
    const result = await invoker(baseContext);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe('BRIDGE_DELEGATION');
  });
});
