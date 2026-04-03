/**
 * Admin Control Plane — SharePoint control contracts.
 *
 * These types define the shared contract surface for Phase 8 SharePoint
 * control: managed asset identification, standards snapshots, live posture
 * capture, drift comparison, and operator-facing summaries.
 *
 * Design principle: this slice follows the same structural pattern as
 * IAppBinding.ts (drift findings with severity, verification results with
 * outcome). It uses code-default standards derived from provisioning step
 * definitions. Live-override governance belongs to Phase 10.
 *
 * @module admin-control-plane
 */

// ─── Standards Areas ────────────────────────────────────────────────────────────

/**
 * Canonical standards areas for HB Intel-managed SharePoint sites.
 *
 * Each area corresponds to a provisioning saga step expectation.
 */
export enum SharePointStandardsArea {
  /** Site existence and core properties (Step 1) */
  SiteExistence = 'site-existence',

  /** Document libraries: presence and versioning (Step 2) */
  DocumentLibraries = 'document-libraries',

  /** Template files: presence in expected library paths (Step 3) */
  TemplateFiles = 'template-files',

  /** Data lists: presence and expected field schema (Step 4) */
  DataLists = 'data-lists',

  /** SPFx web parts: app catalog presence and site install status (Step 5) */
  WebParts = 'web-parts',

  /** Entra security groups: existence per three-group model (Step 6) */
  SecurityGroups = 'security-groups',

  /** Hub site association status (Step 7) */
  HubAssociation = 'hub-association',

  /** App catalog package posture for HB Intel packages */
  AppCatalogPosture = 'app-catalog-posture',

  /** API access permission status for HB Intel-related grants */
  ApiAccessPosture = 'api-access-posture',
}

// ─── Drift Severity and Outcome ─────────────────────────────────────────────────

/**
 * Drift severity for SharePoint control findings.
 *
 * Same severity model as IAppBindingDriftFinding for consistency.
 */
export type SharePointDriftSeverity = 'critical' | 'warning' | 'info';

/**
 * Overall outcome of a SharePoint standards comparison.
 */
export type SharePointComparisonOutcome = 'compliant' | 'drifted' | 'unknown' | 'error';

// ─── Managed Asset Identifier ───────────────────────────────────────────────────

/**
 * Identifies an HB Intel-managed SharePoint asset for control operations.
 *
 * The asset boundary is derived from provisioning saga execution state:
 * a site is managed if it was created by the saga and has a corresponding
 * record in the ProvisioningStatus table.
 */
export interface ISharePointManagedAsset {
  /** Project identifier (partition key in ProvisioningStatus) */
  readonly projectId: string;

  /** Human-readable project number */
  readonly projectNumber: string;

  /** Human-readable project name */
  readonly projectName: string;

  /** Deterministic site URL derived from project metadata */
  readonly siteUrl: string;

  /** Whether the site was confirmed to exist at last check */
  readonly siteExists: boolean;

  /** ISO 8601 timestamp of provisioning completion (null if incomplete) */
  readonly provisionedAt: string | null;
}

// ─── Standards Snapshot ─────────────────────────────────────────────────────────

/**
 * A single expected-state rule within a standards snapshot.
 *
 * Each expectation describes one thing that should be true about
 * the managed asset according to platform standards.
 */
export interface ISharePointStandardsExpectation {
  /** Standards area this expectation belongs to */
  readonly area: SharePointStandardsArea;

  /** Unique expectation identifier within the area (e.g., 'lib:ProjectDocuments', 'list:ChangeOrders') */
  readonly expectationId: string;

  /** Human-readable label */
  readonly label: string;

  /** Expected value or state description */
  readonly expected: string;

  /** Whether this expectation is repairable in Phase 8 (idempotent create) */
  readonly repairable: boolean;
}

/**
 * Point-in-time standards snapshot for a managed SharePoint asset.
 *
 * In Phase 8, standards are code-default (derived from provisioning step
 * definitions). The snapshot model is forward-compatible with Phase 10
 * live-override governance via the source field on IAdminStandardsReference.
 */
export interface ISharePointStandardsSnapshot {
  /** Standards version identifier (e.g., 'code-default-v1') */
  readonly version: string;

  /** Source of this snapshot */
  readonly source: 'code-default' | 'live-override' | 'merged';

  /** ISO 8601 timestamp when the snapshot was resolved */
  readonly resolvedAt: string;

  /** Ordered list of expectations that define the standard */
  readonly expectations: readonly ISharePointStandardsExpectation[];

  /** Number of expectations by area (for summary display) */
  readonly areaCounts: Readonly<Record<SharePointStandardsArea, number>>;
}

// ─── Observed Posture ───────────────────────────────────────────────────────────

/**
 * A single observed-state observation from a live site inspection.
 *
 * Each observation corresponds to one standards expectation and captures
 * what was actually found.
 */
export interface ISharePointPostureObservation {
  /** Standards area */
  readonly area: SharePointStandardsArea;

  /** Expectation ID this observation corresponds to */
  readonly expectationId: string;

