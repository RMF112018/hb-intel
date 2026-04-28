import type {
  ObjectPlanKey,
  Proof,
  ProvisioningManifest,
  ScanResult,
  SourceCoverage,
} from './provisioning-manifest.js';

/**
 * Version of the dry-run proof artifact envelope itself, evolved
 * independently of the manifest contract version.
 */
export const PROOF_ARTIFACT_VERSION = '0.1.0-dry-run-proof' as const;
export const PROOF_ARTIFACT_KIND = 'project-site-provisioning-dry-run-proof' as const;

/**
 * Hard sentinel that every dry-run proof artifact (JSON envelope and
 * Markdown summary) must carry verbatim. The validator fails any
 * artifact that omits or alters this string.
 */
export const NON_EXECUTION_STATEMENT =
  'This proof artifact is a dry-run planning artifact only. It does not create or modify SharePoint, Graph, PnP, Procore, SPFx, backend, or tenant resources.';

export interface ApprovalState {
  readonly approvalStatus: 'not-requested' | 'pending';
  readonly approvedBy: null;
  readonly approvedAt: null;
  readonly approvalRef: null;
}

export interface ObjectPlanCoverageRow {
  readonly family: ObjectPlanKey;
  readonly status: 'planned' | 'placeholder';
  readonly entryCount: number;
  readonly fieldCount?: number;
  readonly requiredFieldCount?: number;
  readonly optionalFieldCount?: number;
}

export interface OperatorSummarySite {
  readonly url: string | null;
  readonly title: string | null;
  readonly urlStatus: 'derived' | 'placeholder';
  readonly titleStatus: 'derived' | 'placeholder';
  readonly inputProjectNumber: string | null;
  readonly projectBaseNumber: string | null;
  readonly projectBaseNumberNoHyphen: string | null;
}

export interface OperatorSummary {
  readonly site: OperatorSummarySite;
  readonly objectPlanCoverage: readonly ObjectPlanCoverageRow[];
  readonly scans: {
    readonly noSecretScan: ScanResult;
    readonly noProcoreMirrorScan: ScanResult;
    readonly noTenantMutationScan: ScanResult;
  };
  readonly plannedHash: string;
  readonly hashAlgorithm: Proof['hashAlgorithm'];
  readonly sourceCoverage: SourceCoverage;
}

export interface DryRunProofArtifact {
  readonly artifactVersion: typeof PROOF_ARTIFACT_VERSION;
  readonly artifactKind: typeof PROOF_ARTIFACT_KIND;
  readonly artifactId: string;
  readonly createdAt: string;
  readonly sourceCommit?: string;
  readonly dryRunOnly: true;
  readonly tenantMutationAllowed: false;
  readonly approvalState: ApprovalState;
  readonly nonExecutionStatement: string;
  readonly manifest: ProvisioningManifest;
  readonly operatorSummary: OperatorSummary;
  readonly validation: {
    readonly manifestValidationStatus: 'ok' | 'failed';
    readonly errors: readonly string[];
  };
}

export interface CreateDryRunProofArtifactsInput {
  readonly manifest: ProvisioningManifest;
  readonly metadata: {
    readonly artifactId: string;
    readonly createdAt: string;
    readonly sourceCommit?: string;
  };
}

export interface DryRunProofArtifacts {
  readonly artifact: DryRunProofArtifact;
  readonly json: string;
  readonly markdown: string;
}
