/**
 * P3-E9-T02 reports contracts TypeScript contracts.
 * Runtime model, project registrations, run records, governance policy.
 */

import type { ReportFamilyKey, PerReleaseAuthority } from '../foundation/enums.js';
import type { ReportRunType, ReportRunStatus } from '../run-ledger/enums.js';
import type {
  ConfigVersionState,
  InternalReviewChainStatus,
  ReleaseClass,
  ReportSectionContentType,
  ReportValidationRule,
  TemplatePromotionStatus,
} from './enums.js';

// -- Section Definition -------------------------------------------------------

export interface IReportSectionDefinition {
  readonly sectionKey: string;
  readonly displayName: string;
  readonly contentType: ReportSectionContentType;
  readonly sourceModuleKey: string | null;
  readonly snapshotApiContractRef: string | null;
  readonly rollupCalculationRef: string | null;
  readonly isNarrativeOverrideable: boolean;
  readonly isRequired: boolean;
  readonly displayOrder: number;
}

// -- Project Family Registration ----------------------------------------------

export interface IProjectFamilyRegistration {
  readonly registrationId: string;
  readonly projectId: string;
  readonly familyKey: ReportFamilyKey;
  readonly isActive: boolean;
  readonly activatedAt: string | null;
  readonly activeConfigVersionId: string | null;
  readonly draftConfigVersionId: string | null;
  readonly promotionStatus: TemplatePromotionStatus;
  readonly createdAt: string;
  readonly createdByUPN: string;
}

// -- Project Section Override -------------------------------------------------

export interface IProjectSectionOverride {
  readonly sectionKey: string;
  readonly isIncluded: boolean;
  readonly displayOrderOverride: number | null;
  readonly narrativeDefaultOverride: string | null;
}

// -- Project Family Config Version --------------------------------------------

export interface IProjectFamilyConfigVersion {
  readonly configVersionId: string;
  readonly projectId: string;
  readonly familyKey: ReportFamilyKey;
  readonly state: ConfigVersionState;
  readonly selectedReleaseClass: ReleaseClass;
  readonly selectedAudienceClasses: readonly string[];
  readonly sectionOverrides: readonly IProjectSectionOverride[];
  readonly narrativeDefaults: readonly string[];
  readonly structuralChanges: readonly string[];
  readonly submittedForActivationAt: string | null;
  readonly activatedAt: string | null;
  readonly version: number;
}

// -- Snapshot Ref -------------------------------------------------------------

export interface ISnapshotRef {
  readonly sourceModule: string;
  readonly snapshotId: string;
  readonly snapshotVersion: string;
  readonly capturedAt: string;
  readonly confirmedAt: string | null;
}

// -- Module Snapshot ----------------------------------------------------------

export interface IModuleSnapshot {
  readonly snapshotId: string;
  readonly sourceModule: string;
  readonly projectId: string;
  readonly snapshotVersion: string;
  readonly capturedAt: string;
  readonly confirmedAt: string | null;
  readonly dataPayload: string;
  readonly schemaRef: string;
}

// -- Report Approval ----------------------------------------------------------

export interface IReportApproval {
  readonly approvedByUPN: string;
  readonly approvedAt: string;
  readonly comments: string | null;
  readonly internalReviewChainRef: string | null;
}

// -- External Recipient -------------------------------------------------------

export interface IExternalRecipient {
  readonly name: string;
  readonly organization: string;
  readonly email: string;
  readonly role: string;
}

// -- Report Release -----------------------------------------------------------

export interface IReportRelease {
  readonly releasedByUPN: string;
  readonly releasedAt: string;
  readonly releaseClass: ReleaseClass;
  readonly audienceClasses: readonly string[];
  readonly distributionNotes: string | null;
  readonly externalRecipients: readonly IExternalRecipient[];
}

// -- Internal Review Chain State ----------------------------------------------

export interface IInternalReviewChainState {
  readonly chainId: string;
  readonly runId: string;
  readonly status: InternalReviewChainStatus;
  readonly submittedByPM_UPN: string;
  readonly submittedAt: string;
  readonly reviewedByPE_UPN: string | null;
  readonly reviewedAt: string | null;
  readonly returnReason: string | null;
  readonly completedAt: string | null;
}

// -- Report Run Record --------------------------------------------------------

export interface IReportRunRecord {
  readonly runId: string;
  readonly projectId: string;
  readonly familyKey: ReportFamilyKey;
  readonly runType: ReportRunType;
  readonly status: ReportRunStatus;
  readonly configVersionId: string;
  readonly snapshotRefs: readonly ISnapshotRef[];
  readonly generatedByUPN: string;
  readonly generatedAt: string;
  readonly queuedAt: string;
  readonly artifactUrl: string | null;
  readonly approvalMetadata: IReportApproval | null;
  readonly releaseMetadata: IReportRelease | null;
  readonly internalReviewChain: IInternalReviewChainState | null;
  readonly failureReason: string | null;
  readonly annotationArtifactRef: string | null;
  readonly archivedAt: string | null;
}

// -- Project Governance Policy Record -----------------------------------------

export interface IProjectGovernancePolicyRecord {
  readonly policyId: string;
  readonly projectId: string;
  readonly globalFloor: readonly string[];
  readonly projectOverlay: readonly string[];
  readonly effectivePolicy: readonly string[];
  readonly version: number;
  readonly lastUpdatedAt: string;
  readonly lastUpdatedByUPN: string;
}

// -- Report Family Policy -----------------------------------------------------

export interface IReportFamilyPolicy {
  readonly familyKey: ReportFamilyKey;
  readonly projectId: string;
  readonly effectivePerReleaseAuthority: PerReleaseAuthority;
  readonly effectiveStalenessThresholdDays: number;
  readonly effectiveAllowedReleaseClasses: readonly ReleaseClass[];
  readonly requiresInternalReviewChain: boolean;
  readonly bypassInternalReviewChain: boolean;
}

// -- Report Validation Rule Definition ----------------------------------------

export interface IReportValidationRuleDef {
  readonly rule: ReportValidationRule;
  readonly description: string;
  readonly enforcement: string;
}
