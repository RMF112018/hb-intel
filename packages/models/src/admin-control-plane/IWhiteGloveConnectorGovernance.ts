/**
 * White-Glove Connector Governance — shared types for connector registry,
 * policy toggles, configuration versioning, and change attribution.
 *
 * These types are consumed by both the backend (connection-registry-service)
 * and the frontend (connector setup and health UX). Credential values are
 * never included — the backend resolves them internally.
 *
 * @module admin-control-plane
 */

// ─── Connector Classes ─────────────────────────────────────────────────────────

/**
 * Canonical connector class identifiers.
 *
 * Each value maps to a distinct external system that requires
 * UI-driven configuration and health tracking.
 */
export enum ConnectorClassEnum {
  /** On-premises Active Directory Domain Services (Phase 9 hybrid identity) */
  AdDs = 'ad-ds',

  /** Microsoft Graph / Entra ID identity operations (Phase 9 hybrid identity) */
  GraphIdentity = 'graph-identity',

  /** Microsoft Intune device management (white-glove) */
  MicrosoftIntune = 'microsoft-intune',

  /** Windows Autopilot registration and provisioning (white-glove) */
  MicrosoftAutopilot = 'microsoft-autopilot',

  /** Apple Business Manager (white-glove) */
  AppleAbm = 'apple-abm',

  /** Apple Automated Device Enrollment (white-glove) */
  AppleAde = 'apple-ade',

  /** Apple Push Notification Service / MDM (white-glove) */
  AppleApns = 'apple-apns',

  /** NinjaOne API / OAuth (white-glove) */
  NinjaOneApi = 'ninjaone-api',
}

/**
 * The connector classes required specifically for white-glove device deployment.
 */
export const WHITE_GLOVE_CONNECTOR_CLASSES: readonly ConnectorClassEnum[] = [
  ConnectorClassEnum.MicrosoftIntune,
  ConnectorClassEnum.MicrosoftAutopilot,
  ConnectorClassEnum.AppleAbm,
  ConnectorClassEnum.AppleAde,
  ConnectorClassEnum.AppleApns,
  ConnectorClassEnum.NinjaOneApi,
] as const;

// ─── Policy Toggles ────────────────────────────────────────────────────────────

/**
 * Policy toggles governing connector behavior.
 *
 * These are operator-managed settings that control what the connector
 * is allowed to do at runtime.
 */
export interface IConnectorPolicyToggles {
  /** Whether the connector is active and usable */
  readonly enabled: boolean;

  /** If true, only dry-run execution is allowed (no real changes) */
  readonly dryRunOnly: boolean;

  /** Whether real production launches are permitted through this connector */
  readonly productionLaunchAllowed: boolean;

  /** Whether high-risk actions through this connector require a checkpoint */
  readonly highRiskCheckpointRequired: boolean;
}

/**
 * Default policy toggles for a newly created connector.
 *
 * Starts enabled but restricted: dry-run only, no production launches,
 * high-risk checkpoint required. IT must explicitly open the gates.
 */
export const CONNECTOR_DEFAULT_POLICY_TOGGLES: Readonly<IConnectorPolicyToggles> = {
  enabled: true,
  dryRunOnly: true,
  productionLaunchAllowed: false,
  highRiskCheckpointRequired: true,
} as const;

// ─── Change Attribution ────────────────────────────────────────────────────────

/** Types of changes tracked in connector change history. */
export type ConnectorChangeType =
  | 'created'
  | 'updated'
  | 'policy-changed'
  | 'credential-rotated';

/**
 * A single entry in the connector change history.
 */
export interface IConnectorChangeEntry {
  /** Configuration version at this change */
  readonly version: number;

  /** ISO 8601 timestamp of the change */
  readonly changedAt: string;

  /** UPN of the admin who made the change */
  readonly changedBy: string;

  /** Type of change */
  readonly changeType: ConnectorChangeType;

  /** Human-readable summary of what changed */
  readonly summary: string;
}

// ─── Governance Record (API response shape) ────────────────────────────────────

/** Connection health status. */
export type ConnectionHealthStatus = 'healthy' | 'unhealthy' | 'untested';

/**
 * API-safe connector governance record.
 *
 * This is the shape returned by the connection registry API. Credentials
 * are never included — only `hasCredential` indicates presence.
 */
export interface IConnectorGovernanceRecord {
  /** Unique connector identifier */
  readonly connectorId: string;

  /** Connector class */
  readonly connectorClass: ConnectorClassEnum;

  /** Display name */
  readonly displayName: string;

  /** Non-secret configuration metadata */
  readonly config: Record<string, unknown>;

  /** Whether a credential is stored (value is never returned) */
  readonly hasCredential: boolean;

  /** Current health status */
  readonly healthStatus: ConnectionHealthStatus;

  /** Configuration version (monotonically increasing) */
  readonly configVersion: number;

  /** Active policy toggles */
  readonly policyToggles: IConnectorPolicyToggles;

  /** Recent change history (most recent first, capped) */
  readonly changeHistory: readonly IConnectorChangeEntry[];

  // ── Health metadata ──────────────────────────────────────────────────────

  /** ISO 8601 timestamp of last test (null if never tested) */
  readonly lastTestedAt: string | null;

  /** Last test result */
  readonly lastTestResult: 'success' | 'failure' | null;

  /** Last test error message (null if no error) */
  readonly lastTestError: string | null;

  /** UPN of admin who last tested (null if never tested) */
  readonly lastTestedBy: string | null;

  /** ISO 8601 timestamp of last successful test */
  readonly lastSuccessfulTestAt: string | null;

  // ── Audit metadata ───────────────────────────────────────────────────────

  /** ISO 8601 timestamp when connector was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp of last update */
  readonly updatedAt: string;

  /** UPN of admin who created the connector */
  readonly createdBy: string;

  /** UPN of admin who last updated the connector */
  readonly updatedBy: string;
}

// ─── Validation Summary ────────────────────────────────────────────────────────

/**
 * Validation result summary for UI consumption.
 */
export interface IConnectorValidationSummary {
  /** Connector ID that was validated */
  readonly connectorId: string;

  /** Whether validation succeeded */
  readonly success: boolean;

  /** Error message if validation failed */
  readonly error: string | null;

  /** ISO 8601 timestamp of the validation */
  readonly testedAt: string;

  /** Detailed check results (optional) */
  readonly checks?: readonly IConnectorValidationCheck[];
}

/**
 * Individual validation check within a connector test.
 */
export interface IConnectorValidationCheck {
  /** Check identifier */
  readonly checkId: string;

  /** Human-readable check label */
  readonly label: string;

  /** Whether this check passed */
  readonly passed: boolean;

  /** Result message */
  readonly message: string;
}
