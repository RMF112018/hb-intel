/**
 * PCC Buyout Log view-model contract (Phase 3 / Wave 13 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccBuyoutLogViewModel`. The
 * view-model is a discriminated union (`loading` / `error` / `ready`) that
 * mirrors `IPccConstraintsLogViewModel`. Each region carries the data its
 * dedicated card needs without re-walking the read-model.
 *
 * The narrow read-model client interface lists only `getBuyoutLog` so
 * non-api consumers can type the client prop without re-exporting the full
 * `IPccReadModelClient` surface.
 */

import type {
  BuyoutAuditEvent,
  BuyoutBudgetAllocation,
  BuyoutCommitmentLink,
  BuyoutComplianceRequirement,
  BuyoutComplianceRequirementState,
  BuyoutComplianceRequirementType,
  BuyoutEvidenceLink,
  BuyoutHbiEligibilityMarker,
  BuyoutHbiRefusalReason,
  BuyoutLogModuleIdentity,
  BuyoutPackage,
  BuyoutPackageState,
  BuyoutPriorityActionCandidate,
  BuyoutProcurementMilestone,
  BuyoutProcurementMilestoneState,
  BuyoutProcurementMilestoneType,
  BuyoutProcurementRiskLevel,
  BuyoutProjectMemoryContribution,
  BuyoutProjectMemoryKind,
  BuyoutReconciliationIssue,
  BuyoutReconciliationIssueKind,
  BuyoutReconciliationState,
  BuyoutScopeLine,
  BuyoutSourceSystem,
  BuyoutTraceabilityEdgeContribution,
  BuyoutTraceabilityEdgeKind,
  PccBuyoutLogReadModel,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import type { PccCardState } from '../projectHome/shared.js';

// ---------------------------------------------------------------------------
// Narrow read-model client interface — single method
// ---------------------------------------------------------------------------

export interface IPccBuyoutLogReadModelClient {
  getBuyoutLog(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccBuyoutLogReadModel>>;
}

// ---------------------------------------------------------------------------
// Region IDs (tuple drives test scoping; one card per id in the ready path)
// ---------------------------------------------------------------------------

export const PCC_BL_REGION_IDS = [
  'command-center',
  'package-table',
  'budget-vs-commitment',
  'unbought-scope',
  'procore-reconciliation',
  'package-detail',
  'compliance-sdi-bond',
  'procurement-leadtime',
  'evidence-lineage',
  'audit-history',
] as const;
export type PccBlRegionId = (typeof PCC_BL_REGION_IDS)[number];

// ---------------------------------------------------------------------------
// Shared row-level shapes
// ---------------------------------------------------------------------------

export interface IPccBlSourceLineageDisplay {
  readonly sourceSystem: BuyoutSourceSystem;
  readonly sourceSystemLabel: string;
  readonly creationSourceLabel: string;
  readonly sourceObjectId?: string;
  readonly workbookSummary?: string;
  readonly importedAtDisplay?: string;
}

export interface IPccBlSourcePostureViewModel {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidenceLabel: string;
  readonly lastIngestedDisplay: string;
  readonly pendingHumanReviewCount: number;
  readonly captionLine: string;
}

export interface IPccBlEvidenceClassificationCount {
  readonly classification: BuyoutEvidenceLink['classification'];
  readonly classificationLabel: string;
  readonly count: number;
}

// ---------------------------------------------------------------------------
// Region 1 — Buyout Command Center
// ---------------------------------------------------------------------------

export interface IPccBlPackageStateCount {
  readonly state: BuyoutPackageState;
  readonly stateLabel: string;
  readonly count: number;
}

export interface IPccBlExceptionClassificationCount {
  readonly classification: BuyoutPriorityActionCandidate['classification'];
  readonly classificationLabel: string;
  readonly count: number;
}

export interface IPccBlCommandCenterViewModel {
  readonly readOnlyCaption: string;
  readonly noExecutionCaption: string;
  readonly totalPackageCount: number;
  readonly activePackageCount: number;
  readonly blockedPackageCount: number;
  readonly completePackageCount: number;
  readonly criticalExceptionCount: number;
  readonly attentionExceptionCount: number;
  readonly packageStateCounts: readonly IPccBlPackageStateCount[];
  readonly exceptionClassificationCounts: readonly IPccBlExceptionClassificationCount[];
  readonly evidenceClassificationCounts: readonly IPccBlEvidenceClassificationCount[];
  readonly sourcePosture: IPccBlSourcePostureViewModel;
  readonly latestSnapshotDisplay?: string;
  readonly boundaryCaption: string;
}

// ---------------------------------------------------------------------------
// Region 2 — Buyout Package Table
// ---------------------------------------------------------------------------

export interface IPccBlPackageRow {
  readonly id: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly status: BuyoutPackageState;
  readonly statusLabel: string;
  readonly statusToneKey: PccBlStatusToneKey;
  readonly vendorDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly leadTimeDaysDisplay?: string;
  readonly awardAmountDisplay?: string;
  readonly currentBudgetDisplay?: string;
  readonly procoreCommitmentDisplay?: string;
  readonly evidenceLinkCount: number;
  readonly hasReconciliationIssue: boolean;
  readonly hasComplianceHold: boolean;
  readonly sourceLineageDisplay: IPccBlSourceLineageDisplay;
}

export interface IPccBlPackageTableViewModel {
  readonly rows: readonly IPccBlPackageRow[];
  readonly totalCount: number;
  readonly emptyCaption: string;
  readonly definitionsCaption: string;
}

// ---------------------------------------------------------------------------
// Region 3 — Budget vs Commitment Matrix
// ---------------------------------------------------------------------------

export interface IPccBlBudgetMatrixRow {
  readonly id: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly originalBudgetDisplay?: string;
  readonly currentBudgetDisplay?: string;
  readonly awardAmountDisplay?: string;
  readonly procoreCommitmentDisplay?: string;
  readonly sageCommittedDisplay?: string;
  readonly varianceDisplay?: string;
  readonly varianceToneKey: PccBlVarianceToneKey;
  readonly mappingStatusLabel: string;
  readonly reconciliationStateLabel: string;
}

export interface IPccBlBudgetVsCommitmentViewModel {
  readonly rows: readonly IPccBlBudgetMatrixRow[];
  readonly totalAwardAmountDisplay?: string;
  readonly totalCurrentBudgetDisplay?: string;
  readonly totalProcoreCommitmentDisplay?: string;
  readonly emptyCaption: string;
  readonly definitionsCaption: string;
}

// ---------------------------------------------------------------------------
// Region 4 — Unbought Scope Queue
// ---------------------------------------------------------------------------

export interface IPccBlUnboughtScopeRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly description: string;
  readonly scopeStatus: BuyoutScopeLine['scopeStatus'];
  readonly scopeStatusLabel: string;
  readonly quantityDisplay?: string;
  readonly sourceLineageDisplay: IPccBlSourceLineageDisplay;
}

export interface IPccBlUnboughtScopeQueueViewModel {
  readonly rows: readonly IPccBlUnboughtScopeRow[];
  readonly partialCount: number;
  readonly uncoveredCount: number;
  readonly emptyCaption: string;
  readonly definitionsCaption: string;
}

// ---------------------------------------------------------------------------
// Region 5 — Procore Reconciliation View
// ---------------------------------------------------------------------------

export interface IPccBlReconciliationIssueRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly kind: BuyoutReconciliationIssueKind;
  readonly kindLabel: string;
  readonly detail: string;
  readonly openedAtDisplay: string;
  readonly resolvedAtDisplay?: string;
  readonly resolutionRationale?: string;
}

export interface IPccBlReconciliationCommitmentRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly procoreCommitmentNumber?: string;
  readonly procoreCompanyId?: string;
  readonly currentCommitmentDisplay?: string;
  readonly originalCommitmentDisplay?: string;
  readonly reconciliationStatus: BuyoutReconciliationState;
  readonly reconciliationStatusLabel: string;
}

export interface IPccBlProcoreReconciliationViewModel {
  readonly issues: readonly IPccBlReconciliationIssueRow[];
  readonly commitmentLinks: readonly IPccBlReconciliationCommitmentRow[];
  readonly openIssueCount: number;
  readonly resolvedIssueCount: number;
  readonly boundaryCaption: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Region 6 — Buyout Package Detail Panel
// ---------------------------------------------------------------------------

export interface IPccBlPackageScopeLineDetail {
  readonly id: string;
  readonly description: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly scopeStatusLabel: string;
  readonly quantityDisplay?: string;
}

export interface IPccBlPackageBudgetAllocationDetail {
  readonly id: string;
  readonly costCode: string;
  readonly costType: string;
  readonly budgetCode: string;
  readonly allocationAmountDisplay: string;
  readonly allocationPercentDisplay: string;
  readonly mappingStatusLabel: string;
  readonly mappingConfidenceLabel: string;
  readonly sourceSystemLabel: string;
}

export interface IPccBlPackageCommitmentDetail {
  readonly id: string;
  readonly procoreCommitmentNumber?: string;
  readonly currentCommitmentDisplay?: string;
  readonly originalCommitmentDisplay?: string;
  readonly reconciliationStatusLabel: string;
}

export interface IPccBlPackageEvidenceDetail {
  readonly id: string;
  readonly label: string;
  readonly classificationLabel: string;
  readonly sharepointReferenceId: string;
  readonly addedAtDisplay: string;
}

export interface IPccBlPackageAuditDetail {
  readonly eventId: string;
  readonly eventTypeLabel: string;
  readonly occurredAtDisplay: string;
  readonly summary: string;
}

export interface IPccBlPackageDetailEntry {
  readonly id: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly statusLabel: string;
  readonly statusToneKey: PccBlStatusToneKey;
  readonly scopeDescription: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly vendorDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly awardAmountDisplay?: string;
  readonly originalBudgetDisplay?: string;
  readonly currentBudgetDisplay?: string;
  readonly procoreCommitmentDisplay?: string;
  readonly sageCommittedDisplay?: string;
  readonly leadTimeDaysDisplay?: string;
  readonly leadTimeNotes?: string;
  readonly loiSendTargetDateDisplay?: string;
  readonly loiExecutedDateDisplay?: string;
  readonly sdiEnrollmentLabel: string;
  readonly bondRequirementLabel: string;
  readonly blockReason?: string;
  readonly deferredUntilDisplay?: string;
  readonly comments?: string;
  readonly sourceLineageDisplay: IPccBlSourceLineageDisplay;
  readonly scopeLines: readonly IPccBlPackageScopeLineDetail[];
  readonly budgetAllocations: readonly IPccBlPackageBudgetAllocationDetail[];
  readonly commitmentLinks: readonly IPccBlPackageCommitmentDetail[];
  readonly evidenceLinks: readonly IPccBlPackageEvidenceDetail[];
  readonly auditTrail: readonly IPccBlPackageAuditDetail[];
  readonly priorityActionCandidates: readonly IPccBlPackagePriorityActionDetail[];
  readonly hbiEligibilityNotice: IPccBlHbiEligibilityNotice;
  readonly boundaryCaption: string;
}

export interface IPccBlPackagePriorityActionDetail {
  readonly id: string;
  readonly reasonCodeLabel: string;
  readonly classificationLabel: string;
  readonly severityLabel: string;
  readonly severityToneKey: PccBlStatusToneKey;
  readonly generatedAtDisplay: string;
}

export interface IPccBlPackageDetailViewModel {
  readonly entries: ReadonlyMap<string, IPccBlPackageDetailEntry>;
  readonly defaultEntryId?: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Region 7 — Compliance / SDI / Bond
// ---------------------------------------------------------------------------

export interface IPccBlComplianceRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly requirementType: BuyoutComplianceRequirementType;
  readonly requirementTypeLabel: string;
  readonly status: BuyoutComplianceRequirementState;
  readonly statusLabel: string;
  readonly statusToneKey: PccBlStatusToneKey;
  readonly required: boolean;
  readonly waiverRequired: boolean;
  readonly waiverReason?: string;
  readonly dueDateDisplay?: string;
  readonly receivedDateDisplay?: string;
  readonly expirationDateDisplay?: string;
  readonly evidenceLinkCount: number;
}

export interface IPccBlComplianceGroup {
  readonly requirementType: BuyoutComplianceRequirementType;
  readonly requirementTypeLabel: string;
  readonly rows: readonly IPccBlComplianceRow[];
}

export interface IPccBlComplianceSdiBondViewModel {
  readonly groups: readonly IPccBlComplianceGroup[];
  readonly totalCount: number;
  readonly nonCompliantCount: number;
  readonly waivedCount: number;
  readonly emptyCaption: string;
  readonly boundaryCaption: string;
}

// ---------------------------------------------------------------------------
// Region 8 — Procurement / Submittal / Lead-Time
// ---------------------------------------------------------------------------

export interface IPccBlProcurementMilestoneRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly milestoneType: BuyoutProcurementMilestoneType;
  readonly milestoneTypeLabel: string;
  readonly status: BuyoutProcurementMilestoneState;
  readonly statusLabel: string;
  readonly statusToneKey: PccBlStatusToneKey;
  readonly riskLevel: BuyoutProcurementRiskLevel;
  readonly riskLevelLabel: string;
  readonly riskToneKey: PccBlStatusToneKey;
  readonly requiredDateDisplay?: string;
  readonly forecastDateDisplay?: string;
  readonly actualDateDisplay?: string;
  readonly notes?: string;
}

