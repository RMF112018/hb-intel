/**
 * P9.1-04: White-glove package run service.
 *
 * Orchestrates parent package runs and child device runs by composing
 * with the existing generalized admin run, audit, and evidence services.
 * Does not replace or modify existing provisioning infrastructure.
 *
 * Persistence: uses existing AdminRuns, AdminAuditEvents, and AdminEvidence
 * tables via the generalized service interfaces.
 *
 * Pattern: interface + in-memory stub (same as connection-registry-service).
 * Durable Table Storage backing will be added when adapter lanes are built.
 *
 * @module white-glove
 */

import type { IAdminActorContext, IAdminAuditRecord } from '@hbc/models/admin-control-plane';
import {
  AdminDomain,
  AdminAuditEventType,
  AdminCheckpointStatus,
  WhiteGlovePackageRunStatus,
  WhiteGloveDeviceRunStatus,
  WHITE_GLOVE_ACTION_KEYS,
  WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP,
} from '@hbc/models/admin-control-plane';
import type {
  WhiteGlovePackageFamily,
  WhiteGloveDevicePlatform,
  WhiteGloveDeviceManufacturer,
  WhiteGloveEnrollmentAuthority,
  WhiteGloveCheckpointType,
  WhiteGloveEvidenceType,
  IWhiteGloveCheckpointInstance,
  IWhiteGloveEvidenceItem,
  IWhiteGloveFailureSummary,
  IWhiteGloveConnectorSnapshot,
  IWhiteGloveReadinessSnapshot,
} from '@hbc/models/admin-control-plane';
import type { IAdminRunService, IAdminAuditService, IAdminEvidenceService } from '../admin-control-plane/types.js';
import type {
  IWhiteGlovePackageRunResult,
  IWhiteGloveDeviceRunResult,
  IWhiteGlovePackageRunListResult,
  IWhiteGlovePackageRunSummary,
} from './white-glove-result-envelope.js';
import { getRetryStrategy } from './white-glove-retry-semantics.js';

// ─── Internal Storage Types ────────────────────────────────────────────────────

/** Internal package run record (stored in-memory, later Table Storage). */
interface PackageRunRecord {
  packageRunId: string;
  packageFamily: WhiteGlovePackageFamily;
  templateVersion: number;
  employeeDisplayName: string;
  employeeUpn: string;
  employeeObjectId: string;
  packageStatus: WhiteGlovePackageRunStatus;
  deviceRunIds: string[];
  connectorSnapshot: IWhiteGloveConnectorSnapshot | null;
  readinessSnapshot: IWhiteGloveReadinessSnapshot | null;
  launchedAt: string;
  completedAt: string | null;
  initiatedBy: IAdminActorContext;
}

/** Internal device run record (stored in-memory, later Table Storage). */
interface DeviceRunRecord {
  deviceRunId: string;
  parentPackageRunId: string;
  slotOrdinal: number;
  platform: WhiteGloveDevicePlatform;
  manufacturer: WhiteGloveDeviceManufacturer;
  enrollmentAuthority: WhiteGloveEnrollmentAuthority;
  serialNumber: string;
  assetTag: string | null;
  hostname: string | null;
  deviceStatus: WhiteGloveDeviceRunStatus;
  checkpoints: IWhiteGloveCheckpointInstance[];
  evidence: IWhiteGloveEvidenceItem[];
  failure: IWhiteGloveFailureSummary | null;
  currentStep: number;
  totalSteps: number;
  currentStepLabel: string | null;
  createdAt: string;
  completedAt: string | null;
}

// ─── Launch Request ────────────────────────────────────────────────────────────

export interface IWhiteGloveRunLaunchRequest {
  readonly packageFamily: WhiteGlovePackageFamily;
  readonly templateVersion: number;
  readonly employeeDisplayName: string;
  readonly employeeUpn: string;
  readonly employeeObjectId: string;
  readonly devices: readonly IWhiteGloveDeviceLaunchInput[];
  readonly dryRun?: boolean;
}

export interface IWhiteGloveDeviceLaunchInput {
  readonly slotOrdinal: number;
  readonly platform: WhiteGloveDevicePlatform;
  readonly manufacturer: WhiteGloveDeviceManufacturer;
  readonly enrollmentAuthority: WhiteGloveEnrollmentAuthority;
  readonly serialNumber: string;
  readonly assetTag?: string;
  readonly hostname?: string;
}

// ─── Service Interface ─────────────────────────────────────────────────────────

