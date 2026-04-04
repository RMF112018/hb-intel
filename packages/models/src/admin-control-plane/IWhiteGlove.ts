/**
 * White-Glove Device Deployment — run, checkpoint, evidence, launch,
 * snapshot, and failure classification types.
 *
 * These types define the runtime model for white-glove package runs,
 * child device runs, checkpoints, evidence collection, and failure
 * handling. They compose with the generalized admin control plane
 * model via `IAdminRunEnvelope` (composition, not inheritance).
 *
 * @module admin-control-plane
 */

import type { AdminCheckpointCategory, AdminCheckpointStatus } from './IAdminCheckpoint.js';
import type { IAdminCheckpointDecision } from './IAdminCheckpoint.js';
import type { IAdminRunEnvelope } from './IAdminRun.js';
import type {
  WhiteGloveDeviceManufacturer,
  WhiteGloveDevicePlatform,
  WhiteGloveEnrollmentAuthority,
  WhiteGlovePackageFamily,
} from './IWhiteGloveTemplates.js';

// ─── Checkpoint Types ──────────────────────────────────────────────────────────

/**
 * Domain-specific checkpoint types for white-glove device runs.
 *
 * Each type maps to an `AdminCheckpointCategory` via
 * `WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP`. The checkpoint engine uses
 * the category for lifecycle mechanics; the type identifies the
 * domain-specific pause reason.
 */
export enum WhiteGloveCheckpointType {
  /** Connector readiness validation before run launch */
  ConnectorReadiness = 'connector-readiness',

  /** Technician must prepare device for pre-provisioning */
  TechnicianPrep = 'technician-prep',

  /** Enrollment is blocked by an external platform condition */
  EnrollmentBlocked = 'enrollment-blocked',

  /** Operator must confirm package details before proceeding */
  PackageConfirmation = 'package-confirmation',

  /** Downstream NinjaOne standardization awaiting completion */
  DownstreamStandardization = 'downstream-standardization',

  /** Recovery action required due to failure */
  RecoveryRequired = 'recovery-required',
}

// ─── Evidence Types ────────────────────────────────────────────────────────────

/**
 * Categories of evidence collected during white-glove device runs.
 */
export enum WhiteGloveEvidenceType {
  /** Enrollment receipts and registration confirmations */
  Enrollment = 'enrollment',

  /** Profile assignment and group membership confirmations */
  Assignment = 'assignment',

  /** NinjaOne software bundle deployment receipts */
  SoftwareBundle = 'software-bundle',

  /** Post-action validation check results */
  Validation = 'validation',

  /** Checkpoint decisions and manual operator interventions */
  OperatorAction = 'operator-action',
}

// ─── Package Run Status ────────────────────────────────────────────────────────

/**
 * Lifecycle states for a white-glove package run (parent level).
 *
 * Transitions:
 * - Pending → ReadinessCheck
 * - ReadinessCheck → AwaitingLaunchConfirmation | Failed
 * - AwaitingLaunchConfirmation → Running | Cancelled
 * - Running → AwaitingCheckpoint | Completed | PartiallyCompleted | Failed | Cancelled
 * - AwaitingCheckpoint → Running | Cancelled
 * - PartiallyCompleted → Running (retry failed devices)
 * - Failed → Running (full retry)
 */
export enum WhiteGlovePackageRunStatus {
  /** Package run created, not yet started */
  Pending = 'Pending',

  /** Preflight readiness validation in progress */
  ReadinessCheck = 'ReadinessCheck',

  /** Readiness passed, awaiting operator launch confirmation */
  AwaitingLaunchConfirmation = 'AwaitingLaunchConfirmation',

  /** One or more device runs are active */
  Running = 'Running',

  /** Paused at a device-level checkpoint */
  AwaitingCheckpoint = 'AwaitingCheckpoint',

  /** All device runs completed successfully */
  Completed = 'Completed',

  /** Some device runs succeeded, others failed */
  PartiallyCompleted = 'PartiallyCompleted',

  /** Package run failed */
  Failed = 'Failed',

  /** Package run cancelled by operator */
  Cancelled = 'Cancelled',
}

// ─── Device Run Status ─────────────────────────────────────────────────────────

/**
 * Lifecycle states for a white-glove device run (child level).
 *
 * Transitions:
 * - Pending → Enrolling
 * - Enrolling → AwaitingCheckpoint | Standardizing | Failed
 * - AwaitingCheckpoint → Enrolling | Standardizing | Validating | Cancelled
 * - Standardizing → Validating | Failed | AwaitingCheckpoint
 * - Validating → Completed | Failed
 * - Failed → RecoveryRequired
 * - RecoveryRequired → Enrolling (retry) | Cancelled
 */
