import {
  AdminAuditEventType,
  AdminEvidenceType,
  AdminRunStatus,
  AdminStepStatus,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IAdminAuditRecord,
  IAdminEvidenceReference,
  IAdminRunLaunchRequest,
  IAdminStepResult,
} from '@hbc/models/admin-control-plane';
import type { IAdminAuditService, IAdminEvidenceService, IAdminRunService } from './types.js';
import {
  getPnpActionDescriptor,
  normalizeFilterList,
  normalizePnpActionKey,
  type CanonicalPnpActionKey,
} from './pnp-action-catalog.js';

interface ArtifactPayload {
  readonly fileName: string;
  readonly contentType: 'application/json' | 'text/markdown';
  readonly content: string;
}

interface PnpCommandInput {
  readonly targetSiteUrl?: string;
  readonly listFilters?: readonly string[];
  readonly pageFilters?: readonly string[];
  readonly executionIntent?: {
    readonly mode?: string;
    readonly source?: string;
    readonly requestedAt?: string;
  };
}

interface PnpExecutionContext {
  readonly runId: string;
  readonly actionKey: CanonicalPnpActionKey;
  readonly commandInput: PnpCommandInput;
  readonly actor: IAdminActorContext;
}

export interface IPnpOpsOrchestrator {
  normalizeLaunchRequest(request: IAdminRunLaunchRequest): IAdminRunLaunchRequest;
  isPnpAction(actionKey: string): boolean;
  executeRun(
    runId: string,
    launchRequest: IAdminRunLaunchRequest,
    actor: IAdminActorContext,
    backendUrl: string,
  ): Promise<void>;
}

const STEP_LABELS = {
  resolve: 'Resolve action contract',
  execute: 'Execute server-side read-only extraction seam',
  publish: 'Publish artifact manifest and evidence',
} as const;

function makePendingSteps(): readonly IAdminStepResult[] {
  return [
    {
      stepNumber: 1,
      stepLabel: STEP_LABELS.resolve,
      status: AdminStepStatus.Pending,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      compensatable: false,
      compensated: false,
    },
    {
      stepNumber: 2,
      stepLabel: STEP_LABELS.execute,
      status: AdminStepStatus.Pending,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      compensatable: false,
      compensated: false,
    },
    {
      stepNumber: 3,
      stepLabel: STEP_LABELS.publish,
      status: AdminStepStatus.Pending,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      compensatable: false,
      compensated: false,
    },
  ];
}

function applyStep(
  steps: readonly IAdminStepResult[],
  stepNumber: number,
  status: AdminStepStatus,
  errorMessage: string | null,
): readonly IAdminStepResult[] {
  const now = new Date().toISOString();
  return steps.map((step) => {
    if (step.stepNumber !== stepNumber) {
      return step;
    }
    const startedAt = step.startedAt ?? now;
    const completedAt = status === AdminStepStatus.Running ? null : now;
    const durationMs =
      startedAt && completedAt
        ? Math.max(
            0,
            new Date(completedAt).getTime() - new Date(startedAt).getTime(),
          )
        : null;
    return {
      ...step,
      status,
      startedAt,
      completedAt,
      durationMs,
      errorMessage,
    };
  });
}

function validateTargetSiteUrl(value: string): string | null {
  if (!value) {
    return 'targetSiteUrl is required.';
  }
  if (!/^https:\/\/.+\.sharepoint\.com\/sites\/.+/i.test(value)) {
    return 'targetSiteUrl must be a SharePoint site URL under /sites/.';
  }
  return null;
}

function validateCommandInput(
  actionKey: CanonicalPnpActionKey,
  input: PnpCommandInput,
): string[] {
  const errors: string[] = [];
  const siteError = validateTargetSiteUrl(
    typeof input.targetSiteUrl === 'string' ? input.targetSiteUrl.trim() : '',
  );
  if (siteError) {
    errors.push(siteError);
  }

  const listFilters = normalizeFilterList(input.listFilters);
  const pageFilters = normalizeFilterList(input.pageFilters);

  if (
    actionKey === 'sharepoint-control:extraction:list-schema' &&
    listFilters.length === 0
  ) {
    errors.push('listFilters is required for list schema extraction.');
  }
  if (
    actionKey === 'sharepoint-control:extraction:page-layout' &&
    pageFilters.length === 0
  ) {
    errors.push('pageFilters is required for page/layout extraction.');
  }

  if (
    input.executionIntent?.mode &&
    input.executionIntent.mode !== 'read-only-export'
  ) {
    errors.push('executionIntent.mode must be read-only-export.');
  }

  return errors;
}

