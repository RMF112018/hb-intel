/**
 * P6-05: Install/bootstrap orchestrator.
 *
 * Sequences install step families through the adapter registry, persists
 * durable step-level status to the admin run store, records audit events,
 * and pauses at manual checkpoints as defined in the step model.
 *
 * Design: follows the provisioning audit bridge pattern — fire-and-forget
 * audit writes, durable run envelope updates via the run service, and
 * adapter invocations through the registry. Does not flatten into a single
 * synchronous endpoint; each step is individually tracked.
 */

import {
  AdminRunStatus,
  AdminStepStatus,
  AdminAuditEventType,
  AdminDomain,
  AdminAdapterOutcome,
  InstallStepId,
  InstallStepFamily,
  INSTALL_ACTION_KEYS,
  APP_BINDING_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IAdminStepResult,
  IAdminRunEnvelope,
  IAdminAdapterInvocationContext,
  IInstallStepDefinition,
  BackendMode,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminRunService,
  IAdminAuditService,
  IAdminEvidenceService,
  IAdminAdapterRegistry,
  IAdminPreflightService,
  IAdminAppBindingService,
} from './types.js';

// ─── Install Step Catalog ──────────────────────────────────────────────────────

/**
 * Canonical install step sequence. Order matters — steps execute in array order.
 * Checkpoint steps (grant-api-permissions, request-sharepoint-api-access) will
 * pause the run at AwaitingApproval status.
 */