export enum WhiteGloveDeviceRunStatus {
  /** Device run created, not yet started */
  Pending = 'Pending',

  /** Device enrollment in progress (via Autopilot or ADE) */
  Enrolling = 'Enrolling',

  /** Paused at a checkpoint */
  AwaitingCheckpoint = 'AwaitingCheckpoint',

  /** NinjaOne post-enrollment standardization in progress */
  Standardizing = 'Standardizing',

  /** Post-standardization validation in progress */
  Validating = 'Validating',

  /** Device run completed successfully */
  Completed = 'Completed',

  /** Device run failed */
  Failed = 'Failed',

  /** Device run cancelled */
  Cancelled = 'Cancelled',

  /** Failure occurred and recovery action is needed */
  RecoveryRequired = 'RecoveryRequired',
}

// ─── Failure Classification ────────────────────────────────────────────────────

/**
 * White-glove-specific failure classifications.
 *
 * These extend the concept of `IAdminFailureSummary.failureClass` with
 * device-deployment-specific categories for targeted recovery guidance.
 */
export enum WhiteGloveFailureClass {
  /** Connector unreachable or authentication failure */
  ConnectorFailure = 'connector-failure',

  /** Platform enrollment rejected or timed out */
  EnrollmentFailure = 'enrollment-failure',

  /** Autopilot or ADE profile assignment failed */
  ProfileAssignmentFailure = 'profile-assignment-failure',

  /** NinjaOne bundle or script execution failed */
  StandardizationFailure = 'standardization-failure',

  /** Post-action validation check failed */
  ValidationFailure = 'validation-failure',

  /** Operator explicitly cancelled */
  OperatorCancellation = 'operator-cancellation',

  /** Retryable transient error */
  Transient = 'transient',

  /** Insufficient permissions on external system */
  PermissionDenied = 'permission-denied',
}

// ─── Launch Request ────────────────────────────────────────────────────────────

/**
 * Per-device input provided at launch time.
 */
export interface IWhiteGloveDeviceLaunchInput {
  /** Which device slot this fills (matches `IWhiteGloveDeviceSlot.ordinal`) */
  readonly slotOrdinal: number;

  /** Device platform */
  readonly platform: WhiteGloveDevicePlatform;

  /** Device manufacturer */
  readonly manufacturer: WhiteGloveDeviceManufacturer;

  /** Device serial number */
  readonly serialNumber: string;

  /** Asset tag (optional) */
  readonly assetTag?: string;

  /** Desired hostname (optional) */
  readonly hostname?: string;
}

/**
 * Request to launch a white-glove package run.
 */
export interface IWhiteGloveLaunchRequest {
  /** Package family to launch */
  readonly packageFamily: WhiteGlovePackageFamily;

  /** Template version to use */
  readonly templateVersion: number;

  /** Employee display name */
  readonly employeeDisplayName: string;

  /** Employee UPN */
  readonly employeeUpn: string;

  /** Employee Entra Object ID */
  readonly employeeObjectId: string;

  /** Per-device inputs (one per device slot) */
  readonly devices: readonly IWhiteGloveDeviceLaunchInput[];

  /** If true, run preflight only without executing */
  readonly dryRun?: boolean;
}

// ─── Connector and Readiness Snapshots ─────────────────────────────────────────

/**
 * State of a single connector at snapshot time.
 */
export interface IWhiteGloveConnectorState {
  /** Connector identifier */
  readonly connectorKey: string;

  /** Whether the connector has been configured */
  readonly configured: boolean;

  /** ISO 8601 timestamp of last health check (null if never checked) */
  readonly lastHealthCheckAt: string | null;

  /** Whether the last health check passed (null if never checked) */
  readonly lastHealthCheckPassed: boolean | null;

  /** Configuration version at snapshot time */
  readonly configVersion: number;
}

/**
 * Snapshot of all connector states captured at package launch.
 */
export interface IWhiteGloveConnectorSnapshot {
  /** Unique snapshot identifier */
  readonly snapshotId: string;

  /** ISO 8601 timestamp when snapshot was captured */
  readonly capturedAt: string;

  /** Microsoft connector state (Entra/Intune/Autopilot) */
  readonly microsoftConnector: IWhiteGloveConnectorState;

  /** Apple connector state (ABM/ADE) */
  readonly appleConnector: IWhiteGloveConnectorState;

  /** NinjaOne connector state */
  readonly ninjaOneConnector: IWhiteGloveConnectorState;
}

/**
 * Individual readiness check result.
 */
