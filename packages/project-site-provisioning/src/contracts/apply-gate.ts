import type { DryRunProofArtifact } from './dry-run-proof-artifact.js';
import type { ProvisioningManifest } from './provisioning-manifest.js';

/**
 * Phase 2 Step 5 apply-gate contracts.
 *
 * The apply gate is a pure validation/decision layer that consumes a
 * frozen provisioning manifest plus its dry-run proof artifact and
 * decides whether the request is *ready for a future non-production
 * apply* — without executing anything. No tenant calls, no Graph / PnP
 * / SharePoint / SPFx / Procore. Production targets are rejected.
 */

export const APPLY_GATE_DECISION_VERSION = '0.1.0-apply-gate' as const;
export type ApplyGateDecisionVersion = typeof APPLY_GATE_DECISION_VERSION;

export const APPLY_GATE_NOT_EXECUTABLE_REASON =
  'Phase 2 Step 5 defines the apply-gate boundary; no executor exists in this package or any approved consumer. tenantMutationPerformed remains false.';

export type ApplyGateEnvironment = 'non-production' | 'production';

export interface NonProductionTargetDeclaration {
  readonly targetEnvironment: 'non-production';
  readonly tenantName: string;
  readonly tenantIdPlaceholder: string;
  readonly siteCollectionBaseUrl: string;
  readonly allowedSitePathPrefix: string;
  readonly operatorGroup: string;
  readonly dataClassification: string;
  readonly mutationMode: 'blocked-in-step-5' | 'future-non-production';
  readonly notes?: string;
}

export type ApplyGateApprovalStatus =
  | 'not-requested'
  | 'pending'
  | 'approved-for-non-production'
  | 'rejected';

export const APPLY_GATE_APPROVAL_STATUSES: readonly ApplyGateApprovalStatus[] = [
  'not-requested',
  'pending',
  'approved-for-non-production',
  'rejected',
] as const;

export type ApplyGateApprovalScope = 'non-production-only';

export interface ApplyGateOperatorApproval {
  readonly approvalStatus: ApplyGateApprovalStatus;
  readonly approvalScope?: ApplyGateApprovalScope;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly approvalRef: string | null;
  readonly approvalNotes?: string;
}

export type RollbackMode = 'manual-repair-plan' | 'future-automated-rollback';

export interface RollbackPosture {
  readonly rollbackMode: RollbackMode;
  readonly rollbackRef?: string;
  readonly manualRepairOwner: string;
  readonly manualRepairRunbookRef: string;
  readonly knownIrreversibleActions: readonly string[];
  readonly preMutationSnapshotRequired: boolean;
  readonly postMutationValidationRequired: boolean;
}

export interface ApplyGateRequest {
  readonly environment: ApplyGateEnvironment;
  readonly targetTenant: NonProductionTargetDeclaration;
  readonly manifest: ProvisioningManifest;
  readonly proofArtifact: DryRunProofArtifact;
  readonly proofMarkdown: string;
  readonly operatorApproval: ApplyGateOperatorApproval;
  readonly rollbackPosture: RollbackPosture;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly requestRef: string;
  readonly dryRunBaselineRef?: string;
}

export type ApplyGateStatus =
  | 'blocked'
  | 'ready-for-non-production-apply'
  | 'not-executable-in-this-step';

export interface ApplyGateDecision {
  readonly decisionVersion: ApplyGateDecisionVersion;
  readonly ok: boolean;
  readonly status: ApplyGateStatus;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly requiredHumanActions: readonly string[];
  readonly validatedAt: string;
  readonly manifestHash: string;
  readonly proofArtifactHash: string;
  readonly proofMarkdownHash: string;
  readonly nonProductionOnly: true;
  readonly tenantMutationPerformed: false;
  readonly notExecutableReason: string;
}