export const INSTALL_STEP_CATALOG: readonly IInstallStepDefinition[] = [
  // Family 1: Discovery
  {
    stepId: InstallStepId.DiscoverResourceGroup,
    label: 'Discover resource group',
    family: InstallStepFamily.Discovery,
    adapterKey: 'azure-deployment:bicep',
    operation: 'discoverResourceGroup',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.DiscoverAppRegistrations,
    label: 'Discover app registrations',
    family: InstallStepFamily.Discovery,
    adapterKey: 'entra-graph:group-lifecycle',
    operation: 'discoverAppRegistrations',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.DiscoverAppCatalog,
    label: 'Discover app catalog',
    family: InstallStepFamily.Discovery,
    adapterKey: 'sharepoint-alm:package-install',
    operation: 'discoverAppCatalog',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.DiscoverExistingInfrastructure,
    label: 'Discover existing infrastructure',
    family: InstallStepFamily.Discovery,
    adapterKey: 'validation-probe:readiness',
    operation: 'checkReadiness',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },

  // Family 3: Install Execution
  {
    stepId: InstallStepId.DeployResourceGroup,
    label: 'Deploy resource group',
    family: InstallStepFamily.Install,
    adapterKey: 'azure-deployment:bicep',
    operation: 'deployResourceGroup',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.DeployStorage,
    label: 'Deploy Storage Account',
    family: InstallStepFamily.Install,
    adapterKey: 'azure-deployment:bicep',
    operation: 'deployStorage',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.DeployFunctionApp,
    label: 'Deploy Function App',
    family: InstallStepFamily.Install,
    adapterKey: 'azure-deployment:bicep',
    operation: 'deployFunctionApp',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.ConfigureAppSettings,
    label: 'Configure app settings',
    family: InstallStepFamily.Install,
    adapterKey: 'azure-deployment:bicep',
    operation: 'configureAppSettings',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.CreateAppRegistration,
    label: 'Create/update Entra app registration',
    family: InstallStepFamily.Install,
    adapterKey: 'entra-graph:group-lifecycle',
    operation: 'createAppRegistration',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.GrantApiPermissions,
    label: 'Grant API permissions (requires admin consent)',
    family: InstallStepFamily.Install,
    adapterKey: 'entra-graph:group-lifecycle',
    operation: 'grantApiPermissions',
    requiresCheckpoint: true,
    idempotent: false,
    blocking: true,
  },
  {
    stepId: InstallStepId.InstallSpfxPackage,
    label: 'Upload SPFx package to app catalog',
    family: InstallStepFamily.Install,
    adapterKey: 'sharepoint-alm:package-install',
    operation: 'installWebParts',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },
  {
    stepId: InstallStepId.RequestSharePointApiAccess,
    label: 'Request SharePoint API access (requires admin approval)',
    family: InstallStepFamily.Install,
    adapterKey: 'sharepoint-api-access:permissions',
    operation: 'requestApproval',
    requiresCheckpoint: true,
    idempotent: false,
    blocking: true,
  },
  {
    stepId: InstallStepId.ConfigureHubSite,
    label: 'Configure hub site association',
    family: InstallStepFamily.Install,
    adapterKey: 'sharepoint-site:lifecycle',
    operation: 'associateHub',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: true,
  },

  // Family 5: Post-Install Verification
  {
    stepId: InstallStepId.VerifyFunctionApp,
    label: 'Verify Function App health',
    family: InstallStepFamily.Verification,
    adapterKey: 'validation-probe:readiness',
    operation: 'checkReadiness',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.VerifyTableStorage,
    label: 'Verify Table Storage access',
    family: InstallStepFamily.Verification,
    adapterKey: 'validation-probe:readiness',
    operation: 'checkReadiness',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.VerifyGraphApi,
    label: 'Verify Graph API access',
    family: InstallStepFamily.Verification,
    adapterKey: 'entra-graph:group-lifecycle',
    operation: 'discoverAppRegistrations',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.VerifySharePoint,
    label: 'Verify SharePoint tenant access',
    family: InstallStepFamily.Verification,
    adapterKey: 'validation-probe:readiness',
    operation: 'checkReadiness',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.VerifySpfxPackage,
    label: 'Verify SPFx package deployment',
    family: InstallStepFamily.Verification,
    adapterKey: 'sharepoint-alm:package-install',
    operation: 'discoverAppCatalog',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
  {
    stepId: InstallStepId.VerifyApiPermissions,
    label: 'Verify API permissions granted',
    family: InstallStepFamily.Verification,
    adapterKey: 'sharepoint-api-access:permissions',
    operation: 'checkPermissions',
    requiresCheckpoint: false,
    idempotent: true,
    blocking: false,
  },
];

// ─── Orchestrator ──────────────────────────────────────────────────────────────

export interface InstallOrchestratorDeps {
  readonly runService: IAdminRunService;
  readonly auditService: IAdminAuditService;
  readonly evidenceService: IAdminEvidenceService;
  readonly adapterRegistry: IAdminAdapterRegistry;
  readonly preflightService: IAdminPreflightService;
  readonly bindingService?: IAdminAppBindingService;
}

// ─── Managed App Binding ─────────────────────────────────────────────────────

/** Canonical managed app identifiers that receive binding publication after install. */
export const MANAGED_APP_IDS = ['accounting', 'project-setup'] as const;

/**
 * Publishes binding records for all managed apps after a successful install run.
 *
 * Extracts `functionAppUrl` and `apiAudience` from commandInput, then publishes
 * a binding for each managed app. Errors are non-critical — binding publication
 * failure does not fail the install run.
 *
 * Called from both `executeInstallRun()` and `resumeAfterCheckpoint()`.
 */
export async function publishBindingsAfterInstall(
  bindingService: IAdminAppBindingService,
  auditService: IAdminAuditService,
  actor: IAdminActorContext,
  runId: string,
  commandInput: Record<string, unknown>,
): Promise<void> {
  const functionAppUrl = (commandInput.functionAppUrl as string) ?? '';
  const apiAudience = (commandInput.apiAudience as string) ?? '';

  if (!functionAppUrl || !apiAudience) {
    console.warn(
      `[InstallOrchestrator] Binding publication skipped for run ${runId}: ` +
      `missing functionAppUrl (${functionAppUrl ? 'present' : 'absent'}) or ` +
      `apiAudience (${apiAudience ? 'present' : 'absent'}) in commandInput`,
    );
    return;
  }

  for (const appId of MANAGED_APP_IDS) {
    try {
      const result = await bindingService.publishBinding(
        {
          appId,
          functionAppUrl,
          apiAudience,
          backendMode: ((commandInput.backendMode as string) ?? 'production') as BackendMode,
          allowBackendModeSwitch: commandInput.allowBackendModeSwitch === true,
          publishSource: `install-run:${runId}`,
        },
        actor,
      );

      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.BindingPublished,
        timestamp: new Date().toISOString(),
        domain: AdminDomain.AppBinding,
        actionKey: APP_BINDING_ACTION_KEYS.PUBLISH,
        runId,
        checkpointInstanceId: null,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.Completed,
        summary: `Published binding for ${appId} v${result.version} from install run ${runId}`,
      }).catch(() => {});
    } catch (err) {
      console.error(`[InstallOrchestrator] Non-critical: binding publication failed for ${appId} in run ${runId}`, err);
    }
  }
}

// ─── Step Helpers ────────────────────────────────────────────────────────────

/**
 * Builds the initial step result array for a new install run.
 */
export function buildInitialSteps(catalog: readonly IInstallStepDefinition[]): IAdminStepResult[] {
  return catalog.map((def, i) => ({
    stepNumber: i + 1,
    stepLabel: def.label,
    status: AdminStepStatus.Pending,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    errorMessage: null,
    compensatable: false,
    compensated: false,
  }));
}

/**
 * Creates an install run envelope via the run service, then executes
 * the install step catalog sequentially. Pauses at checkpoint steps.
 *
 * Returns the final run envelope.
 */