export interface IWhiteGloveReadinessCheck {
  /** Check identifier */
  readonly checkId: string;

  /** Human-readable check label */
  readonly label: string;

  /** Whether this check passed */
  readonly passed: boolean;

  /** Descriptive result message */
  readonly message: string;

  /** Whether failure of this check blocks launch */
  readonly blocking: boolean;

  /** Platform this check applies to (null if cross-platform) */
  readonly platform: WhiteGloveDevicePlatform | null;

  /** Check category */
  readonly category: 'connector' | 'enrollment-config' | 'template' | 'environment';
}

/**
 * Snapshot of environment readiness captured at package launch.
 */
export interface IWhiteGloveReadinessSnapshot {
  /** Unique snapshot identifier */
  readonly snapshotId: string;

  /** ISO 8601 timestamp when snapshot was captured */
  readonly capturedAt: string;

  /** Overall readiness verdict */
  readonly overallReady: boolean;

  /** Individual readiness checks */
  readonly checks: readonly IWhiteGloveReadinessCheck[];
}

// ─── Checkpoint Instance ───────────────────────────────────────────────────────

/**
 * Runtime checkpoint within a white-glove device run.
 *
 * Combines the domain-specific `WhiteGloveCheckpointType` with the
 * generalized `AdminCheckpointCategory` and `AdminCheckpointStatus`.
 */
export interface IWhiteGloveCheckpointInstance {
  /** Unique instance identifier */
  readonly instanceId: string;

  /** Domain-specific checkpoint type */
  readonly checkpointType: WhiteGloveCheckpointType;

  /** Generalized checkpoint category (for engine mechanics) */
  readonly category: AdminCheckpointCategory;

  /** Human-readable label */
  readonly label: string;

  /** Current checkpoint lifecycle status */
  readonly status: AdminCheckpointStatus;

  /** ISO 8601 timestamp when checkpoint was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when decision was recorded (null if pending) */
  readonly decidedAt: string | null;

  /** Operator decision (null if pending) */
  readonly decision: IAdminCheckpointDecision | null;

  /** Device run this checkpoint belongs to */
  readonly deviceRunId: string;
}

// ─── Evidence Item ─────────────────────────────────────────────────────────────

/**
 * Evidence artifact collected during a white-glove device run.
 */
export interface IWhiteGloveEvidenceItem {
  /** Unique evidence identifier */
  readonly evidenceId: string;

  /** Evidence category */
  readonly evidenceType: WhiteGloveEvidenceType;

  /** Human-readable label */
  readonly label: string;

  /** Device run this evidence belongs to */
  readonly deviceRunId: string;

  /** ISO 8601 timestamp when evidence was captured */
  readonly capturedAt: string;

  /** Storage locator (inline ref or blob URI) */
  readonly storageLocator: string;

  /** Which adapter produced this evidence */
  readonly adapterSource: 'microsoft' | 'apple' | 'ninjaone' | 'control-plane';

  /** Brief summary of the evidence content */
  readonly summary: string;
}

// ─── Failure Summary ───────────────────────────────────────────────────────────

/**
 * Failure summary for a failed white-glove device run.
 */
export interface IWhiteGloveFailureSummary {
  /** Domain-specific failure classification */
  readonly failureClass: WhiteGloveFailureClass;

  /** Human-readable failure description */
  readonly failureMessage: string;

  /** Step number where failure occurred (null if pre-step failure) */
  readonly failedAtStep: number | null;

  /** Whether the device run is eligible for retry */
  readonly retryEligible: boolean;

  /** Number of retry attempts so far */
  readonly retryCount: number;

  /** ISO 8601 timestamp of last retry (null if never retried) */
  readonly lastRetryAt: string | null;

  /** Whether the failure has been escalated */
  readonly escalated: boolean;

  /** UPN of admin who escalated (null if not escalated) */
  readonly escalatedBy: string | null;

  /** ISO 8601 timestamp of escalation (null if not escalated) */
  readonly escalatedAt: string | null;

  /** Which adapter reported the failure (null if control-plane-level) */
  readonly adapterSource: 'microsoft' | 'apple' | 'ninjaone' | 'control-plane' | null;
}

// ─── Device Run ────────────────────────────────────────────────────────────────

/**
 * A child device run within a white-glove package run.
 *
 * Contains its own `IAdminRunEnvelope` for unified display/history.
 * The `parentPackageRunId` provides an explicit back-reference to
 * the parent package run.
 */
export interface IWhiteGloveDeviceRun {
  /** Generalized run envelope for this device run */
  readonly run: IAdminRunEnvelope;