export interface IWhiteGloveRunService {
  /** Launch a new package run with child device runs. */
  launchPackageRun(request: IWhiteGloveRunLaunchRequest, actor: IAdminActorContext): Promise<IWhiteGlovePackageRunResult>;

  /** Get the full package run result for SPFx consumption. */
  getPackageRun(packageRunId: string): Promise<IWhiteGlovePackageRunResult | null>;

  /** List package runs with pagination. */
  listPackageRuns(options: { page?: number; pageSize?: number; status?: string }): Promise<IWhiteGlovePackageRunListResult>;

  /** Cancel a package run and all non-terminal child device runs. */
  cancelPackageRun(packageRunId: string, actor: IAdminActorContext, reason?: string): Promise<IWhiteGlovePackageRunResult>;

  /** Retry a failed package run. Creates new parent linked to the original. */
  retryPackageRun(packageRunId: string, actor: IAdminActorContext): Promise<IWhiteGlovePackageRunResult>;

  /** Retry a single failed device run. */
  retryDeviceRun(deviceRunId: string, actor: IAdminActorContext): Promise<IWhiteGloveDeviceRunResult>;

  /** Get a single device run with checkpoints and evidence. */
  getDeviceRun(deviceRunId: string): Promise<IWhiteGloveDeviceRunResult | null>;

  /** Update a device run status (called by adapters during orchestration). */
  updateDeviceStatus(deviceRunId: string, status: WhiteGloveDeviceRunStatus, actor: IAdminActorContext): Promise<void>;

  /** Record a checkpoint on a device run. */
  recordDeviceCheckpoint(
    deviceRunId: string,
    checkpointType: WhiteGloveCheckpointType,
    label: string,
    actor: IAdminActorContext,
  ): Promise<IWhiteGloveCheckpointInstance>;

  /** Resolve (approve/reject) a checkpoint on a device run. */
  resolveDeviceCheckpoint(
    deviceRunId: string,
    checkpointInstanceId: string,
    decision: 'approve' | 'reject',
    actor: IAdminActorContext,
    comment?: string,
  ): Promise<IWhiteGloveCheckpointInstance>;

  /** Record evidence from a device run. */
  recordDeviceEvidence(
    deviceRunId: string,
    evidenceType: WhiteGloveEvidenceType,
    label: string,
    adapterSource: 'microsoft' | 'apple' | 'ninjaone' | 'control-plane',
    summary: string,
  ): Promise<IWhiteGloveEvidenceItem>;
}

// ─── Implementation ────────────────────────────────────────────────────────────

export class WhiteGloveRunService implements IWhiteGloveRunService {
  private readonly packageRuns = new Map<string, PackageRunRecord>();
  private readonly deviceRuns = new Map<string, DeviceRunRecord>();

  constructor(
    private readonly runService: IAdminRunService,
    private readonly auditService: IAdminAuditService,
    private readonly evidenceService: IAdminEvidenceService,
  ) {}

  /** Emit structured observability event. */
  private logEvent(name: string, data: Record<string, unknown>): void {
    console.log(JSON.stringify({
      level: 'info',
      _telemetryType: 'customEvent',
      name: `white-glove.${name}`,
      surface: 'white-glove-run-service',
      timestamp: new Date().toISOString(),
      ...data,
    }));
  }

