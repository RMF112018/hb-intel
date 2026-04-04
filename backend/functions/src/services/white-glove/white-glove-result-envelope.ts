/**
 * P9.1-04: Normalized result envelope for SPFx consumption.
 *
 * Assembles white-glove package run data from the underlying run store,
 * audit service, and evidence service into a single response shape
 * optimized for the operator console.
 *
 * @module white-glove
 */

import type { IAdminAuditRecord } from '@hbc/models/admin-control-plane';
import type {
  WhiteGlovePackageFamily,
  WhiteGlovePackageRunStatus,
  WhiteGloveDeviceRunStatus,
  WhiteGloveDevicePlatform,
  IWhiteGloveCheckpointInstance,
  IWhiteGloveEvidenceItem,
  IWhiteGloveFailureSummary,
} from '@hbc/models/admin-control-plane';

// ─── SPFx Result Envelopes ─────────────────────────────────────────────────────

/**
 * Normalized package run result for SPFx consumption.
 *
 * Aggregates parent run, child device runs, active checkpoints,
 * and recent audit events into a single response.
 */
export interface IWhiteGlovePackageRunResult {
  readonly packageRunId: string;
  readonly packageFamily: WhiteGlovePackageFamily;
  readonly packageStatus: WhiteGlovePackageRunStatus;
  readonly employeeDisplayName: string;
  readonly employeeUpn: string;
  readonly templateVersion: number;
  readonly launchedAt: string;
  readonly completedAt: string | null;
  readonly devices: readonly IWhiteGloveDeviceRunResult[];
  readonly activeCheckpoints: readonly IWhiteGloveCheckpointInstance[];
  readonly recentAuditEvents: readonly IAdminAuditRecord[];
  readonly totalDevices: number;
  readonly completedDevices: number;
  readonly failedDevices: number;
}

/**
 * Normalized device run result for SPFx consumption.
 */
export interface IWhiteGloveDeviceRunResult {
  readonly deviceRunId: string;
  readonly slotOrdinal: number;
  readonly platform: WhiteGloveDevicePlatform;
  readonly serialNumber: string;
  readonly assetTag: string | null;
  readonly hostname: string | null;
  readonly deviceStatus: WhiteGloveDeviceRunStatus;
  readonly checkpoints: readonly IWhiteGloveCheckpointInstance[];
  readonly evidence: readonly IWhiteGloveEvidenceItem[];
  readonly failure: IWhiteGloveFailureSummary | null;
  readonly progress: IDeviceRunProgress | null;
}

/**
 * Progress indicator for a device run.
 */
export interface IDeviceRunProgress {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly currentStepLabel: string | null;
}

// ─── List Result ───────────────────────────────────────────────────────────────

/**
 * Paginated list of package run summaries for SPFx display.
 */
export interface IWhiteGlovePackageRunListResult {
  readonly items: readonly IWhiteGlovePackageRunSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Package run summary for list views (lighter than full result).
 */
export interface IWhiteGlovePackageRunSummary {
  readonly packageRunId: string;
  readonly packageFamily: WhiteGlovePackageFamily;
  readonly packageStatus: WhiteGlovePackageRunStatus;
  readonly employeeDisplayName: string;
  readonly launchedAt: string;
  readonly completedAt: string | null;
  readonly totalDevices: number;
  readonly completedDevices: number;
  readonly failedDevices: number;
}