  /** Explicit back-reference to the parent package run */
  readonly parentPackageRunId: string;

  /** Which device slot this run fills */
  readonly slotOrdinal: number;

  /** Device platform */
  readonly platform: WhiteGloveDevicePlatform;

  /** Device manufacturer */
  readonly manufacturer: WhiteGloveDeviceManufacturer;

  /** Device serial number */
  readonly serialNumber: string;

  /** Asset tag (null if not provided) */
  readonly assetTag: string | null;

  /** Hostname (null if not provided) */
  readonly hostname: string | null;

  /** Device-level lifecycle status */
  readonly deviceStatus: WhiteGloveDeviceRunStatus;

  /** Which system owns enrollment for this device */
  readonly enrollmentAuthority: WhiteGloveEnrollmentAuthority;

  /** Checkpoints within this device run */
  readonly checkpoints: readonly IWhiteGloveCheckpointInstance[];

  /** Evidence collected during this device run */
  readonly evidence: readonly IWhiteGloveEvidenceItem[];

  /** Failure summary (null if not failed) */
  readonly failure: IWhiteGloveFailureSummary | null;
}

// ─── Package Run ───────────────────────────────────────────────────────────────

/**
 * A white-glove package run (parent level).
 *
 * Contains its own `IAdminRunEnvelope` for unified display/history.
 * Child device runs are nested in the `deviceRuns` array.
 */
export interface IWhiteGlovePackageRun {
  /** Generalized run envelope for this package run */
  readonly run: IAdminRunEnvelope;

  /** Package family being deployed */
  readonly packageFamily: WhiteGlovePackageFamily;

  /** Template version used for this run */
  readonly templateVersion: number;

  /** Employee display name */
  readonly employeeDisplayName: string;

  /** Employee UPN */
  readonly employeeUpn: string;

  /** Employee Entra Object ID */
  readonly employeeObjectId: string;

  /** Package-level lifecycle status */
  readonly packageStatus: WhiteGlovePackageRunStatus;

  /** Child device runs (one per device slot) */
  readonly deviceRuns: readonly IWhiteGloveDeviceRun[];

  /** Connector state at launch time */
  readonly connectorSnapshot: IWhiteGloveConnectorSnapshot;

  /** Environment readiness at launch time */
  readonly readinessSnapshot: IWhiteGloveReadinessSnapshot;

  /** ISO 8601 timestamp when the package run was launched */
  readonly launchedAt: string;
}

// ─── Action Keys ───────────────────────────────────────────────────────────────

/**
 * White-glove action keys following the `domain:family:verb` pattern.
 */
export const WHITE_GLOVE_ACTION_KEYS = {
  LAUNCH_PACKAGE: 'white-glove-deployment:package:launch',
  CANCEL_PACKAGE: 'white-glove-deployment:package:cancel',
  RETRY_PACKAGE: 'white-glove-deployment:package:retry',
  PREFLIGHT_ONLY: 'white-glove-deployment:package:preflight-only',
  RETRY_DEVICE: 'white-glove-deployment:device:retry',
  REPAIR_DEVICE: 'white-glove-deployment:device:repair',
} as const;

/** Union type of all white-glove action key values */
export type WhiteGloveActionKey = (typeof WHITE_GLOVE_ACTION_KEYS)[keyof typeof WHITE_GLOVE_ACTION_KEYS];

// ─── Checkpoint Category Mapping ───────────────────────────────────────────────

/**
 * Maps white-glove checkpoint types to generalized checkpoint categories.
 *
 * The checkpoint engine uses the `AdminCheckpointCategory` for lifecycle
 * mechanics (timeout, escalation, confirmation phrase). The
 * `WhiteGloveCheckpointType` identifies the domain-specific pause reason.
 */
export const WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP: Readonly<
  Record<WhiteGloveCheckpointType, AdminCheckpointCategory>
> = {
  [WhiteGloveCheckpointType.ConnectorReadiness]: 'pre-execution-approval' as AdminCheckpointCategory,
  [WhiteGloveCheckpointType.TechnicianPrep]: 'external-event-wait' as AdminCheckpointCategory,
  [WhiteGloveCheckpointType.EnrollmentBlocked]: 'external-event-wait' as AdminCheckpointCategory,
  [WhiteGloveCheckpointType.PackageConfirmation]: 'mid-execution-review' as AdminCheckpointCategory,
  [WhiteGloveCheckpointType.DownstreamStandardization]: 'post-execution-validation' as AdminCheckpointCategory,
  [WhiteGloveCheckpointType.RecoveryRequired]: 'destructive-confirmation' as AdminCheckpointCategory,
};