function buildArtifacts(ctx: PnpExecutionContext): readonly ArtifactPayload[] {
  const generatedAt = new Date().toISOString();
  const descriptor = getPnpActionDescriptor(ctx.actionKey);
  const targetSiteUrl =
    typeof ctx.commandInput.targetSiteUrl === 'string'
      ? ctx.commandInput.targetSiteUrl
      : '';
  const listFilters = normalizeFilterList(ctx.commandInput.listFilters);
  const pageFilters = normalizeFilterList(ctx.commandInput.pageFilters);

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    targetSiteUrl,
    listFilters,
    pageFilters,
    generatedAt,
    method: 'server-side admin-control-plane seam',
    note: 'Prompt-02 seam output. Live SharePoint extraction wiring is handled by action invoker implementations in later prompts.',
  };

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      operator: ctx.actor.upn,
    },
    inputs: {
      targetSiteUrl,
      listFilters,
      pageFilters,
    },
    execution: {
      mode: 'read-only-export',
      source: ctx.commandInput.executionIntent?.source ?? 'unknown',
    },
    counts: {
      listFilterCount: listFilters.length,
      pageFilterCount: pageFilters.length,
    },
  };

  const summary = [
    '# PnP Extraction Run Summary',
    '',
    `- Run ID: ${ctx.runId}`,
    `- Action: ${ctx.actionKey}`,
    `- Target Site: ${targetSiteUrl || '(missing)'}`,
    `- Generated At: ${generatedAt}`,
    `- Expected Artifacts: ${(descriptor?.expectedArtifacts ?? []).join(', ')}`,
    '',
    'This run used the secured backend extraction seam. No browser-side privileged execution was performed.',
  ].join('\n');

  const manifest = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    generatedAt,
    artifacts: [
      { fileName: 'raw.json', contentType: 'application/json' },
      { fileName: 'normalized.json', contentType: 'application/json' },
      { fileName: 'summary.md', contentType: 'text/markdown' },
    ],
  };

  return [
    {
      fileName: 'raw.json',
      contentType: 'application/json',
      content: JSON.stringify(raw, null, 2),
    },
    {
      fileName: 'normalized.json',
      contentType: 'application/json',
      content: JSON.stringify(normalized, null, 2),
    },
    { fileName: 'summary.md', contentType: 'text/markdown', content: summary },
    {
      fileName: 'artifact-manifest.json',
      contentType: 'application/json',
      content: JSON.stringify(manifest, null, 2),
    },
  ];
}

function buildEvidenceRef(runId: string, fileName: string): IAdminEvidenceReference {
  return {
    evidenceId: crypto.randomUUID(),
    evidenceType: AdminEvidenceType.StepResultDetail,
    label: fileName,
    runId,
    stepNumber: 3,
    capturedAt: new Date().toISOString(),
    storageLocator: `inline://admin/runs/${runId}/artifacts/${encodeURIComponent(fileName)}`,
  };
}

function buildAuditRecord(
  eventType: AdminAuditEventType,
  actionKey: CanonicalPnpActionKey,
  runId: string,
  actor: IAdminActorContext,
  summary: string,
  runStatusAtEvent: AdminRunStatus,
  evidenceRef: IAdminEvidenceReference | null,
): IAdminAuditRecord {
  return {
    auditId: crypto.randomUUID(),
    eventType,
    timestamp: new Date().toISOString(),
    domain: 'sharepoint-control' as never,
    actionKey,
    runId,
    checkpointInstanceId: null,
    actor,
    rationale: null,
    evidenceRef,
    configSnapshotRef: null,
    runStatusAtEvent,
    summary,
  };
}

export class PnpOpsOrchestrator implements IPnpOpsOrchestrator {
  constructor(
    private readonly runService: IAdminRunService,
    private readonly auditService: IAdminAuditService,
    private readonly evidenceService: IAdminEvidenceService,
  ) {}