  async launchPackageRun(
    request: IWhiteGloveRunLaunchRequest,
    actor: IAdminActorContext,
  ): Promise<IWhiteGlovePackageRunResult> {
    const now = new Date().toISOString();
    const packageRunId = crypto.randomUUID();

    // Create parent run envelope in generalized store
    await this.runService.launchRun(
      {
        actionKey: WHITE_GLOVE_ACTION_KEYS.LAUNCH_PACKAGE as string,
        commandInput: { packageFamily: request.packageFamily, templateVersion: request.templateVersion },
        targetEntityId: request.employeeUpn,
        targetEntityLabel: request.employeeDisplayName,
        dryRun: request.dryRun,
      } as never,
      actor,
    );

    // Create device runs
    const deviceRunIds: string[] = [];
    for (const device of request.devices) {
      const deviceRunId = crypto.randomUUID();
      deviceRunIds.push(deviceRunId);

      const deviceRecord: DeviceRunRecord = {
        deviceRunId,
        parentPackageRunId: packageRunId,
        slotOrdinal: device.slotOrdinal,
        platform: device.platform,
        manufacturer: device.manufacturer,
        enrollmentAuthority: device.enrollmentAuthority,
        serialNumber: device.serialNumber,
        assetTag: device.assetTag ?? null,
        hostname: device.hostname ?? null,
        deviceStatus: WhiteGloveDeviceRunStatus.Pending,
        checkpoints: [],
        evidence: [],
        failure: null,
        currentStep: 0,
        totalSteps: 0,
        currentStepLabel: null,
        createdAt: now,
        completedAt: null,
      };
      this.deviceRuns.set(deviceRunId, deviceRecord);
    }

    // Create package run record
    const packageRecord: PackageRunRecord = {
      packageRunId,
      packageFamily: request.packageFamily,
      templateVersion: request.templateVersion,
      employeeDisplayName: request.employeeDisplayName,
      employeeUpn: request.employeeUpn,
      employeeObjectId: request.employeeObjectId,
      packageStatus: WhiteGlovePackageRunStatus.Pending,
      deviceRunIds,
      connectorSnapshot: null,
      readinessSnapshot: null,
      launchedAt: now,
      completedAt: null,
      initiatedBy: actor,
    };
    this.packageRuns.set(packageRunId, packageRecord);

    // Observability + audit
    this.logEvent('package.launched', { packageRunId, packageFamily: request.packageFamily, employeeUpn: request.employeeUpn, deviceCount: request.devices.length, actor: actor.upn });
    await this.recordAuditEvent(packageRunId, 'PackageLaunched', actor,
      `Package run launched for ${request.employeeDisplayName} (${request.packageFamily}, ${request.devices.length} devices)`);

    return this.assemblePackageRunResult(packageRecord);
  }

  async getPackageRun(packageRunId: string): Promise<IWhiteGlovePackageRunResult | null> {
    const record = this.packageRuns.get(packageRunId);
    if (!record) return null;
    return this.assemblePackageRunResult(record);
  }

  async listPackageRuns(options: { page?: number; pageSize?: number; status?: string }): Promise<IWhiteGlovePackageRunListResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 25;
    let runs = [...this.packageRuns.values()];

    if (options.status) {
      runs = runs.filter(r => r.packageStatus === options.status);
    }

    runs.sort((a, b) => b.launchedAt.localeCompare(a.launchedAt));
    const total = runs.length;
    const start = (page - 1) * pageSize;
    const paged = runs.slice(start, start + pageSize);

    const items: IWhiteGlovePackageRunSummary[] = paged.map(r => this.assemblePackageRunSummary(r));

