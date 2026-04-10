import { createHash, randomUUID } from 'node:crypto';
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
import {
  runPnpExtractionWorkflow,
  type PnpExtractionWorkflowContext,
} from './pnp-extraction-workflows.js';

interface ArtifactPayload {
  readonly fileName: string;
  readonly label: string;
  readonly contentType: 'application/json' | 'text/markdown' | 'application/zip';
  readonly contentEncoding: 'utf-8' | 'base64';
  readonly content: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly availability: 'available';
  readonly isBundle: boolean;
  readonly bundleFormat: 'zip' | null;
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
  extract: 'Execute extraction workflow',
  normalize: 'Build normalized outputs and manifest',
  publish: 'Publish artifacts and evidence references',
  finalize: 'Finalize run outcome',
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
      stepLabel: STEP_LABELS.extract,
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
      stepLabel: STEP_LABELS.normalize,
      status: AdminStepStatus.Pending,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      compensatable: false,
      compensated: false,
    },
    {
      stepNumber: 4,
      stepLabel: STEP_LABELS.publish,
      status: AdminStepStatus.Pending,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      errorMessage: null,
      compensatable: false,
      compensated: false,
    },
    {
      stepNumber: 5,
      stepLabel: STEP_LABELS.finalize,
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
  const descriptor = getPnpActionDescriptor(actionKey);
  if (!descriptor) {
    errors.push(`Action descriptor not found for ${actionKey}.`);
    return errors;
  }
  const siteError = validateTargetSiteUrl(
    typeof input.targetSiteUrl === 'string' ? input.targetSiteUrl.trim() : '',
  );
  if (siteError) {
    errors.push(siteError);
  }

  const listFilters = normalizeFilterList(input.listFilters);
  const pageFilters = normalizeFilterList(input.pageFilters);

  if (descriptor.requiredInput === 'site-and-list-filter' && listFilters.length === 0) {
    errors.push('listFilters is required for this extraction action.');
  }
  if (descriptor.requiredInput === 'site-and-page-filter' && pageFilters.length === 0) {
    errors.push('pageFilters is required for this extraction action.');
  }

  if (
    input.executionIntent?.mode &&
    input.executionIntent.mode !== 'read-only-export'
  ) {
    errors.push('executionIntent.mode must be read-only-export.');
  }

  return errors;
}

function createArtifactFromText(
  fileName: string,
  label: string,
  contentType: 'application/json' | 'text/markdown',
  content: string,
): ArtifactPayload {
  const sizeBytes = Buffer.byteLength(content, 'utf-8');
  const sha256 = createHash('sha256').update(content, 'utf-8').digest('hex');
  return {
    fileName,
    label,
    contentType,
    contentEncoding: 'utf-8',
    content,
    sizeBytes,
    sha256,
    availability: 'available',
    isBundle: false,
    bundleFormat: null,
  };
}

