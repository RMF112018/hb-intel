import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getActionDescriptor, resolveActionKey } from './actionCatalog.js';
import { checkPnpModule, detectPowerShell, runExtractionScript } from './powershell.js';
import { runPreflight } from './preflight.js';
import {
  buildEvidenceRefs,
  createRunPaths,
  ensureStorageDir,
  fileSha256,
  fileSizeBytes,
  type RunPaths,
} from './storage.js';
import { buildZipFromFiles } from './zip.js';
import type {
  CanonicalPnpActionKey,
  PnpCommandInput,
  RunEvidence,
  RunLaunchRequest,
  RunRecord,
  RunnerConfig,
  StepResult,
} from './types.js';

interface StoredRun {
  run: RunRecord;
  commandInput: PnpCommandInput;
  actionKey: CanonicalPnpActionKey;
  paths: RunPaths;
  evidence: RunEvidence | null;
}

const STEP_LABELS = [
  'Resolve action contract',
  'Preflight readiness',
  'Execute action workflow',
  'Normalize artifacts',
  'Write artifacts',
  'Finalize run',
] as const;

function createPendingSteps(): StepResult[] {
  return STEP_LABELS.map((label, index) => ({
    stepNumber: index + 1,
    stepLabel: label,
    status: 'Pending',
    errorMessage: null,
    startedAt: null,
    completedAt: null,
  }));
}

function nowIso(): string {
  return new Date().toISOString();
}

function updateStep(steps: readonly StepResult[], stepNumber: number, status: StepResult['status'], errorMessage: string | null): StepResult[] {
  return steps.map((step) => {
    if (step.stepNumber !== stepNumber) {
      return step;
    }
    const startedAt = step.startedAt ?? nowIso();
    const completedAt = status === 'Running' ? null : nowIso();
    return {
      ...step,
      status,
      errorMessage,
      startedAt,
      completedAt,
    };
  });
}

function sanitizeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/ClientSecret\s*=\s*[^;\s]+/gi, 'ClientSecret=[REDACTED]')
    .slice(0, 1200);
}

export class LocalRunnerService {
  private readonly runs = new Map<string, StoredRun>();

  constructor(private readonly config: RunnerConfig) {}

  public async initialize(): Promise<void> {
    await ensureStorageDir(this.config.storageDir);
  }

  public async launch(request: RunLaunchRequest): Promise<{ runId: string; status: string; actionKey: string }> {
    const actionKey = resolveActionKey(request.actionKey);
    if (!actionKey) {
      throw new Error(`Unsupported action key: ${request.actionKey}`);
    }
    const commandInput = request.commandInput ?? {};
    const runId = randomUUID();
    const paths = await createRunPaths(this.config.storageDir, runId);
    const run: RunRecord = {
      runId,
      actionKey,
      status: 'Pending',
      totalSteps: STEP_LABELS.length,
      currentStep: null,
      startedAt: null,
      completedAt: null,
      steps: createPendingSteps(),
    };
    this.runs.set(runId, {
      run,
      commandInput,
      actionKey,
      paths,
      evidence: null,
    });
    void this.execute(runId);
    return { runId, status: run.status, actionKey };
  }

  public getRun(runId: string): RunRecord {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    return run.run;
  }

  public getEvidence(runId: string): RunEvidence {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    if (!run.evidence) {
      return { runId, evidenceRefs: [], total: 0 };
    }
    return run.evidence;
  }