export interface IPccBlProcurementMilestoneGroup {
  readonly milestoneType: BuyoutProcurementMilestoneType;
  readonly milestoneTypeLabel: string;
  readonly rows: readonly IPccBlProcurementMilestoneRow[];
}

export interface IPccBlProcurementLeadTimeViewModel {
  readonly groups: readonly IPccBlProcurementMilestoneGroup[];
  readonly totalCount: number;
  readonly atRiskCount: number;
  readonly overdueCount: number;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Region 9 — Evidence / Source Lineage
// ---------------------------------------------------------------------------

export interface IPccBlEvidenceLineageEvidenceRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode: string;
  readonly label: string;
  readonly classificationLabel: string;
  readonly sharepointReferenceId: string;
  readonly addedAtDisplay: string;
}

export interface IPccBlEvidenceLineagePackageRow {
  readonly id: string;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly sourceLineageDisplay: IPccBlSourceLineageDisplay;
  readonly evidenceLinkCount: number;
}

export interface IPccBlHbiEligibilityNotice {
  readonly eligible: boolean;
  readonly headlineCaption: string;
  readonly citationCaption: string;
  readonly refusalReasons: readonly BuyoutHbiRefusalReason[];
  readonly refusalReasonLabels: readonly string[];
}

export interface IPccBlEvidenceLineageViewModel {
  readonly evidenceRows: readonly IPccBlEvidenceLineageEvidenceRow[];
  readonly packageLineageRows: readonly IPccBlEvidenceLineagePackageRow[];
  readonly evidenceClassificationCounts: readonly IPccBlEvidenceClassificationCount[];
  readonly hbiEligibilitySummary: IPccBlHbiEligibilitySummary;
  readonly boundaryCaption: string;
  readonly emptyCaption: string;
}

