/**
 * Phase 2 Step 6 drift-detection and repair-posture contracts.
 *
 * These types document the future executor adapter's drift-detection
 * and manual-repair contract. They do not perform any tenant operation,
 * Graph/PnP call, or repair action. Live drift detection and any kind
 * of repair belong to Phase 3+ and the future backend executor.
 *
 * Compile-time literals on the posture types make it impossible to
 * express an automatic-repair or live-query posture inside the Phase 2
 * contract surface.
 */

export const DRIFT_REPAIR_POSTURE_VERSION = '0.1.0-posture-doc' as const;
export type DriftRepairPostureVersion = typeof DRIFT_REPAIR_POSTURE_VERSION;

export const DRIFT_REPAIR_NOT_EXECUTABLE_REASON =
  'Phase 2 documents drift detection and manual repair posture; no executor exists in this package or any approved consumer. tenantMutationPerformed remains false.';

export type DriftCategory =
  | 'none'
  | 'informational'
  | 'configuration-drift'
  | 'schema-drift'
  | 'permission-drift'
  | 'content-placement-drift'
  | 'integration-boundary-drift'
  | 'security-drift'
  | 'blocking-drift';

export const DRIFT_CATEGORIES = [
  'none',
  'informational',
  'configuration-drift',
  'schema-drift',
  'permission-drift',
  'content-placement-drift',
  'integration-boundary-drift',
  'security-drift',
  'blocking-drift',
] as const satisfies readonly DriftCategory[];

export type DriftSeverity = 'info' | 'warning' | 'error' | 'blocking';

export const DRIFT_SEVERITIES = ['info', 'warning', 'error', 'blocking'] as const satisfies readonly DriftSeverity[];

export type DriftEnvironment = 'non-production' | 'production-out-of-scope';

export interface DriftEvidence {
  readonly manifestHash: string;
  readonly proofArtifactHash: string;
  readonly observedStateSummary: string;
  readonly variances: readonly string[];
  readonly detectedAt: string;
  readonly operatorIdentity: string;
  readonly environment: DriftEnvironment;
  readonly remediationRecommendation: string;
}

export type DriftComparisonInput =
  | 'approved-manifest'
  | 'approved-proof-artifact'
  | 'apply-gate-decision'
  | 'tenant-observed-state'
  | 'sharepoint-site-url-and-title'
  | 'lists-libraries-pages-groups-permissions'
  | 'source-coverage'
  | 'object-family-coverage'
  | 'expected-vs-observed-fields'
  | 'expected-vs-observed-settings'
  | 'plannedHash-and-proofArtifactHash';

export const DRIFT_COMPARISON_INPUTS = [
  'approved-manifest',
  'approved-proof-artifact',
  'apply-gate-decision',
  'tenant-observed-state',
  'sharepoint-site-url-and-title',
  'lists-libraries-pages-groups-permissions',
  'source-coverage',
  'object-family-coverage',
  'expected-vs-observed-fields',
  'expected-vs-observed-settings',
  'plannedHash-and-proofArtifactHash',
] as const satisfies readonly DriftComparisonInput[];

export interface DriftDetectionPosture {
  readonly postureVersion: DriftRepairPostureVersion;
  readonly comparisonInputs: readonly DriftComparisonInput[];
  readonly allowedCategories: readonly DriftCategory[];
  readonly allowedSeverities: readonly DriftSeverity[];
  readonly liveQueryAllowed: false;
  readonly graphPnpCallAllowed: false;
  readonly automaticRepairAllowed: false;
  readonly notExecutableReason: string;
}

export type RepairMode =
  | 'manual-review-only'
  | 'manual-repair-plan'
  | 'future-assisted-repair'
  | 'future-automated-repair';

export const REPAIR_MODES = [
  'manual-review-only',
  'manual-repair-plan',
  'future-assisted-repair',
  'future-automated-repair',
] as const satisfies readonly RepairMode[];

export const PHASE_2_ALLOWED_REPAIR_MODES = [
  'manual-review-only',
  'manual-repair-plan',
] as const satisfies readonly RepairMode[];

export const PHASE_2_FORBIDDEN_REPAIR_MODES = [
  'future-assisted-repair',
  'future-automated-repair',
] as const satisfies readonly RepairMode[];

export type RepairLifecycleStage =
  | 'detected'
  | 'triaged'
  | 'approved'
  | 'manually-repaired'
  | 'revalidated'
  | 'closed';

export const REPAIR_LIFECYCLE_STAGES = [
  'detected',
  'triaged',
  'approved',
  'manually-repaired',
  'revalidated',
  'closed',
] as const satisfies readonly RepairLifecycleStage[];

export interface RepairPlan {
  readonly repairRef: string;
  readonly driftCategory: DriftCategory;
  readonly severity: DriftSeverity;
  readonly owner: string;
  readonly manualRepairRunbookRef: string;
  readonly preRepairSnapshotRequired: boolean;
  readonly postRepairValidationRequired: boolean;
  readonly approvalRequired: boolean;
  readonly rollbackImpact: string;
  readonly knownIrreversibleActions: readonly string[];
  readonly recommendedAction: string;
  readonly lifecycleStage: RepairLifecycleStage;
}

export interface RepairPosture {
  readonly postureVersion: DriftRepairPostureVersion;
  readonly allowedRepairModes: readonly RepairMode[];
  readonly currentMode: RepairMode;
  readonly automaticTenantRepair: false;
  readonly backgroundRepair: false;
  readonly graphPnpRepair: false;
  readonly spfxTriggeredRepair: false;
  readonly newProofRequiredAfterRepair: true;
  readonly newApplyGateDecisionRequired: true;
  readonly notExecutableReason: string;
}