    return { items, total, page, pageSize };
  }

  async cancelPackageRun(
    packageRunId: string,
    actor: IAdminActorContext,
    reason?: string,
  ): Promise<IWhiteGlovePackageRunResult> {
    const record = this.packageRuns.get(packageRunId);
    if (!record) throw new Error(`Package run ${packageRunId} not found`);

    const terminalStatuses = new Set([
      WhiteGlovePackageRunStatus.Completed,
      WhiteGlovePackageRunStatus.Failed,
      WhiteGlovePackageRunStatus.Cancelled,
    ]);
    if (terminalStatuses.has(record.packageStatus)) {
      throw new Error(`Package run ${packageRunId} is already in terminal status ${record.packageStatus}`);
    }

    // Cancel all non-terminal device runs
    const deviceTerminal = new Set([
      WhiteGloveDeviceRunStatus.Completed,
      WhiteGloveDeviceRunStatus.Failed,
      WhiteGloveDeviceRunStatus.Cancelled,
    ]);
    for (const deviceRunId of record.deviceRunIds) {
      const dr = this.deviceRuns.get(deviceRunId);
      if (dr && !deviceTerminal.has(dr.deviceStatus)) {
        dr.deviceStatus = WhiteGloveDeviceRunStatus.Cancelled;
        dr.completedAt = new Date().toISOString();
      }
    }

    record.packageStatus = WhiteGlovePackageRunStatus.Cancelled;
    record.completedAt = new Date().toISOString();

    await this.recordAuditEvent(packageRunId, 'PackageCancelled', actor,
      `Package run cancelled${reason ? `: ${reason}` : ''}`);

    return this.assemblePackageRunResult(record);
  }

  async retryPackageRun(
    packageRunId: string,
    actor: IAdminActorContext,
  ): Promise<IWhiteGlovePackageRunResult> {
    const original = this.packageRuns.get(packageRunId);
    if (!original) throw new Error(`Package run ${packageRunId} not found`);

    // Collect failed device inputs for retry
    const failedDevices: IWhiteGloveDeviceLaunchInput[] = [];
    for (const deviceRunId of original.deviceRunIds) {
      const dr = this.deviceRuns.get(deviceRunId);
      if (dr && (dr.deviceStatus === WhiteGloveDeviceRunStatus.Failed || dr.deviceStatus === WhiteGloveDeviceRunStatus.RecoveryRequired)) {
        if (dr.failure) {
          const strategy = getRetryStrategy(dr.failure.failureClass);
          if (!strategy.eligible || dr.failure.retryCount >= strategy.maxRetries) continue;
        }
        failedDevices.push({
          slotOrdinal: dr.slotOrdinal,
          platform: dr.platform,
          manufacturer: dr.manufacturer,
          enrollmentAuthority: dr.enrollmentAuthority,
          serialNumber: dr.serialNumber,
          assetTag: dr.assetTag ?? undefined,
          hostname: dr.hostname ?? undefined,
        });
      }
    }

    if (failedDevices.length === 0) {
      throw new Error('No retryable failed devices found');
    }

    return this.launchPackageRun({
      packageFamily: original.packageFamily,
      templateVersion: original.templateVersion,
      employeeDisplayName: original.employeeDisplayName,
      employeeUpn: original.employeeUpn,
      employeeObjectId: original.employeeObjectId,
      devices: failedDevices,
    }, actor);
  }

  async retryDeviceRun(
    deviceRunId: string,
    actor: IAdminActorContext,
  ): Promise<IWhiteGloveDeviceRunResult> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) throw new Error(`Device run ${deviceRunId} not found`);

    if (dr.failure) {
      const strategy = getRetryStrategy(dr.failure.failureClass);
      if (!strategy.eligible) throw new Error(`Device run failure class ${dr.failure.failureClass} is not retryable`);
      if (dr.failure.retryCount >= strategy.maxRetries) throw new Error(`Max retries (${strategy.maxRetries}) exceeded`);

      (dr.failure as { retryCount: number }).retryCount += 1;
      (dr.failure as { lastRetryAt: string }).lastRetryAt = new Date().toISOString();
    }

    dr.deviceStatus = WhiteGloveDeviceRunStatus.Pending;
    dr.completedAt = null;

    await this.recordAuditEvent(dr.parentPackageRunId, 'DeviceRetried', actor,
      `Device run ${deviceRunId} retried (${dr.platform}, ${dr.serialNumber})`);

    return this.assembleDeviceRunResult(dr);
  }

  async getDeviceRun(deviceRunId: string): Promise<IWhiteGloveDeviceRunResult | null> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) return null;
    return this.assembleDeviceRunResult(dr);
  }

  async updateDeviceStatus(
    deviceRunId: string,
    status: WhiteGloveDeviceRunStatus,
    actor: IAdminActorContext,
  ): Promise<void> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) throw new Error(`Device run ${deviceRunId} not found`);

    const previousStatus = dr.deviceStatus;
    dr.deviceStatus = status;

    const terminalStatuses = new Set([
      WhiteGloveDeviceRunStatus.Completed,
      WhiteGloveDeviceRunStatus.Failed,
      WhiteGloveDeviceRunStatus.Cancelled,
    ]);
    if (terminalStatuses.has(status)) {
      dr.completedAt = new Date().toISOString();
    }

    await this.recordAuditEvent(dr.parentPackageRunId, 'DeviceStatusChanged', actor,
      `Device ${dr.serialNumber} status: ${previousStatus} → ${status}`);

    // Aggregate parent status
    this.aggregatePackageStatus(dr.parentPackageRunId);
  }

  async recordDeviceCheckpoint(
    deviceRunId: string,
    checkpointType: WhiteGloveCheckpointType,
    label: string,
    actor: IAdminActorContext,
  ): Promise<IWhiteGloveCheckpointInstance> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) throw new Error(`Device run ${deviceRunId} not found`);

    const checkpoint: IWhiteGloveCheckpointInstance = {
      instanceId: crypto.randomUUID(),
      checkpointType,
      category: WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP[checkpointType],
      label,
      status: AdminCheckpointStatus.Pending,
      createdAt: new Date().toISOString(),
      decidedAt: null,
      decision: null,
      deviceRunId,
    };

    dr.checkpoints.push(checkpoint);
    dr.deviceStatus = WhiteGloveDeviceRunStatus.AwaitingCheckpoint;

    await this.recordAuditEvent(dr.parentPackageRunId, AdminAuditEventType.CheckpointCreated, actor,
      `Checkpoint created: ${label} (${checkpointType}) on device ${dr.serialNumber}`);

    this.aggregatePackageStatus(dr.parentPackageRunId);
    return checkpoint;
  }

  async resolveDeviceCheckpoint(
    deviceRunId: string,
    checkpointInstanceId: string,
    decision: 'approve' | 'reject',
    actor: IAdminActorContext,
    comment?: string,
  ): Promise<IWhiteGloveCheckpointInstance> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) throw new Error(`Device run ${deviceRunId} not found`);

    const cpIndex = dr.checkpoints.findIndex(c => c.instanceId === checkpointInstanceId);
    if (cpIndex === -1) throw new Error(`Checkpoint ${checkpointInstanceId} not found`);

    const now = new Date().toISOString();
    const resolved: IWhiteGloveCheckpointInstance = {
      ...dr.checkpoints[cpIndex],
      status: decision === 'approve' ? AdminCheckpointStatus.Approved : AdminCheckpointStatus.Rejected,
      decidedAt: now,
      decision: {
        actor,
        outcome: decision,
        comment: comment ?? null,
        confirmationPhrase: null,
        decidedAt: now,
        idempotencyKey: crypto.randomUUID(),
      },
    };

    dr.checkpoints[cpIndex] = resolved;

    await this.recordAuditEvent(dr.parentPackageRunId, AdminAuditEventType.CheckpointDecided, actor,
      `Checkpoint ${decision}d: ${resolved.label} on device ${dr.serialNumber}${comment ? ` — ${comment}` : ''}`);

    if (decision === 'reject') {
      dr.deviceStatus = WhiteGloveDeviceRunStatus.Failed;
      dr.completedAt = now;
      this.aggregatePackageStatus(dr.parentPackageRunId);
    }

    return resolved;
  }

  async recordDeviceEvidence(
    deviceRunId: string,
    evidenceType: WhiteGloveEvidenceType,
    label: string,
    adapterSource: 'microsoft' | 'apple' | 'ninjaone' | 'control-plane',
    summary: string,
  ): Promise<IWhiteGloveEvidenceItem> {
    const dr = this.deviceRuns.get(deviceRunId);
    if (!dr) throw new Error(`Device run ${deviceRunId} not found`);

    const evidence: IWhiteGloveEvidenceItem = {
      evidenceId: crypto.randomUUID(),
      evidenceType,
      label,
      deviceRunId,
      capturedAt: new Date().toISOString(),
      storageLocator: `inline://${deviceRunId}/${crypto.randomUUID()}`,
      adapterSource,
      summary,
    };

    dr.evidence.push(evidence);

    // Also record in the generalized evidence service
    await this.evidenceService.recordEvidence(
      {
        evidenceId: evidence.evidenceId,
        evidenceType: evidenceType as string,
        label,
        runId: dr.parentPackageRunId,
        stepNumber: null,
        capturedAt: evidence.capturedAt,
        storageLocator: evidence.storageLocator,
      } as never,
      'compliance',
    );

    return evidence;
  }

  // ─── Internal Helpers ──────────────────────────────────────────────────────

  private aggregatePackageStatus(packageRunId: string): void {
    const record = this.packageRuns.get(packageRunId);
    if (!record) return;

    const deviceStatuses = record.deviceRunIds
      .map(id => this.deviceRuns.get(id))
      .filter((dr): dr is DeviceRunRecord => dr !== undefined)
      .map(dr => dr.deviceStatus);

    const allCompleted = deviceStatuses.every(s => s === WhiteGloveDeviceRunStatus.Completed);
    const allTerminal = deviceStatuses.every(s =>
      s === WhiteGloveDeviceRunStatus.Completed ||
      s === WhiteGloveDeviceRunStatus.Failed ||
      s === WhiteGloveDeviceRunStatus.Cancelled,
    );
    const anyAwaiting = deviceStatuses.some(s => s === WhiteGloveDeviceRunStatus.AwaitingCheckpoint);
    const anyFailed = deviceStatuses.some(s => s === WhiteGloveDeviceRunStatus.Failed || s === WhiteGloveDeviceRunStatus.RecoveryRequired);
    const someCompleted = deviceStatuses.some(s => s === WhiteGloveDeviceRunStatus.Completed);

    if (allCompleted) {
      record.packageStatus = WhiteGlovePackageRunStatus.Completed;
      record.completedAt = new Date().toISOString();
    } else if (allTerminal && anyFailed && someCompleted) {
      record.packageStatus = WhiteGlovePackageRunStatus.PartiallyCompleted;
      record.completedAt = new Date().toISOString();
    } else if (allTerminal && anyFailed) {
      record.packageStatus = WhiteGlovePackageRunStatus.Failed;
      record.completedAt = new Date().toISOString();
    } else if (anyAwaiting) {
      record.packageStatus = WhiteGlovePackageRunStatus.AwaitingCheckpoint;
    } else {
      record.packageStatus = WhiteGlovePackageRunStatus.Running;
    }
  }

  private assemblePackageRunResult(record: PackageRunRecord): IWhiteGlovePackageRunResult {
    const devices = record.deviceRunIds
      .map(id => this.deviceRuns.get(id))
      .filter((dr): dr is DeviceRunRecord => dr !== undefined)
      .map(dr => this.assembleDeviceRunResult(dr));

    const activeCheckpoints = devices.flatMap(d =>
      d.checkpoints.filter(c => c.status === AdminCheckpointStatus.Pending),
    );

    const completedDevices = devices.filter(d => d.deviceStatus === WhiteGloveDeviceRunStatus.Completed).length;
    const failedDevices = devices.filter(d =>
      d.deviceStatus === WhiteGloveDeviceRunStatus.Failed ||
      d.deviceStatus === WhiteGloveDeviceRunStatus.RecoveryRequired,
    ).length;

    return {
      packageRunId: record.packageRunId,
      packageFamily: record.packageFamily,
      packageStatus: record.packageStatus,
      employeeDisplayName: record.employeeDisplayName,
      employeeUpn: record.employeeUpn,
      templateVersion: record.templateVersion,
      launchedAt: record.launchedAt,
      completedAt: record.completedAt,
      devices,
      activeCheckpoints,
      recentAuditEvents: [],
      totalDevices: devices.length,
      completedDevices,
      failedDevices,
    };
  }

  private assemblePackageRunSummary(record: PackageRunRecord): IWhiteGlovePackageRunSummary {
    const deviceStatuses = record.deviceRunIds
      .map(id => this.deviceRuns.get(id))
      .filter((dr): dr is DeviceRunRecord => dr !== undefined);

    return {
      packageRunId: record.packageRunId,
      packageFamily: record.packageFamily,
      packageStatus: record.packageStatus,
      employeeDisplayName: record.employeeDisplayName,
      launchedAt: record.launchedAt,
      completedAt: record.completedAt,
      totalDevices: deviceStatuses.length,
      completedDevices: deviceStatuses.filter(d => d.deviceStatus === WhiteGloveDeviceRunStatus.Completed).length,
      failedDevices: deviceStatuses.filter(d => d.deviceStatus === WhiteGloveDeviceRunStatus.Failed || d.deviceStatus === WhiteGloveDeviceRunStatus.RecoveryRequired).length,
    };
  }

  private assembleDeviceRunResult(dr: DeviceRunRecord): IWhiteGloveDeviceRunResult {
    return {
      deviceRunId: dr.deviceRunId,
      slotOrdinal: dr.slotOrdinal,
      platform: dr.platform,
      serialNumber: dr.serialNumber,
      assetTag: dr.assetTag,
      hostname: dr.hostname,
      deviceStatus: dr.deviceStatus,
      checkpoints: [...dr.checkpoints],
      evidence: [...dr.evidence],
      failure: dr.failure,
      progress: dr.totalSteps > 0
        ? { currentStep: dr.currentStep, totalSteps: dr.totalSteps, currentStepLabel: dr.currentStepLabel }
        : null,
    };
  }

  private async recordAuditEvent(
    runId: string,
    eventType: AdminAuditEventType | string,
    actor: IAdminActorContext,
    summary: string,
  ): Promise<void> {
    const record: IAdminAuditRecord = {
      auditId: crypto.randomUUID(),
      eventType: eventType as AdminAuditEventType,
      timestamp: new Date().toISOString(),
      domain: AdminDomain.WhiteGloveDeployment,
      actionKey: WHITE_GLOVE_ACTION_KEYS.LAUNCH_PACKAGE,
      runId,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary,
    } as IAdminAuditRecord;

    try {
      await this.auditService.recordEvent(record);
    } catch {
      // Non-blocking audit recording
      console.warn(`[WhiteGloveRunService] Failed to record audit event: ${summary}`);
    }
  }
}

// ─── Mock ────────────────────────────────────────────────────────────────────

export class MockWhiteGloveRunService extends WhiteGloveRunService {}
