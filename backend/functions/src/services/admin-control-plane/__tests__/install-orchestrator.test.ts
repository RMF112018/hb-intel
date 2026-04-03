/**
 * P6-05: Install orchestrator unit tests.
 *
 * Tests validate step sequencing, failure handling, terminal states,
 * checkpoint handoff, and audit event recording.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  INSTALL_STEP_CATALOG,
  buildInitialSteps,
  executeInstallRun,
  getInstallStepCatalog,
  publishBindingsAfterInstall,
  MANAGED_APP_IDS,
} from '../install-orchestrator.js';
import type { InstallOrchestratorDeps } from '../install-orchestrator.js';
import { AppBindingStatus } from '@hbc/models/admin-control-plane';
import { MockAdminAppBindingStore } from '../app-binding-store.js';
import {
  AdminRunStatus,
  AdminStepStatus,
  AdminAuditEventType,
  AdminAdapterOutcome,
  InstallStepFamily,
  INSTALL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IAdminRunEnvelope,
  IAdminRunLaunchResponse,
  IAdminAdapterResult,
} from '@hbc/models/admin-control-plane';

// ─── Test Helpers ──────────────────────────────────────────────────────────────

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
    status: AdminRunStatus.Running,
    totalSteps: INSTALL_STEP_CATALOG.length,
    currentStep: 1,
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

function makeDeps(overrides?: Partial<InstallOrchestratorDeps>): InstallOrchestratorDeps {
  return {
    runService: {
      launchRun: vi.fn().mockResolvedValue({
        runId: 'run-001',
        status: AdminRunStatus.Running,
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        executionMode: 'checkpointed',
        riskLevel: 'high',
      } satisfies IAdminRunLaunchResponse),
      getRun: vi.fn().mockResolvedValue(makeRunEnvelope()),
      listRuns: vi.fn().mockResolvedValue({ runs: [], total: 0, page: 1, pageSize: 20 }),
      cancelRun: vi.fn().mockResolvedValue(makeRunEnvelope({ status: AdminRunStatus.Cancelled })),
      retryRun: vi.fn(),
    },
    auditService: {
      recordEvent: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      listByEventType: vi.fn().mockResolvedValue([]),
    },
    evidenceService: {
      recordEvidence: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      getEvidence: vi.fn().mockResolvedValue(null),
    },
    adapterRegistry: {
      resolve: vi.fn(),
      listAll: vi.fn(),
      listForAction: vi.fn(),
      invoke: vi.fn().mockResolvedValue({
        outcome: AdminAdapterOutcome.Skipped,
        adapterKey: 'test',
        summary: 'Skipped — planned adapter',
        durationMs: 10,
        warnings: [],
        issues: [],
        evidenceRefs: [],
      } as IAdminAdapterResult),
    },
    preflightService: {
      validate: vi.fn().mockResolvedValue({ ready: true, checks: [] }),
    },
    ...overrides,
  };
}

// ─── Step Catalog Tests ────────────────────────────────────────────────────────

describe('P6-05 Install Step Catalog', () => {
  it('contains exactly 19 steps matching InstallStepId values', () => {
    expect(INSTALL_STEP_CATALOG).toHaveLength(19);
  });

  it('covers all step families', () => {
    const families = new Set(INSTALL_STEP_CATALOG.map((s) => s.family));
    expect(families).toContain(InstallStepFamily.Discovery);
    expect(families).toContain(InstallStepFamily.Install);
    expect(families).toContain(InstallStepFamily.Verification);
  });

  it('orders discovery before install before verification', () => {
    const familyOrder = INSTALL_STEP_CATALOG.map((s) => s.family);
    const firstInstall = familyOrder.indexOf(InstallStepFamily.Install);
    const lastDiscovery = familyOrder.lastIndexOf(InstallStepFamily.Discovery);
    const firstVerification = familyOrder.indexOf(InstallStepFamily.Verification);
    const lastInstall = familyOrder.lastIndexOf(InstallStepFamily.Install);

    expect(lastDiscovery).toBeLessThan(firstInstall);
    expect(lastInstall).toBeLessThan(firstVerification);
  });

  it('has exactly 2 checkpoint steps (grant-api-permissions and request-sharepoint-api-access)', () => {
    const checkpointSteps = INSTALL_STEP_CATALOG.filter((s) => s.requiresCheckpoint);
    expect(checkpointSteps).toHaveLength(2);
    expect(checkpointSteps[0].stepId).toBe('grant-api-permissions');
    expect(checkpointSteps[1].stepId).toBe('request-sharepoint-api-access');
  });

  it('all install-family blocking steps are marked blocking', () => {
    const installSteps = INSTALL_STEP_CATALOG.filter((s) => s.family === InstallStepFamily.Install);
    for (const step of installSteps) {
      expect(step.blocking).toBe(true);
    }
  });

  it('all verification-family steps are non-blocking', () => {
    const verifySteps = INSTALL_STEP_CATALOG.filter((s) => s.family === InstallStepFamily.Verification);
    for (const step of verifySteps) {
      expect(step.blocking).toBe(false);
    }
  });

  it('getInstallStepCatalog returns the same catalog', () => {
    expect(getInstallStepCatalog()).toBe(INSTALL_STEP_CATALOG);
  });
});

// ─── buildInitialSteps Tests ───────────────────────────────────────────────────

describe('P6-05 buildInitialSteps', () => {
  it('creates a step result for each catalog entry', () => {
    const steps = buildInitialSteps(INSTALL_STEP_CATALOG);
    expect(steps).toHaveLength(INSTALL_STEP_CATALOG.length);
  });

  it('assigns sequential step numbers starting at 1', () => {
    const steps = buildInitialSteps(INSTALL_STEP_CATALOG);
    steps.forEach((step, i) => {
      expect(step.stepNumber).toBe(i + 1);
    });
  });

  it('all steps start as Pending', () => {
    const steps = buildInitialSteps(INSTALL_STEP_CATALOG);
    for (const step of steps) {
      expect(step.status).toBe(AdminStepStatus.Pending);
    }
  });

  it('preserves step labels from the catalog', () => {
    const steps = buildInitialSteps(INSTALL_STEP_CATALOG);
    steps.forEach((step, i) => {
      expect(step.stepLabel).toBe(INSTALL_STEP_CATALOG[i].label);
    });
  });
});

// ─── executeInstallRun Tests ───────────────────────────────────────────────────

describe('P6-05 executeInstallRun', () => {
  it('launches a run via the run service', async () => {
    const deps = makeDeps();
    await executeInstallRun(deps, TEST_ACTOR, {});
    expect(deps.runService.launchRun).toHaveBeenCalledWith(
      expect.objectContaining({
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        dryRun: false,
      }),
      TEST_ACTOR,
    );
  });

  it('records a run-started audit event', async () => {
    const deps = makeDeps();
    await executeInstallRun(deps, TEST_ACTOR, {});
    expect(deps.auditService.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: AdminAuditEventType.RunStarted,
        runId: 'run-001',
      }),
    );
  });

  it('invokes each non-checkpoint step via the adapter registry', async () => {
    const deps = makeDeps();
    await executeInstallRun(deps, TEST_ACTOR, {});

    // Should invoke steps until the first checkpoint (step 10: grant-api-permissions)
    // Steps 1-4 (discovery) + steps 5-9 (install before checkpoint) = 9 invocations
    // Then step 10 is a checkpoint → pauses
    const invokeCallCount = (deps.adapterRegistry.invoke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(invokeCallCount).toBe(9);
  });

  it('pauses at the first checkpoint step and returns AwaitingApproval', async () => {
    const pausedEnvelope = makeRunEnvelope({ status: AdminRunStatus.AwaitingApproval });
    const deps = makeDeps({
      runService: {
        ...makeDeps().runService,
        getRun: vi.fn().mockResolvedValue(pausedEnvelope),
      },
    });

    const result = await executeInstallRun(deps, TEST_ACTOR, {});
    expect(result.status).toBe(AdminRunStatus.AwaitingApproval);
  });

  it('records a checkpoint-created audit event at checkpoint steps', async () => {
    const deps = makeDeps();
    await executeInstallRun(deps, TEST_ACTOR, {});

    const auditCalls = (deps.auditService.recordEvent as ReturnType<typeof vi.fn>).mock.calls;
    const checkpointEvent = auditCalls.find(
      (call: unknown[]) => (call[0] as { eventType: string }).eventType === AdminAuditEventType.CheckpointCreated,
    );
    expect(checkpointEvent).toBeDefined();
  });

  it('records a failure audit event when a blocking step fails', async () => {
    const deps = makeDeps({
      adapterRegistry: {
        ...makeDeps().adapterRegistry,
        invoke: vi.fn().mockResolvedValueOnce({
          outcome: AdminAdapterOutcome.Success, adapterKey: 'test', summary: 'ok',
          durationMs: 10, warnings: [], issues: [], evidenceRefs: [],
        }).mockResolvedValueOnce({
          outcome: AdminAdapterOutcome.Success, adapterKey: 'test', summary: 'ok',
          durationMs: 10, warnings: [], issues: [], evidenceRefs: [],
        }).mockResolvedValueOnce({
          outcome: AdminAdapterOutcome.Success, adapterKey: 'test', summary: 'ok',
          durationMs: 10, warnings: [], issues: [], evidenceRefs: [],
        }).mockResolvedValueOnce({
          outcome: AdminAdapterOutcome.Success, adapterKey: 'test', summary: 'ok',
          durationMs: 10, warnings: [], issues: [], evidenceRefs: [],
        }).mockResolvedValueOnce({
          outcome: AdminAdapterOutcome.Failed, adapterKey: 'azure-deployment:bicep', summary: 'deploy failed',
          durationMs: 50, warnings: [], issues: [{ code: 'DEPLOY_FAILED', message: 'RG deploy failed' }],
          evidenceRefs: [],
        }),
      },
    });

    const failedEnvelope = makeRunEnvelope({ status: AdminRunStatus.Failed });
    (deps.runService.getRun as ReturnType<typeof vi.fn>).mockResolvedValue(failedEnvelope);

    const result = await executeInstallRun(deps, TEST_ACTOR, {});
    expect(result.status).toBe(AdminRunStatus.Failed);

    const auditCalls = (deps.auditService.recordEvent as ReturnType<typeof vi.fn>).mock.calls;
    const failEvent = auditCalls.find(
      (call: unknown[]) => (call[0] as { eventType: string }).eventType === AdminAuditEventType.RunFailed,
    );
    expect(failEvent).toBeDefined();
  });

  it('stops execution when run is cancelled between steps', async () => {
    const cancelledEnvelope = makeRunEnvelope({ status: AdminRunStatus.Cancelled });
    const deps = makeDeps({
      runService: {
        ...makeDeps().runService,
        getRun: vi.fn().mockResolvedValue(cancelledEnvelope),
      },
    });

    const result = await executeInstallRun(deps, TEST_ACTOR, {});
    expect(result.status).toBe(AdminRunStatus.Cancelled);
    // Should not invoke any adapter steps since getRun returns Cancelled immediately
    expect(deps.adapterRegistry.invoke).not.toHaveBeenCalled();
  });
});

// ─── Binding Publication Tests (P6A-05) ───────────────────────────────────────

describe('P6A-05 publishBindingsAfterInstall', () => {
  let bindingStore: MockAdminAppBindingStore;
  let auditService: InstallOrchestratorDeps['auditService'];

  beforeEach(() => {
    bindingStore = new MockAdminAppBindingStore();
    auditService = {
      recordEvent: vi.fn().mockResolvedValue(undefined),
      listByRunId: vi.fn().mockResolvedValue([]),
      listByEventType: vi.fn().mockResolvedValue([]),
    };
  });

  it('publishes bindings for all managed apps when commandInput has required fields', async () => {
    await publishBindingsAfterInstall(bindingStore, auditService, TEST_ACTOR, 'run-001', {
      functionAppUrl: 'https://hb-intel-func.azurewebsites.net',
      apiAudience: 'api://hb-intel-api',
    });

    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(MANAGED_APP_IDS.length);

    for (const appId of MANAGED_APP_IDS) {
      const binding = await bindingStore.getBinding(appId);
      expect(binding).not.toBeNull();
      expect(binding!.functionAppUrl).toBe('https://hb-intel-func.azurewebsites.net');
      expect(binding!.apiAudience).toBe('api://hb-intel-api');
      expect(binding!.status).toBe(AppBindingStatus.Active);
      expect(binding!.version).toBe(1);
    }
  });

  it('includes correct publishSource with runId', async () => {
    await publishBindingsAfterInstall(bindingStore, auditService, TEST_ACTOR, 'run-xyz-123', {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    const binding = await bindingStore.getBinding('accounting');
    expect(binding!.publishSource).toBe('install-run:run-xyz-123');
  });

  it('records BindingPublished audit event per app', async () => {
    await publishBindingsAfterInstall(bindingStore, auditService, TEST_ACTOR, 'run-001', {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    expect(auditService.recordEvent).toHaveBeenCalledTimes(MANAGED_APP_IDS.length);
    const firstCall = (auditService.recordEvent as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(firstCall.eventType).toBe(AdminAuditEventType.BindingPublished);
    expect(firstCall.runId).toBe('run-001');
  });

  it('skips publication when functionAppUrl is missing', async () => {
    await publishBindingsAfterInstall(bindingStore, auditService, TEST_ACTOR, 'run-001', {
      apiAudience: 'api://test',
    });

    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(0);
    expect(auditService.recordEvent).not.toHaveBeenCalled();
  });

  it('skips publication when apiAudience is missing', async () => {
    await publishBindingsAfterInstall(bindingStore, auditService, TEST_ACTOR, 'run-001', {
      functionAppUrl: 'https://func.azurewebsites.net',
    });

    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(0);
  });

  it('continues publishing remaining apps if one fails', async () => {
    // Create a store that fails on the first app but succeeds on the second
    const failingStore: MockAdminAppBindingStore = new MockAdminAppBindingStore();
    let callCount = 0;
    const originalPublish = failingStore.publishBinding.bind(failingStore);
    failingStore.publishBinding = async (req, actor) => {
      callCount++;
      if (callCount === 1) throw new Error('Simulated failure');
      return originalPublish(req, actor);
    };

    await publishBindingsAfterInstall(failingStore, auditService, TEST_ACTOR, 'run-001', {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    // Second app should still be published
    const bindings = await failingStore.listBindings();
    expect(bindings).toHaveLength(1);
    expect(bindings[0].appId).toBe('project-setup');
  });
});

describe('P6A-05 executeInstallRun with binding publication', () => {
  it('does not publish bindings when install fails at a blocking step', async () => {
    const bindingStore = new MockAdminAppBindingStore();
    const failingDeps = makeDeps({
      bindingService: bindingStore,
      adapterRegistry: {
        ...makeDeps().adapterRegistry,
        invoke: vi.fn().mockResolvedValue({
          outcome: AdminAdapterOutcome.Failed,
          adapterKey: 'test',
          summary: 'Failed',
          durationMs: 10,
          warnings: [],
          issues: [],
          evidenceRefs: [],
        } as IAdminAdapterResult),
      },
    });

    await executeInstallRun(failingDeps, TEST_ACTOR, {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(0);
  });

  it('does not publish bindings when install is cancelled', async () => {
    const bindingStore = new MockAdminAppBindingStore();
    const cancelledEnvelope = makeRunEnvelope({ status: AdminRunStatus.Cancelled });
    const deps = makeDeps({
      bindingService: bindingStore,
      runService: {
        ...makeDeps().runService,
        getRun: vi.fn().mockResolvedValue(cancelledEnvelope),
      },
    });

    await executeInstallRun(deps, TEST_ACTOR, {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(0);
  });

  it('does not publish bindings when run pauses at checkpoint', async () => {
    // Default mock: adapters return Skipped, so run pauses at first checkpoint
    const bindingStore = new MockAdminAppBindingStore();
    const deps = makeDeps({ bindingService: bindingStore });

    await executeInstallRun(deps, TEST_ACTOR, {
      functionAppUrl: 'https://func.azurewebsites.net',
      apiAudience: 'api://test',
    });

    // Binding publication only happens on successful completion, not checkpoint pause
    const bindings = await bindingStore.listBindings();
    expect(bindings).toHaveLength(0);
  });
});