  public async getArtifact(runId: string, artifactId: string): Promise<{ filePath: string; contentType: string; fileName: string }> {
    const run = this.runs.get(runId);
    if (!run?.evidence) {
      throw new Error('Artifact unavailable.');
    }
    const target = run.evidence.evidenceRefs.find((entry) => entry.evidenceId === artifactId);
    if (!target || !target.fileName) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }
    const filePath = path.join(run.paths.artifactsDir, target.fileName);
    await fs.access(filePath);
    return {
      filePath,
      contentType: target.contentType ?? 'application/octet-stream',
      fileName: target.fileName,
    };
  }

  public async getPreflight(actionKeyRaw: string, commandInput: PnpCommandInput) {
    return runPreflight(actionKeyRaw, commandInput, this.config);
  }

  private async execute(runId: string): Promise<void> {
    const record = this.runs.get(runId);
    if (!record) {
      return;
    }

    try {
      this.setRunState(runId, { status: 'Running', startedAt: nowIso(), currentStep: 1, step: { number: 1, status: 'Running' } });
      this.setRunState(runId, { currentStep: 1, step: { number: 1, status: 'Completed' } });

      this.setRunState(runId, { currentStep: 2, step: { number: 2, status: 'Running' } });
      const preflight = await runPreflight(record.actionKey, record.commandInput, this.config);
      if (!preflight.ready) {
        const blocking = preflight.checks.find((check) => check.blocking && !check.passed);
        throw new Error(blocking?.message ?? 'Preflight failed.');
      }
      this.setRunState(runId, { currentStep: 2, step: { number: 2, status: 'Completed' } });

      this.setRunState(runId, { currentStep: 3, step: { number: 3, status: 'Running' } });
      const ps = detectPowerShell();
      if (!ps.available || !ps.command) {
        throw new Error(ps.message);
      }
      const pnp = checkPnpModule(ps.command);
      if (!pnp.available) {
        throw new Error(pnp.message);
      }
      await runExtractionScript({
        runId,
        actionKey: record.actionKey,
        commandInput: record.commandInput,
        files: {
          rawPath: record.paths.rawPath,
          normalizedPath: record.paths.normalizedPath,
          summaryPath: record.paths.summaryPath,
          provisionSummaryPath: record.paths.provisionSummaryPath,
          seedSummaryPath: record.paths.seedSummaryPath,
        },
        config: this.config,
        powerShellCommand: ps.command,
      });
      this.setRunState(runId, { currentStep: 3, step: { number: 3, status: 'Completed' } });

      this.setRunState(runId, { currentStep: 4, step: { number: 4, status: 'Running' } });
      const descriptor = getActionDescriptor(record.actionKey);
      const artifactManifest = await this.buildArtifactManifest(runId, descriptor.label, record.paths);
      await fs.writeFile(record.paths.manifestPath, JSON.stringify(artifactManifest, null, 2), 'utf-8');
      this.setRunState(runId, { currentStep: 4, step: { number: 4, status: 'Completed' } });

      this.setRunState(runId, { currentStep: 5, step: { number: 5, status: 'Running' } });
      await buildZipFromFiles(
        [
          { fileName: 'raw.json', filePath: record.paths.rawPath },
          { fileName: 'normalized.json', filePath: record.paths.normalizedPath },
          { fileName: 'summary.md', filePath: record.paths.summaryPath },
          { fileName: 'provision-summary.json', filePath: record.paths.provisionSummaryPath },
          { fileName: 'seed-summary.json', filePath: record.paths.seedSummaryPath },
          { fileName: 'artifact-manifest.json', filePath: record.paths.manifestPath },
        ],
        record.paths.bundlePath,
      );

      const evidenceRefs = await buildEvidenceRefs(runId, [
        {
          fileName: 'artifact-bundle.zip',
          filePath: record.paths.bundlePath,
          contentType: 'application/zip',
          label: 'artifact-bundle.zip',
          isBundle: true,
          bundleFormat: 'zip',
        },
        { fileName: 'raw.json', filePath: record.paths.rawPath, contentType: 'application/json', label: 'raw.json' },
        { fileName: 'normalized.json', filePath: record.paths.normalizedPath, contentType: 'application/json', label: 'normalized.json' },
        { fileName: 'summary.md', filePath: record.paths.summaryPath, contentType: 'text/markdown', label: 'summary.md' },
        {
          fileName: 'provision-summary.json',
          filePath: record.paths.provisionSummaryPath,
          contentType: 'application/json',
          label: 'provision-summary.json',
        },
        {
          fileName: 'seed-summary.json',
          filePath: record.paths.seedSummaryPath,
          contentType: 'application/json',
          label: 'seed-summary.json',
        },
        { fileName: 'artifact-manifest.json', filePath: record.paths.manifestPath, contentType: 'application/json', label: 'artifact-manifest.json' },
      ]);
      record.evidence = { runId, evidenceRefs, total: evidenceRefs.length };
      this.setRunState(runId, { currentStep: 5, step: { number: 5, status: 'Completed' } });

      this.setRunState(runId, { currentStep: 6, step: { number: 6, status: 'Running' } });
      this.setRunState(runId, {
        status: 'Completed',
        completedAt: nowIso(),
        currentStep: 6,
        step: { number: 6, status: 'Completed' },
      });
    } catch (error) {
      const message = sanitizeError(error);
      this.markFailure(runId, message);
    }
  }

  private async buildArtifactManifest(runId: string, actionLabel: string, paths: RunPaths): Promise<Record<string, unknown>> {
    const entries = [
      { fileName: 'raw.json', path: paths.rawPath, contentType: 'application/json' },
      { fileName: 'normalized.json', path: paths.normalizedPath, contentType: 'application/json' },
      { fileName: 'summary.md', path: paths.summaryPath, contentType: 'text/markdown' },
      { fileName: 'provision-summary.json', path: paths.provisionSummaryPath, contentType: 'application/json' },
      { fileName: 'seed-summary.json', path: paths.seedSummaryPath, contentType: 'application/json' },
    ];
    const files = [];
    for (const entry of entries) {
      files.push({
        fileName: entry.fileName,
        contentType: entry.contentType,
        sizeBytes: await fileSizeBytes(entry.path),
        sha256: await fileSha256(entry.path),
      });
    }
    return {
      runId,
      actionLabel,
      generatedAt: nowIso(),
      files,
      warnings: [],
    };
  }

  private setRunState(
    runId: string,
    update: {
      status?: RunRecord['status'];
      currentStep?: number | null;
      startedAt?: string | null;
      completedAt?: string | null;
      step?: { number: number; status: StepResult['status']; errorMessage?: string | null };
    },
  ): void {
    const record = this.runs.get(runId);
    if (!record) {
      return;
    }
    let steps = [...record.run.steps];
    if (update.step) {
      steps = updateStep(steps, update.step.number, update.step.status, update.step.errorMessage ?? null);
    }
    record.run = {
      ...record.run,
      status: update.status ?? record.run.status,
      currentStep: update.currentStep ?? record.run.currentStep,
      startedAt: update.startedAt ?? record.run.startedAt,
      completedAt: update.completedAt ?? record.run.completedAt,
      steps,
    };
  }

  private markFailure(runId: string, message: string): void {
    const record = this.runs.get(runId);
    if (!record) {
      return;
    }
    const failedStep = record.run.steps.find((step) => step.status === 'Running')?.stepNumber ?? record.run.currentStep ?? 1;
    this.setRunState(runId, {
      status: 'Failed',
      completedAt: nowIso(),
      currentStep: failedStep,
      step: { number: failedStep, status: 'Failed', errorMessage: message },
    });
  }
}