function toDosDateTime(value: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, value.getUTCFullYear());
  const month = value.getUTCMonth() + 1;
  const day = value.getUTCDate();
  const hours = value.getUTCHours();
  const minutes = value.getUTCMinutes();
  const seconds = Math.floor(value.getUTCSeconds() / 2);
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipBundle(
  fileName: string,
  label: string,
  files: readonly ArtifactPayload[],
): ArtifactPayload {
  type Entry = {
    readonly nameBytes: Buffer;
    readonly dataBytes: Buffer;
    readonly crc: number;
    readonly offset: number;
    readonly dosTime: number;
    readonly dosDate: number;
  };

  const now = toDosDateTime(new Date());
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const entries: Entry[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = Buffer.from(file.fileName, 'utf-8');
    const dataBytes = file.contentEncoding === 'base64'
      ? Buffer.from(file.content, 'base64')
      : Buffer.from(file.content, 'utf-8');
    const crc = crc32(dataBytes);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(now.dosTime, 10);
    localHeader.writeUInt16LE(now.dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBytes.length, 18);
    localHeader.writeUInt32LE(dataBytes.length, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBytes, dataBytes);

    entries.push({
      nameBytes,
      dataBytes,
      crc,
      offset,
      dosTime: now.dosTime,
      dosDate: now.dosDate,
    });

    offset += localHeader.length + nameBytes.length + dataBytes.length;
  }

  let centralSize = 0;
  for (const entry of entries) {
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(entry.dosTime, 12);
    centralHeader.writeUInt16LE(entry.dosDate, 14);
    centralHeader.writeUInt32LE(entry.crc, 16);
    centralHeader.writeUInt32LE(entry.dataBytes.length, 20);
    centralHeader.writeUInt32LE(entry.dataBytes.length, 24);
    centralHeader.writeUInt16LE(entry.nameBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(entry.offset, 42);

    centralParts.push(centralHeader, entry.nameBytes);
    centralSize += centralHeader.length + entry.nameBytes.length;
  }

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  const zipBuffer = Buffer.concat([...localParts, ...centralParts, end]);
  return {
    fileName,
    label,
    contentType: 'application/zip',
    contentEncoding: 'base64',
    content: zipBuffer.toString('base64'),
    sizeBytes: zipBuffer.length,
    sha256: createHash('sha256').update(zipBuffer).digest('hex'),
    availability: 'available',
    isBundle: true,
    bundleFormat: 'zip',
  };
}

function buildArtifacts(ctx: PnpExtractionWorkflowContext): readonly ArtifactPayload[] {
  const workflow = runPnpExtractionWorkflow(ctx);
  const generatedAt = new Date().toISOString();

  const rawArtifact = createArtifactFromText(
    'raw.json',
    'Raw extraction payload',
    'application/json',
    JSON.stringify(workflow.raw, null, 2),
  );
  const normalizedArtifact = createArtifactFromText(
    'normalized.json',
    'Normalized extraction payload',
    'application/json',
    JSON.stringify(workflow.normalized, null, 2),
  );
  const summaryArtifact = createArtifactFromText(
    'summary.md',
    'Extraction summary',
    'text/markdown',
    workflow.summaryMarkdown,
  );

  const filesForBundle: readonly ArtifactPayload[] = [
    rawArtifact,
    normalizedArtifact,
    summaryArtifact,
  ];

  const bundleArtifact = buildZipBundle('artifact-bundle.zip', 'Preferred download bundle', filesForBundle);

  const manifestPayload = {
    schemaVersion: '1.0.0',
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    generatedAt,
    warnings: workflow.warnings,
    preferredDownload: bundleArtifact.fileName,
    files: [bundleArtifact, ...filesForBundle].map((artifact) => ({
      fileName: artifact.fileName,
      label: artifact.label,
      contentType: artifact.contentType,
      sizeBytes: artifact.sizeBytes,
      sha256: artifact.sha256,
      availability: artifact.availability,
      isBundle: artifact.isBundle,
      bundleFormat: artifact.bundleFormat,
    })),
  };

  const manifestArtifact = createArtifactFromText(
    'artifact-manifest.json',
    'Artifact manifest',
    'application/json',
    JSON.stringify(manifestPayload, null, 2),
  );

  return [bundleArtifact, rawArtifact, normalizedArtifact, summaryArtifact, manifestArtifact];
}

function buildEvidenceRef(runId: string, fileName: string): IAdminEvidenceReference {
  return {
    evidenceId: randomUUID(),
    evidenceType: AdminEvidenceType.StepResultDetail,
    label: fileName,
    runId,
    stepNumber: 4,
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
    auditId: randomUUID(),
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

function classifyFailure(message: string): {
  readonly failureClass: 'transient' | 'structural' | 'permissions';
  readonly retryEligible: boolean;
} {
  const lower = message.toLowerCase();
  if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('unauthorized')) {
    return { failureClass: 'permissions', retryEligible: false };
  }
  if (lower.includes('validation') || lower.includes('required') || lower.includes('must be')) {
    return { failureClass: 'structural', retryEligible: false };
  }
  if (lower.includes('connect') || lower.includes('timeout') || lower.includes('network')) {
    return { failureClass: 'transient', retryEligible: true };
  }
  return { failureClass: 'structural', retryEligible: true };
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
    let failingStep = 1;

    await this.runService.updateRun(runId, {
      status: AdminRunStatus.Running,
      startedAt,
      totalSteps: 5,
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
      failingStep = 1;
      steps = applyStep(steps, 1, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, { steps, currentStep: 1 });

      const validationErrors = validateCommandInput(canonicalAction, commandInput);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(' ')}`);
      }

      steps = applyStep(steps, 1, AdminStepStatus.Completed, null);
      await this.runService.updateRun(runId, {
        currentStep: 2,
        steps,
      });

      failingStep = 2;
      steps = applyStep(steps, 2, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, {
        currentStep: 2,
        steps,
      });

      const workflowContext: PnpExtractionWorkflowContext = {
        runId,
        actionKey: canonicalAction,
        commandInput,
        actor,
      };
      const artifacts = buildArtifacts(workflowContext);

      steps = applyStep(steps, 2, AdminStepStatus.Completed, null);
      steps = applyStep(steps, 3, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, {
        currentStep: 3,
        steps,
      });

      steps = applyStep(steps, 3, AdminStepStatus.Completed, null);
      steps = applyStep(steps, 4, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, {
        currentStep: 4,
        steps,
      });

      failingStep = 4;
      const evidenceRefs: IAdminEvidenceReference[] = [];
      for (const artifact of artifacts) {
        const evidenceRef = buildEvidenceRef(runId, artifact.fileName);
        evidenceRefs.push(evidenceRef);
        await this.evidenceService.recordEvidence(evidenceRef, 'operational', {
          fileName: artifact.fileName,
          label: artifact.label,
          contentType: artifact.contentType,
          sizeBytes: artifact.sizeBytes,
          sha256: artifact.sha256,
          availability: artifact.availability,
          isBundle: artifact.isBundle,
          bundleFormat: artifact.bundleFormat,
          contentEncoding: artifact.contentEncoding,
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

      steps = applyStep(steps, 4, AdminStepStatus.Completed, null);
      steps = applyStep(steps, 5, AdminStepStatus.Running, null);
      await this.runService.updateRun(runId, {
        currentStep: 5,
        steps,
      });

      failingStep = 5;
      steps = applyStep(steps, 5, AdminStepStatus.Completed, null);
      await this.runService.updateRun(runId, {
        status: AdminRunStatus.Completed,
        currentStep: 5,
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
      const failure = classifyFailure(message);
      steps = applyStep(steps, failingStep, AdminStepStatus.Failed, message);
      await this.runService.updateRun(runId, {
        status: AdminRunStatus.Failed,
        steps,
        completedAt: new Date().toISOString(),
        failure: {
          failedAtStep: failingStep,
          failureClass: failure.failureClass,
          failureMessage: message,
          retryEligible: failure.retryEligible,
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
