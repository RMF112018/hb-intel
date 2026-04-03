/**
 * P6-06: Install checkpoint service unit tests.
 *
 * Tests validate checkpoint instruction generation, decision processing
 * (approve/reject), terminal-state safety, and audit event recording.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCheckpointInstructions,
  processCheckpointDecision,
} from '../install-checkpoint-service.js';
import {
  AdminRunStatus,
  AdminAuditEventType,
  InstallStepId,
  INSTALL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';
import type { IAdminActorContext, IAdminRunEnvelope } from '@hbc/models/admin-control-plane';
import { buildInitialSteps, INSTALL_STEP_CATALOG } from '../install-orchestrator.js';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

function makeRunEnvelope(overrides?: Partial<IAdminRunEnvelope>): IAdminRunEnvelope {
  return {
    runId: 'run-001',
    parentRunId: null,
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    domain: 'setup-install' as never,
    riskLevel: 'high' as never,
    executionMode: 'checkpointed' as never,
    initiatedBy: TEST_ACTOR,
    lastApprovedBy: null,
    commandInputRef: null,
    configSnapshotRef: null,
    status: AdminRunStatus.AwaitingApproval,
    totalSteps: INSTALL_STEP_CATALOG.length,
    currentStep: 10,
    steps: buildInitialSteps(INSTALL_STEP_CATALOG),
    failure: null,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    targetEntityId: null,
    targetEntityLabel: null,
    ...overrides,
  };
}

function makeMockServices() {
  return {
    runService: {
      launchRun: vi.fn(),
      getRun: vi.fn().mockResolvedValue(makeRunEnvelope()),
      listRuns: vi.fn(),
      cancelRun: vi.fn(),
      retryRun: vi.fn(),
    },
    auditService: {
      recordEvent: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      listByEventType: vi.fn().mockResolvedValue([]),
    },
  };
}

// ─── Instruction Generation ────────────────────────────────────────────────────

describe('P6-06 getCheckpointInstructions', () => {
  it('returns instructions for grant-api-permissions checkpoint', () => {
    const instructions = getCheckpointInstructions(InstallStepId.GrantApiPermissions);
    expect(instructions).not.toBeNull();
    expect(instructions!.instructions).toContain('Entra admin portal');
    expect(instructions!.instructions).toContain('Grant admin consent');
    expect(instructions!.externalUrl).toContain('entra.microsoft.com');
    expect(instructions!.verificationHint).toContain('Granted');
    expect(instructions!.riskWarning.length).toBeGreaterThan(0);
    expect(instructions!.resumeBehavior.length).toBeGreaterThan(0);
  });

  it('returns instructions for request-sharepoint-api-access checkpoint', () => {
    const instructions = getCheckpointInstructions(InstallStepId.RequestSharePointApiAccess);
    expect(instructions).not.toBeNull();
    expect(instructions!.instructions).toContain('SharePoint admin center');
    expect(instructions!.instructions).toContain('Approve');
    expect(instructions!.verificationHint).toContain('Approved');
    expect(instructions!.riskWarning.length).toBeGreaterThan(0);
    expect(instructions!.resumeBehavior.length).toBeGreaterThan(0);
  });

  it('returns null for non-checkpoint steps', () => {
    expect(getCheckpointInstructions(InstallStepId.DeployResourceGroup)).toBeNull();
    expect(getCheckpointInstructions(InstallStepId.VerifyFunctionApp)).toBeNull();
    expect(getCheckpointInstructions('nonexistent-step')).toBeNull();
  });
});

// ─── Decision Processing ───────────────────────────────────────────────────────

describe('P6-06 processCheckpointDecision', () => {
  describe('approve', () => {
    it('succeeds when run is in AwaitingApproval state', async () => {
      const { runService, auditService } = makeMockServices();
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(true);
      expect(result.response.decision).toBe('approve');
      expect(result.response.updatedStatus).toBe(AdminRunStatus.Running);
    });

    it('records a CheckpointDecided audit event', async () => {
      const { runService, auditService } = makeMockServices();
      await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(auditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: AdminAuditEventType.CheckpointDecided,
          runId: 'run-001',
          runStatusAtEvent: AdminRunStatus.Running,
        }),
      );
    });

    it('includes actor in the audit event', async () => {
      const { runService, auditService } = makeMockServices();
      await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(auditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: TEST_ACTOR,
        }),
      );
    });
  });

  describe('reject', () => {
    it('succeeds and returns Failed status', async () => {
      const { runService, auditService } = makeMockServices();
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'reject', TEST_ACTOR, 'Cannot grant permissions',
      );
      expect(result.success).toBe(true);
      expect(result.response.decision).toBe('reject');
      expect(result.response.updatedStatus).toBe(AdminRunStatus.Failed);
    });

    it('records both CheckpointDecided and RunFailed audit events', async () => {
      const { runService, auditService } = makeMockServices();
      await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'reject', TEST_ACTOR, 'Not authorized',
      );
      const calls = auditService.recordEvent.mock.calls;
      const eventTypes = calls.map((c: unknown[]) => (c[0] as { eventType: string }).eventType);
      expect(eventTypes).toContain(AdminAuditEventType.CheckpointDecided);
      expect(eventTypes).toContain(AdminAuditEventType.RunFailed);
    });

    it('includes comment as rationale', async () => {
      const { runService, auditService } = makeMockServices();
      await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'reject', TEST_ACTOR, 'Denied by policy',
      );
      expect(auditService.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          rationale: expect.objectContaining({ reason: 'Denied by policy' }),
        }),
      );
    });
  });

  describe('terminal-state safety', () => {
    it('rejects decision on a Completed run', async () => {
      const { runService, auditService } = makeMockServices();
      runService.getRun.mockResolvedValue(makeRunEnvelope({ status: AdminRunStatus.Completed }));
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('terminal state');
    });

    it('rejects decision on a Failed run', async () => {
      const { runService, auditService } = makeMockServices();
      runService.getRun.mockResolvedValue(makeRunEnvelope({ status: AdminRunStatus.Failed }));
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('terminal state');
    });

    it('rejects decision on a Cancelled run', async () => {
      const { runService, auditService } = makeMockServices();
      runService.getRun.mockResolvedValue(makeRunEnvelope({ status: AdminRunStatus.Cancelled }));
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(false);
    });

    it('rejects decision when run is not in AwaitingApproval state', async () => {
      const { runService, auditService } = makeMockServices();
      runService.getRun.mockResolvedValue(makeRunEnvelope({ status: AdminRunStatus.Running }));
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('not AwaitingApproval');
    });

    it('rejects decision when run not found', async () => {
      const { runService, auditService } = makeMockServices();
      runService.getRun.mockResolvedValue(null);
      const result = await processCheckpointDecision(
        runService, auditService, 'run-001', 10, 'approve', TEST_ACTOR,
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