export interface IPccBlHbiEligibilitySummary {
  readonly eligibleCount: number;
  readonly ineligibleCount: number;
  readonly headlineCaption: string;
  readonly futureGatedCaption: string;
}

// ---------------------------------------------------------------------------
// Region 10 — Audit History
// ---------------------------------------------------------------------------

export interface IPccBlAuditEventRow {
  readonly eventId: string;
  readonly eventTypeLabel: string;
  readonly occurredAtDisplay: string;
  readonly entityRef: string;
  readonly summary: string;
}

export interface IPccBlProjectMemoryRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode?: string;
  readonly kind: BuyoutProjectMemoryKind;
  readonly kindLabel: string;
  readonly narrative: string;
  readonly recordedAtDisplay: string;
}

export interface IPccBlTraceabilityEdgeRow {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly packageCode?: string;
  readonly fromRef: string;
  readonly toRef: string;
  readonly edgeKind: BuyoutTraceabilityEdgeKind;
  readonly edgeKindLabel: string;
}

export interface IPccBlAuditHistoryViewModel {
  readonly auditEvents: readonly IPccBlAuditEventRow[];
  readonly projectMemoryContributions: readonly IPccBlProjectMemoryRow[];
  readonly traceabilityEdges: readonly IPccBlTraceabilityEdgeRow[];
  readonly projectMemoryCaption: string;
  readonly traceabilityCaption: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Pill tone keys (mapped at render time to existing PccStatusPill tones —
// `info` / `success` / `warning` / `danger` / `neutral`).
// ---------------------------------------------------------------------------

export const PCC_BL_STATUS_TONE_KEYS = ['info', 'success', 'warning', 'danger', 'neutral'] as const;
export type PccBlStatusToneKey = (typeof PCC_BL_STATUS_TONE_KEYS)[number];

export const PCC_BL_VARIANCE_TONE_KEYS = ['neutral', 'success', 'warning', 'danger'] as const;
export type PccBlVarianceToneKey = (typeof PCC_BL_VARIANCE_TONE_KEYS)[number];

// ---------------------------------------------------------------------------
// Discriminated union exported as the surface contract
// ---------------------------------------------------------------------------

export type IPccBuyoutLogViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'ready';
      readonly cardState: PccCardState;
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly moduleIdentity: BuyoutLogModuleIdentity;
      readonly commandCenter: IPccBlCommandCenterViewModel;
      readonly packageTable: IPccBlPackageTableViewModel;
      readonly budgetVsCommitment: IPccBlBudgetVsCommitmentViewModel;
      readonly unboughtScopeQueue: IPccBlUnboughtScopeQueueViewModel;
      readonly procoreReconciliation: IPccBlProcoreReconciliationViewModel;
      readonly packageDetail: IPccBlPackageDetailViewModel;
      readonly compliance: IPccBlComplianceSdiBondViewModel;
      readonly procurementLeadTime: IPccBlProcurementLeadTimeViewModel;
      readonly evidenceLineage: IPccBlEvidenceLineageViewModel;
      readonly auditHistory: IPccBlAuditHistoryViewModel;
    };

// ---------------------------------------------------------------------------
// Re-exported model types for downstream consumers
// ---------------------------------------------------------------------------

export type {
  BuyoutAuditEvent,
  BuyoutBudgetAllocation,
  BuyoutCommitmentLink,
  BuyoutComplianceRequirement,
  BuyoutEvidenceLink,
  BuyoutHbiEligibilityMarker,
  BuyoutPackage,
  BuyoutProcurementMilestone,
  BuyoutProjectMemoryContribution,
  BuyoutReconciliationIssue,
  BuyoutScopeLine,
  BuyoutTraceabilityEdgeContribution,
};