  normalizeLaunchRequest(
    request: IAdminRunLaunchRequest,
  ): IAdminRunLaunchRequest {
    const canonicalKey = normalizePnpActionKey(request.actionKey);
    if (!canonicalKey) {
      return request;
    }
    return {
      ...request,
      actionKey: canonicalKey,
    };
  }

  isPnpAction(actionKey: string): boolean {
    return normalizePnpActionKey(actionKey) !== null;
  }

  async executeRun(
    runId: string,
    launchRequest: IAdminRunLaunchRequest,
    actor: IAdminActorContext,
    backendUrl: string,
  ): Promise<void> {
    const canonicalAction = normalizePnpActionKey(launchRequest.actionKey);
    if (!canonicalAction) {
      return;
    }

    const commandInput = (launchRequest.commandInput ?? {}) as PnpCommandInput;
    const startedAt = new Date().toISOString();
    let steps = makePendingSteps();

    await this.runService.updateRun(runId, {
      status: AdminRunStatus.Running,
      startedAt,
      totalSteps: 3,
      currentStep: 1,
      steps,
    });

    await this.auditService.recordEvent(
      buildAuditRecord(
        AdminAuditEventType.RunStarted,
        canonicalAction,
        runId,
        actor,
        `PnP action ${canonicalAction} started`,
        AdminRunStatus.Running,
        null,
      ),
    );

    try {
      const validationErrors = validateCommandInput(canonicalAction, commandInput);
      steps = applyStep(steps, 1, AdminStepStatus.Completed, null);
      await this.runService.updateRun(runId, {
        currentStep: 2,
        steps,
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(' '));
      }

      steps = applyStep(steps, 2, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, { steps });

      const artifacts = buildArtifacts({
        runId,
        actionKey: canonicalAction,
        commandInput,
        actor,
      });

      steps = applyStep(steps, 2, AdminStepStatus.Completed, null);
      steps = applyStep(steps, 3, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, {
        currentStep: 3,
        steps,
      });

      const evidenceRefs: IAdminEvidenceReference[] = [];
      for (const artifact of artifacts) {
        const evidenceRef = buildEvidenceRef(runId, artifact.fileName);
        evidenceRefs.push(evidenceRef);
        await this.evidenceService.recordEvidence(evidenceRef, 'operational', {
          fileName: artifact.fileName,
          contentType: artifact.contentType,
          content: artifact.content,
          downloadable: true,
        });

        const encodedEvidenceId = encodeURIComponent(evidenceRef.evidenceId);
        const downloadUrl =
          `${backendUrl.replace(/\/+$/, '')}` +
          `/api/admin/runs/${encodeURIComponent(runId)}/artifacts/${encodedEvidenceId}/download`;

        await this.auditService.recordEvent(
          buildAuditRecord(
            AdminAuditEventType.RunCompleted,
            canonicalAction,
            runId,
            actor,
            `Artifact generated: ${artifact.fileName}`,
            AdminRunStatus.Running,
            {
              ...evidenceRef,
              storageLocator: downloadUrl,
            },
          ),
        );
      }

      steps = applyStep(steps, 3, AdminStepStatus.Completed, null);
      await this.runService.updateRun(runId, {
        status: AdminRunStatus.Completed,
        currentStep: 3,
        steps,
        completedAt: new Date().toISOString(),
      });

      await this.auditService.recordEvent(
        buildAuditRecord(
          AdminAuditEventType.RunCompleted,
          canonicalAction,
          runId,
          actor,
          `PnP action ${canonicalAction} completed with ${evidenceRefs.length} artifacts`,
          AdminRunStatus.Completed,
          null,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'PnP extraction run failed.';
      steps = applyStep(steps, 3, AdminStepStatus.Failed, message);
      await this.runService.updateRun(runId, {
        status: AdminRunStatus.Failed,
        steps,
        completedAt: new Date().toISOString(),
        failure: {
          failedAtStep: 3,
          failureClass: 'structural',
          failureMessage: message,
          retryEligible: true,
          retryCount: 0,
          lastRetryAt: null,
          escalated: false,
          escalatedBy: null,
          escalatedAt: null,
        },
      });

      await this.auditService.recordEvent(
        buildAuditRecord(
          AdminAuditEventType.RunFailed,
          canonicalAction,
          runId,
          actor,
          message,
          AdminRunStatus.Failed,
          null,
        ),
      );
    }
  }
}