  /** Whether the expected state was found */
  readonly present: boolean;

  /** Observed value or state description (null if not found or not inspectable) */
  readonly observed: string | null;

  /** Additional metadata from the inspection (e.g., library version settings, list field count) */
  readonly metadata: Readonly<Record<string, string | number | boolean>> | null;
}

/**
 * Complete observed posture for a managed SharePoint asset.
 *
 * Captured by a side-effect-free inspection of the live site.
 */
export interface ISharePointPostureSnapshot {
  /** Managed asset this posture was collected for */
  readonly asset: ISharePointManagedAsset;

  /** ISO 8601 timestamp when posture was collected */
  readonly collectedAt: string;

  /** Observations from the inspection */
  readonly observations: readonly ISharePointPostureObservation[];

  /** Areas that could not be inspected (e.g., permission denied, timeout) */
  readonly uninspectableAreas: readonly SharePointStandardsArea[];
}

// ─── Drift Findings ─────────────────────────────────────────────────────────────

/**
 * A single drift finding from a SharePoint standards comparison.
 *
 * Follows the same structural pattern as IAppBindingDriftFinding:
 * field/expected/observed/severity/message.
 */
export interface ISharePointDriftFinding {
  /** Standards area where drift was detected */
  readonly area: SharePointStandardsArea;

  /** Expectation ID that was compared */
  readonly expectationId: string;

  /** Human-readable label of the expectation */
  readonly label: string;

  /** Expected value from the standards snapshot */
  readonly expected: string;

  /** Observed value from the posture snapshot (null if missing entirely) */
  readonly observed: string | null;

  /** Drift severity */
  readonly severity: SharePointDriftSeverity;

  /** Human-readable description of the drift */
  readonly message: string;

  /** Whether this finding is repairable in Phase 8 */
  readonly repairable: boolean;
}

// ─── Comparison Result ──────────────────────────────────────────────────────────

/**
 * Per-area comparison summary for operator display.
 */
export interface ISharePointAreaComparisonSummary {
  /** Standards area */
  readonly area: SharePointStandardsArea;

  /** Human-readable area label */
  readonly areaLabel: string;

  /** Comparison outcome for this area */
  readonly outcome: SharePointComparisonOutcome;

  /** Number of expectations checked */
  readonly expectationsChecked: number;

  /** Number of expectations that passed */
  readonly expectationsPassed: number;

  /** Number of drift findings in this area */
  readonly driftCount: number;

  /** Number of repairable drift findings in this area */
  readonly repairableCount: number;
}

/**
 * Full comparison result for a managed SharePoint asset.
 *
 * This is the primary output of a drift detection run.
 * It combines the standards snapshot, posture snapshot, and
 * normalized drift findings into an operator-facing result
 * and a backend-facing detail payload.
 */
export interface ISharePointComparisonResult {
  /** Managed asset that was compared */
  readonly asset: ISharePointManagedAsset;

  /** Overall comparison outcome */
  readonly outcome: SharePointComparisonOutcome;

  /** ISO 8601 timestamp when comparison completed */
  readonly comparedAt: string;

  /** Standards snapshot used as the baseline */
  readonly standardsVersion: string;

  /** Standards source */
  readonly standardsSource: 'code-default' | 'live-override' | 'merged';

  // ── Operator-facing summary ───────────────────────────────────────────────

  /** Per-area comparison summaries (for dashboard display) */
  readonly areaSummaries: readonly ISharePointAreaComparisonSummary[];

  /** Total expectations checked across all areas */
  readonly totalExpectations: number;

  /** Total expectations that passed across all areas */
  readonly totalPassed: number;

  /** Total drift findings across all areas */
  readonly totalDriftCount: number;

  /** Total repairable findings across all areas */
  readonly totalRepairableCount: number;

  // ── Backend-facing detail ─────────────────────────────────────────────────

  /** All drift findings (for preview/repair execution) */
  readonly findings: readonly ISharePointDriftFinding[];

  /** Areas that could not be inspected (carried from posture snapshot) */
  readonly uninspectableAreas: readonly SharePointStandardsArea[];
}

// ─── Action Keys ────────────────────────────────────────────────────────────────

/**
 * Well-known action keys for SharePoint control operations.
 */
export const SHAREPOINT_CONTROL_ACTION_KEYS = {
  /** Drift detection: compare live site against standards */
  detectDrift: 'sharepoint-control:standards:detect-drift',

  /** Preview: generate impact summary for proposed repair */
  previewRepair: 'sharepoint-control:standards:preview-repair',

  /** Repair: apply standards to drifted items (idempotent create) */
  applyRepair: 'sharepoint-control:standards:apply-repair',

  /** Posture check: inspect app catalog and API access status */
  checkPosture: 'sharepoint-control:posture:check',
} as const;

/**
 * Union type of SharePoint control action keys.
 */
export type SharePointControlActionKey =
  (typeof SHAREPOINT_CONTROL_ACTION_KEYS)[keyof typeof SHAREPOINT_CONTROL_ACTION_KEYS];