export async function executeInstallRun(
  deps: InstallOrchestratorDeps,
  actor: IAdminActorContext,
  commandInput: Record<string, unknown>,
): Promise<IAdminRunEnvelope> {
  const { runService, auditService, adapterRegistry } = deps;

  // 1. Launch the run
  const launchResponse = await runService.launchRun(
    {
      actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
      commandInput,
      dryRun: false,
    },
    actor,
  );

  const runId = launchResponse.runId;

  // 2. Record run-started audit event (fire-and-forget)
  auditService.recordEvent({
    auditId: crypto.randomUUID(),
    eventType: AdminAuditEventType.RunStarted,
    timestamp: new Date().toISOString(),
    domain: AdminDomain.SetupInstall,
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    runId,
    checkpointInstanceId: null,
    actor,
    rationale: null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: AdminRunStatus.Running,
    summary: `Install/bootstrap run ${runId} started by ${actor.displayName}`,
  }).catch((err) => {
    console.error(`[InstallOrchestrator] Non-critical: failed to record run-started audit for ${runId}`, err);
  });

  // 3. Execute steps sequentially
  for (let i = 0; i < INSTALL_STEP_CATALOG.length; i++) {
    const stepDef = INSTALL_STEP_CATALOG[i];
    const stepNumber = i + 1;

    // Check if run was cancelled between steps
    const currentRun = await runService.getRun(runId);
    if (!currentRun || currentRun.status === AdminRunStatus.Cancelled) {
      return currentRun ?? await runService.getRun(runId) as IAdminRunEnvelope;
    }

    // 3a. If step requires checkpoint, pause the run
    if (stepDef.requiresCheckpoint) {
      // Record checkpoint audit event
      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.CheckpointCreated,
        timestamp: new Date().toISOString(),
        domain: AdminDomain.SetupInstall,
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        runId,
        checkpointInstanceId: `checkpoint-step-${stepNumber}`,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.AwaitingApproval,
        summary: `Checkpoint at step ${stepNumber}: ${stepDef.label}`,
      }).catch((err) => {
        console.error(`[InstallOrchestrator] Non-critical: failed to record checkpoint for step ${stepNumber}`, err);
      });

      // Return the run in AwaitingApproval state — the caller (or a resume
      // endpoint) will re-enter the orchestrator after approval.
      const pausedRun = await runService.getRun(runId);
      return pausedRun as IAdminRunEnvelope;
    }

    // 3b. Execute the step via adapter registry
    const stepStart = Date.now();

    const invocationContext: IAdminAdapterInvocationContext = {
      runId,
      stepNumber,
      actor,
      isRetry: false,
      retryAttempt: 0,
      dryRun: false,
      correlationId: runId,
      input: { ...commandInput, operation: stepDef.operation },
      resolvedConfig: {},
    };

    const adapterResult = await adapterRegistry.invoke(stepDef.adapterKey, invocationContext);
    const stepDuration = Date.now() - stepStart;

    const stepSucceeded =
      adapterResult.outcome === AdminAdapterOutcome.Success ||
      adapterResult.outcome === AdminAdapterOutcome.SuccessWithWarnings ||
      adapterResult.outcome === AdminAdapterOutcome.Skipped;

    // 3c. Handle step failure on blocking steps
    if (!stepSucceeded && stepDef.blocking) {
      // Record failure audit event
      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.RunFailed,
        timestamp: new Date().toISOString(),
        domain: AdminDomain.SetupInstall,
        actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
        runId,
        checkpointInstanceId: null,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.Failed,
        summary: `Install failed at step ${stepNumber} (${stepDef.label}): ${adapterResult.issues?.[0]?.message ?? 'unknown error'}`,
      }).catch((err) => {
        console.error(`[InstallOrchestrator] Non-critical: failed to record failure audit for step ${stepNumber}`, err);
      });

      const failedRun = await runService.getRun(runId);
      return failedRun as IAdminRunEnvelope;
    }

    // Log non-blocking failures as warnings
    if (!stepSucceeded && !stepDef.blocking) {
      console.warn(
        `[InstallOrchestrator] Non-blocking step ${stepNumber} (${stepDef.label}) failed — continuing. ` +
        `Duration: ${stepDuration}ms`,
      );
    }
  }

  // 4. Record run-completed audit event
  auditService.recordEvent({
    auditId: crypto.randomUUID(),
    eventType: AdminAuditEventType.RunCompleted,
    timestamp: new Date().toISOString(),
    domain: AdminDomain.SetupInstall,
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    runId,
    checkpointInstanceId: null,
    actor,
    rationale: null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: AdminRunStatus.Completed,
    summary: `Install/bootstrap run ${runId} completed successfully`,
  }).catch((err) => {
    console.error(`[InstallOrchestrator] Non-critical: failed to record completion audit for ${runId}`, err);
  });

  // 5. Publish bindings for managed apps (P6A-05)
  if (deps.bindingService) {
    await publishBindingsAfterInstall(deps.bindingService, auditService, actor, runId, commandInput);
  }

  const finalRun = await runService.getRun(runId);
  return finalRun as IAdminRunEnvelope;
}

/**
 * Returns the step catalog for external consumers (tests, docs, UI rendering).
 */
export function getInstallStepCatalog(): readonly IInstallStepDefinition[] {
  return INSTALL_STEP_CATALOG;
}
