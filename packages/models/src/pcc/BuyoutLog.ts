/**
 * PCC Buyout Log — shared model contracts.
 *
 * Phase 3 / Wave 13 / Prompt 02. No runtime behavior, no I/O, no clients,
 * no providers, no external system imports. The module exposes vocabulary
 * tuples (`as const`), record shapes, deterministic pure utilities for
 * lifecycle transitions, completion-gate evaluation, waiver validation,
 * budget-vs-commitment reconciliation, source-lineage requirements, HBI
 * eligibility checks, and a read-model envelope contract. SPFx UI,
 * backend routes, and provider implementations are downstream prompt
 * scope.
 *
 * Authority:
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/README.md
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/reference/02_WAVE_13_REQUIRED_FIELDS_STATUSES_AND_CONTRACTS.md
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/_doc-updates/reference/buyout_module_data_contract.json
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/_doc-updates/reference/buyout_state_machine.json
 *   - docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/_doc-updates/reference/field_mutability_matrix.json
 *   - docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
 *
 * Locked decisions:
 *   - Buyout Log is an MVP Project Readiness workflow module with
 *     Procurement / Project Controls classification and future
 *     Procurement & Buyout Center affinity.
 *   - User-facing module title is "Buyout Log"; subtitle is
 *     "Buyout Control Center". The read-model key registered in
 *     `PccReadModelResponseMap` is `buyout-log`.
 *   - Source-module placement preserved (Prompt 01 audit): registered
 *     against work-center `procurement-and-buyout` AND included in
 *     PROJECT_READINESS_SOURCE_MODULES (already in repo before Wave 13).
 *   - Lifecycle is the 19-state primary path (state machine JSON);
 *     reconciliation status is a separate 8-value vocabulary; completion
 *     gate result is a separate 5-value vocabulary.
 *   - Reference-posture states `procore-commitment-pending` and
 *     `procore-commitment-created` record imported lineage only — no
 *     exported function in this module triggers Procore I/O, writeback,
 *     commitments, POs, subcontracts, SOVs, CCOs, invoices, or payments.
 *
 * Guardrails:
 *   - No legal, claim entitlement, compensability, delay damages,
 *     accounting, or payment determinations.
 *   - No external runtime (Microsoft Graph, SharePoint REST, PnP,
 *     Procore, Sage, Autodesk, Document Crunch, Adobe Sign, DocuSign,
 *     AHJ portals, utility portals, vendor portals).
 *   - No backend write routes, no approval execution (Wave 14 owns
 *     approvals/checkpoints), no evidence binary upload/download/sync.
 *     Evidence is reference-only via Document Control / SharePoint ids.
 *
 * @module pcc/BuyoutLog
 */

import type { PccReadModelSourceStatus } from './PccReadModels.js';
import type { ProjectReadinessConfidenceState } from './ProjectReadinessFramework.js';
import type { PccProjectId } from './types.js';

// ---------------------------------------------------------------------------
// Lifecycle state vocabulary — 19 states from buyout_state_machine.json.
// ---------------------------------------------------------------------------

export const BUYOUT_PACKAGE_STATES = [
  'not-started',
  'scope-defined',
  'bid-coverage-needed',
  'bids-received',
  'leveling',
  'award-recommended',
  'award-approved',
  'loi-pending',
  'loi-executed',
  'contract-drafting',
  'contract-executed',
  // Reference-posture state: imported lineage only; no Procore I/O.
  'procore-commitment-pending',
  // Reference-posture state: imported lineage only; no Procore I/O.
  'procore-commitment-created',
  'compliance-pending',
  'procurement-tracking',
  'complete',
  'blocked',
  'deferred',
  'not-applicable',
] as const;
export type BuyoutPackageState = (typeof BUYOUT_PACKAGE_STATES)[number];

export const BUYOUT_PACKAGE_TERMINAL_STATES = ['complete', 'not-applicable'] as const;
export type BuyoutPackageTerminalState = (typeof BUYOUT_PACKAGE_TERMINAL_STATES)[number];

export const BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES = [
  'procore-commitment-pending',
  'procore-commitment-created',
] as const;
export type BuyoutPackageReferencePostureState =
  (typeof BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES)[number];

const BUYOUT_PACKAGE_ACTIVE_STATES: readonly BuyoutPackageState[] = [
  'not-started',
  'scope-defined',
  'bid-coverage-needed',
  'bids-received',
  'leveling',
  'award-recommended',
  'award-approved',
  'loi-pending',
  'loi-executed',
  'contract-drafting',
  'contract-executed',
  'procore-commitment-pending',
  'procore-commitment-created',
  'compliance-pending',
  'procurement-tracking',
];

export const BUYOUT_PACKAGE_ALLOWED_TRANSITIONS: Readonly<
  Record<BuyoutPackageState, readonly BuyoutPackageState[]>
> = {
  'not-started': ['scope-defined', 'blocked', 'deferred', 'not-applicable'],
  'scope-defined': ['bid-coverage-needed', 'blocked', 'deferred', 'not-applicable'],
  'bid-coverage-needed': ['bids-received', 'blocked', 'deferred', 'not-applicable'],
  'bids-received': ['leveling', 'blocked', 'deferred', 'not-applicable'],
  leveling: ['award-recommended', 'blocked', 'deferred', 'not-applicable'],
  'award-recommended': ['award-approved', 'blocked', 'deferred', 'not-applicable'],
  'award-approved': ['loi-pending', 'blocked', 'deferred', 'not-applicable'],
  'loi-pending': ['loi-executed', 'blocked', 'deferred', 'not-applicable'],
  'loi-executed': ['contract-drafting', 'blocked', 'deferred', 'not-applicable'],
  'contract-drafting': ['contract-executed', 'blocked', 'deferred', 'not-applicable'],
  'contract-executed': [
    'procore-commitment-pending',
    'compliance-pending',
    'blocked',
    'deferred',
    'not-applicable',
  ],
  'procore-commitment-pending': [
    'procore-commitment-created',
    'blocked',
    'deferred',
    'not-applicable',
  ],
  'procore-commitment-created': [
    'compliance-pending',
    'blocked',
    'deferred',
    'not-applicable',
  ],
  'compliance-pending': ['procurement-tracking', 'blocked', 'deferred', 'not-applicable'],
  'procurement-tracking': ['complete', 'blocked', 'deferred', 'not-applicable'],
  blocked: BUYOUT_PACKAGE_ACTIVE_STATES,
  deferred: BUYOUT_PACKAGE_ACTIVE_STATES,
  complete: [],
  'not-applicable': [],
};

// ---------------------------------------------------------------------------
// Reconciliation state vocabulary (separate dimension; lives on
// BudgetAllocation and CommitmentLink, not on BuyoutPackage.status).
// ---------------------------------------------------------------------------

export const BUYOUT_RECONCILIATION_STATES = [
  'not-linked',
  'linked-to-procore',
  'linked-to-sage-reference',
  'budget-under-buyout',
  'budget-over-buyout',
  'pending-review',
  'reconciled',
  'variance-exception',
] as const;
export type BuyoutReconciliationState = (typeof BUYOUT_RECONCILIATION_STATES)[number];

// ---------------------------------------------------------------------------
// Completion gate result vocabulary (overall package readiness summary).
// ---------------------------------------------------------------------------

export const BUYOUT_COMPLETION_GATE_RESULTS = [
  'not-ready',
  'ready-for-award',
  'ready-with-exceptions',
  'blocked',
  'complete',
] as const;
export type BuyoutCompletionGateResult = (typeof BUYOUT_COMPLETION_GATE_RESULTS)[number];

// ---------------------------------------------------------------------------
// Exception reason codes and classifications.
// ---------------------------------------------------------------------------

export const BUYOUT_EXCEPTION_REASON_CODES = [
  'UNBOUGHT_SCOPE',
  'PARTIALLY_BOUGHT_SCOPE',
  'OVER_BUDGET',
  'NO_SELECTED_VENDOR',
  'LOI_NOT_SENT',
  'LOI_NOT_EXECUTED',
  'SUBCONTRACT_NOT_EXECUTED',
  'PROCORE_COMMITMENT_MISSING',
  'PROCORE_AMOUNT_MISMATCH',
  'PROCORE_VENDOR_MISMATCH',
  'BUDGET_CODE_MISMATCH',
  'SAGE_ACCOUNTING_MISMATCH',
  'SDI_MISSING',
  'BOND_MISSING',
  'INSURANCE_NONCOMPLIANT',
  'SUBMITTAL_BLOCKER',
  'LONG_LEAD_RISK',
  'STALE_BIC',
  'NO_OWNER',
  'MISSING_EVIDENCE',
] as const;
export type BuyoutExceptionReasonCode = (typeof BUYOUT_EXCEPTION_REASON_CODES)[number];

export const BUYOUT_EXCEPTION_CLASSIFICATIONS = [
  'readiness-blocker',
  'financial-reconciliation',
  'compliance-risk',
  'procurement-risk',
  'approval-checkpoint',
  'external-system-mapping',
] as const;
export type BuyoutExceptionClassification = (typeof BUYOUT_EXCEPTION_CLASSIFICATIONS)[number];

export const BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE: Readonly<
  Record<BuyoutExceptionReasonCode, BuyoutExceptionClassification>
> = {
  UNBOUGHT_SCOPE: 'readiness-blocker',
  PARTIALLY_BOUGHT_SCOPE: 'readiness-blocker',
  NO_SELECTED_VENDOR: 'readiness-blocker',
  LOI_NOT_SENT: 'readiness-blocker',
  LOI_NOT_EXECUTED: 'readiness-blocker',
  SUBCONTRACT_NOT_EXECUTED: 'readiness-blocker',
  OVER_BUDGET: 'financial-reconciliation',
  PROCORE_AMOUNT_MISMATCH: 'financial-reconciliation',
  BUDGET_CODE_MISMATCH: 'financial-reconciliation',
  SAGE_ACCOUNTING_MISMATCH: 'financial-reconciliation',
  PROCORE_COMMITMENT_MISSING: 'external-system-mapping',
  PROCORE_VENDOR_MISMATCH: 'external-system-mapping',
  MISSING_EVIDENCE: 'external-system-mapping',
  SDI_MISSING: 'compliance-risk',
  BOND_MISSING: 'compliance-risk',
  INSURANCE_NONCOMPLIANT: 'compliance-risk',
  SUBMITTAL_BLOCKER: 'procurement-risk',
  LONG_LEAD_RISK: 'procurement-risk',
  STALE_BIC: 'approval-checkpoint',
  NO_OWNER: 'approval-checkpoint',
};

// ---------------------------------------------------------------------------
// Field mutability classes.
// ---------------------------------------------------------------------------

export const BUYOUT_FIELD_MUTABILITY_CLASSES = [
  'pcc-editable',
  'pcc-editable-with-audit',
  'pcc-editable-with-waiver-audit',
  'pcc-editable-until-source-linked',
  'pcc-system-derived',
  'procore-readonly',
  'sage-readonly',
  'sharepoint-reference',
  'calculated-readonly',
  'template-source',
  'admin-only',
] as const;
export type BuyoutFieldMutabilityClass = (typeof BUYOUT_FIELD_MUTABILITY_CLASSES)[number];

// ---------------------------------------------------------------------------
// Source systems and other vocabularies.
// ---------------------------------------------------------------------------

export const BUYOUT_SOURCE_SYSTEMS = [
  'pcc',
  'procore',
  'sage',
  'workbook-template',
  'sharepoint',
  'derived',
] as const;
export type BuyoutSourceSystem = (typeof BUYOUT_SOURCE_SYSTEMS)[number];

export const BUYOUT_RECORD_CREATION_SOURCES = [
  'workbook-seed',
  'manual-pcc',
  'procore-budget-line',
  'procore-commitment-gap',
  'estimate-handoff',
  'bid-leveling-import-future',
] as const;
export type BuyoutRecordCreationSource = (typeof BUYOUT_RECORD_CREATION_SOURCES)[number];

export const BUYOUT_COMPLIANCE_REQUIREMENT_TYPES = [
  'sdi',
  'bond',
  'insurance',
  'lien-waiver',
  'prequalification',
  'license',
  'w9',
] as const;
export type BuyoutComplianceRequirementType =
  (typeof BUYOUT_COMPLIANCE_REQUIREMENT_TYPES)[number];

export const BUYOUT_COMPLIANCE_REQUIREMENT_STATES = [
  'not-required',
  'pending',
  'received',
  'satisfied',
  'waived',
  'expired',
  'non-compliant',
] as const;
export type BuyoutComplianceRequirementState =
  (typeof BUYOUT_COMPLIANCE_REQUIREMENT_STATES)[number];

export const BUYOUT_PROCUREMENT_MILESTONE_TYPES = [
  'procurement',
  'submittal',
  'lead-time',
  'required-on-job',
  'delivery',
  'order-by',
] as const;
export type BuyoutProcurementMilestoneType =
  (typeof BUYOUT_PROCUREMENT_MILESTONE_TYPES)[number];

export const BUYOUT_PROCUREMENT_MILESTONE_STATES = [
  'pending',
  'on-track',
  'at-risk',
  'overdue',
  'complete',
] as const;
export type BuyoutProcurementMilestoneState =
  (typeof BUYOUT_PROCUREMENT_MILESTONE_STATES)[number];

export const BUYOUT_PROCUREMENT_RISK_LEVELS = ['green', 'yellow', 'red', 'critical'] as const;
export type BuyoutProcurementRiskLevel = (typeof BUYOUT_PROCUREMENT_RISK_LEVELS)[number];

export const BUYOUT_RECONCILIATION_ISSUE_KINDS = [
  'amount-mismatch',
  'vendor-mismatch',
  'budget-code-mismatch',
  'sage-accounting-mismatch',
] as const;
export type BuyoutReconciliationIssueKind = (typeof BUYOUT_RECONCILIATION_ISSUE_KINDS)[number];

export const BUYOUT_AUDIT_EVENT_TYPES = [
  'package-recorded',
  'package-updated',
  'state-transitioned',
  'evidence-link-viewed',
  'source-link-launched',
  'exception-recorded',
  'waiver-recorded',
  'reconciliation-resolved',
  'snapshot-generated',
] as const;
export type BuyoutAuditEventType = (typeof BUYOUT_AUDIT_EVENT_TYPES)[number];

export const BUYOUT_HBI_REFUSAL_REASONS = [
  'missing-source-lineage',
  'missing-evidence-link',
  'permission-blocked',
] as const;
export type BuyoutHbiRefusalReason = (typeof BUYOUT_HBI_REFUSAL_REASONS)[number];

export const BUYOUT_PROJECT_MEMORY_KINDS = [
  'buyout-decision',
  'scope-gap-resolution',
  'waiver-rationale',
  'vendor-selection-rationale',
] as const;
export type BuyoutProjectMemoryKind = (typeof BUYOUT_PROJECT_MEMORY_KINDS)[number];

export const BUYOUT_TRACEABILITY_EDGE_KINDS = [
  'cost-code-to-package',
  'package-to-commitment',
  'commitment-to-evidence',
  'evidence-to-readiness-gate',
] as const;
export type BuyoutTraceabilityEdgeKind = (typeof BUYOUT_TRACEABILITY_EDGE_KINDS)[number];

// ---------------------------------------------------------------------------
// Workbook source lineage and reference seams.
// ---------------------------------------------------------------------------

export interface IBuyoutWorkbookSourceRef {
  readonly workbook: string;
  readonly sheetSection: string;
  readonly rowReference: string;
  readonly importedAtUtc?: string;
}

export interface BuyoutSourceLineage {
  readonly sourceSystem: BuyoutSourceSystem;
  readonly creationSource: BuyoutRecordCreationSource;
  readonly sourceObjectId?: string;
  readonly workbookRef?: IBuyoutWorkbookSourceRef;
  readonly importedAtUtc?: string;
}

export interface BuyoutReferenceSeams {
  readonly priorityActionsCandidateRef?: string;
  readonly documentControlEvidenceRefs?: readonly string[];
  readonly lifecycleReadinessGateRef?: string;
  readonly projectMemoryContributionRefs?: readonly string[];
  readonly traceabilityEdgeRefs?: readonly string[];
  readonly responsibilityRoleRef?: string;
  readonly wave14ApprovalCheckpointRef?: string;
  readonly externalSystemReferenceRef?: string;
  readonly projectReadinessSourceModuleRef: 'buyout-log';
}

// ---------------------------------------------------------------------------
// Child record interfaces.
// ---------------------------------------------------------------------------

export interface BuyoutScopeLine {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly description: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly scopeStatus: 'covered' | 'partial' | 'uncovered';
  readonly sourceLineage: BuyoutSourceLineage;
}

export interface BuyoutBudgetAllocation {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly sourceSystem: BuyoutSourceSystem;
  readonly sourceObjectId: string;
  readonly costCode: string;
  readonly costType: string;
  readonly budgetCode: string;
  readonly allocationAmount: number;
  readonly allocationPercent: number;
  readonly allocationBasis: string;
  readonly mappingConfidence: 'high' | 'medium' | 'low';
  readonly mappingStatus: 'linked' | 'candidate' | 'conflicted' | 'unresolved';
}

export interface BuyoutCommitmentLink {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly sourceSystem: 'procore';
  readonly procoreCommitmentId?: string;
  readonly procoreCommitmentNumber?: string;
  readonly procoreCommitmentSovLineId?: string;
  readonly procoreCompanyId?: string;
  readonly procoreCurrentCommitmentAmount?: number;
  readonly procoreOriginalCommitmentAmount?: number;
  readonly sourceLineageId: string;
  readonly reconciliationStatus: BuyoutReconciliationState;
}

export interface BuyoutComplianceRequirement {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly requirementType: BuyoutComplianceRequirementType;
  readonly required: boolean;
  readonly status: BuyoutComplianceRequirementState;
  readonly dueDate?: string;
  readonly receivedDate?: string;
  readonly expirationDate?: string;
  readonly waiverRequired: boolean;
  readonly waiverReason?: string;
  readonly waiverApprovedBy?: string;
  readonly waiverApprovedAtUtc?: string;
  readonly evidenceLinkIds: readonly string[];
  readonly sourceSystem: BuyoutSourceSystem;
  readonly sourceLineageId: string;
}

export interface BuyoutProcurementMilestone {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly milestoneType: BuyoutProcurementMilestoneType;
  readonly requiredDate?: string;
  readonly forecastDate?: string;
  readonly actualDate?: string;
  readonly status: BuyoutProcurementMilestoneState;
  readonly sourceSystem: BuyoutSourceSystem;
  readonly sourceLineageId: string;
  readonly scheduleActivityId?: string;
  readonly procoreSubmittalId?: string;
  readonly riskLevel: BuyoutProcurementRiskLevel;
  readonly notes?: string;
}

export interface BuyoutEvidenceLink {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly label: string;
  readonly classification:
    | 'loi'
    | 'subcontract'
    | 'insurance'
    | 'bond'
    | 'sdi'
    | 'lien-waiver'
    | 'submittal'
    | 'pricing'
    | 'general';
  readonly sharepointReferenceId: string;
  readonly addedAtUtc: string;
  readonly addedByPersonRef: string;
}

export interface BuyoutReconciliationIssue {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly kind: BuyoutReconciliationIssueKind;
  readonly detail: string;
  readonly openedAtUtc: string;
  readonly resolvedAtUtc?: string;
  readonly resolutionRationale?: string;
}

export interface BuyoutAuditEvent {
  readonly eventId: string;
  readonly eventType: BuyoutAuditEventType;
  readonly occurredAtUtc: string;
  readonly entityRef: string;
  readonly summary: string;
}

export interface BuyoutPriorityActionCandidate {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly reasonCode: BuyoutExceptionReasonCode;
  readonly classification: BuyoutExceptionClassification;
  readonly severity: 'info' | 'attention' | 'critical';
  readonly generatedAtUtc: string;
  readonly dedupeKey: string;
}

export interface BuyoutProjectMemoryContribution {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly kind: BuyoutProjectMemoryKind;
  readonly narrative: string;
  readonly recordedAtUtc: string;
  readonly recordedByPersonRef: string;
  readonly sourceLineageId: string;
}

export interface BuyoutTraceabilityEdgeContribution {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly fromRef: string;
  readonly toRef: string;
  readonly edgeKind: BuyoutTraceabilityEdgeKind;
}

export interface BuyoutHbiEligibilityMarker {
  readonly id: string;
  readonly buyoutPackageId: string;
  readonly eligible: boolean;
  readonly refusalReasons: readonly BuyoutHbiRefusalReason[];
}

// ---------------------------------------------------------------------------
// Primary record.
// ---------------------------------------------------------------------------

export interface BuyoutPackage extends BuyoutReferenceSeams {
  readonly id: string;
  readonly projectId: PccProjectId;
  readonly packageCode: string;
  readonly packageTitle: string;
  readonly scopeDescription: string;
  readonly csiDivision: string;
  readonly costCode: string;
  readonly status: BuyoutPackageState;
  readonly ballInCourtPersonOrRoleRef?: string;
  readonly ballInCourtAssignedAtUtc?: string;
  readonly selectedVendorName?: string;
  readonly procoreCompanyId?: string;
  readonly sageVendorId?: string;
  readonly pccAwardAmount?: number;
  readonly originalBudgetAmount?: number;
  readonly originalBudgetSource?: BuyoutSourceSystem;
  readonly currentBudgetAmount?: number;
  readonly currentBudgetSource?: BuyoutSourceSystem;
  readonly procoreCurrentCommitmentAmount?: number;
  readonly sageCommittedCostAmount?: number;
  readonly loiSendTargetDate?: string;
  readonly loiExecutedDate?: string;
  readonly leadTimeDays?: number;
  readonly leadTimeNotes?: string;
  readonly sdiEnrollmentStatus: 'required' | 'enrolled' | 'not-required' | 'waived';
  readonly bondRequirementStatus: 'required' | 'received' | 'not-required' | 'waived';
  readonly comments?: string;
  readonly sourceLineage: BuyoutSourceLineage;
  readonly deferredUntilUtc?: string;
  readonly blockReason?: string;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
}

// ---------------------------------------------------------------------------
// Field mutability map. Exhaustive over `keyof BuyoutPackage` via
// `satisfies` so a new field cannot be added without classifying it.
// ---------------------------------------------------------------------------

type BuyoutPackageMutabilityMap = Readonly<Record<keyof BuyoutPackage, BuyoutFieldMutabilityClass>>;

export const BUYOUT_FIELD_MUTABILITY = {
  id: 'admin-only',
  projectId: 'admin-only',
  packageCode: 'pcc-editable-with-audit',
  packageTitle: 'pcc-editable-with-audit',
  scopeDescription: 'pcc-editable-with-audit',
  csiDivision: 'pcc-editable-with-audit',
  costCode: 'pcc-editable-with-audit',
  status: 'pcc-editable-with-audit',
  ballInCourtPersonOrRoleRef: 'pcc-editable-with-audit',
  ballInCourtAssignedAtUtc: 'pcc-system-derived',
  selectedVendorName: 'pcc-editable-until-source-linked',
  procoreCompanyId: 'procore-readonly',
  sageVendorId: 'sage-readonly',
  pccAwardAmount: 'pcc-editable-with-audit',
  originalBudgetAmount: 'pcc-editable-with-audit',
  originalBudgetSource: 'pcc-editable-with-audit',
  currentBudgetAmount: 'pcc-editable-with-audit',
  currentBudgetSource: 'pcc-editable-with-audit',
  procoreCurrentCommitmentAmount: 'procore-readonly',
  sageCommittedCostAmount: 'sage-readonly',
  loiSendTargetDate: 'pcc-editable-with-audit',
  loiExecutedDate: 'pcc-editable-with-audit',
  leadTimeDays: 'pcc-editable-with-audit',
  leadTimeNotes: 'pcc-editable-with-audit',
  sdiEnrollmentStatus: 'pcc-editable-with-waiver-audit',
  bondRequirementStatus: 'pcc-editable-with-waiver-audit',
  comments: 'pcc-editable-with-audit',
  sourceLineage: 'admin-only',
  deferredUntilUtc: 'pcc-editable-with-audit',
  blockReason: 'pcc-editable-with-audit',
  createdAtUtc: 'pcc-system-derived',
  updatedAtUtc: 'pcc-system-derived',
  priorityActionsCandidateRef: 'pcc-system-derived',
  documentControlEvidenceRefs: 'sharepoint-reference',
  lifecycleReadinessGateRef: 'pcc-system-derived',
  projectMemoryContributionRefs: 'pcc-system-derived',
  traceabilityEdgeRefs: 'pcc-system-derived',
  responsibilityRoleRef: 'pcc-system-derived',
  wave14ApprovalCheckpointRef: 'pcc-system-derived',
  externalSystemReferenceRef: 'pcc-system-derived',
  projectReadinessSourceModuleRef: 'admin-only',
} as const satisfies BuyoutPackageMutabilityMap;

// ---------------------------------------------------------------------------
// Module identity carried in the read-model envelope.
// ---------------------------------------------------------------------------

export interface BuyoutLogModuleIdentity {
  readonly moduleId: 'buyout-log';
  readonly displayName: 'Buyout Log';
  readonly subtitle: 'Buyout Control Center';
  readonly governance: 'project-readiness';
  readonly workCenterId: 'procurement-and-buyout';
  readonly mvpTier: 'MVP';
  readonly futureAffinityWorkCenter: 'procurement-and-buyout-center';
}

// ---------------------------------------------------------------------------
// Source posture and snapshot.
// ---------------------------------------------------------------------------

export interface BuyoutSourcePosture {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidence?: ProjectReadinessConfidenceState;
  readonly lastIngestedAtUtc?: string;
  readonly pendingHumanReviewCount: number;
}

export interface BuyoutSnapshot {
  readonly snapshotId: string;
  readonly generatedAtUtc: string;
  readonly projectId: PccProjectId;
  readonly readOnly: true;
  readonly summary: string;
  readonly packageCount: number;
  readonly completionGateBreakdown: Readonly<Record<BuyoutCompletionGateResult, number>>;
}

// ---------------------------------------------------------------------------
// Read-model envelope payload registered as `'buyout-log'` in
// `PccReadModelResponseMap`.
// ---------------------------------------------------------------------------

export interface PccBuyoutLogReadModel {
  readonly moduleIdentity: BuyoutLogModuleIdentity;
  readonly packages: readonly BuyoutPackage[];
  readonly scopeLines: readonly BuyoutScopeLine[];
  readonly budgetAllocations: readonly BuyoutBudgetAllocation[];
  readonly commitmentLinks: readonly BuyoutCommitmentLink[];
  readonly complianceRequirements: readonly BuyoutComplianceRequirement[];
  readonly procurementMilestones: readonly BuyoutProcurementMilestone[];
  readonly evidenceLinks: readonly BuyoutEvidenceLink[];
  readonly reconciliationIssues: readonly BuyoutReconciliationIssue[];
  readonly priorityActionCandidates: readonly BuyoutPriorityActionCandidate[];
  readonly auditEvents: readonly BuyoutAuditEvent[];
  readonly projectMemoryContributions: readonly BuyoutProjectMemoryContribution[];
  readonly traceabilityEdgeContributions: readonly BuyoutTraceabilityEdgeContribution[];
  readonly hbiEligibilityMarkers: readonly BuyoutHbiEligibilityMarker[];
  readonly sourcePosture: BuyoutSourcePosture;
  readonly snapshotHistory: readonly BuyoutSnapshot[];
}

// ---------------------------------------------------------------------------
// Pure helpers. No I/O, no side effects, no clock reads. Reference-posture
// states (`procore-commitment-pending`, `procore-commitment-created`)
// surface in transitions and fixtures only — no helper triggers Procore I/O.
// ---------------------------------------------------------------------------

export function isBuyoutPackageTransitionAllowed(
  from: BuyoutPackageState,
  to: BuyoutPackageState,
): boolean {
  return BUYOUT_PACKAGE_ALLOWED_TRANSITIONS[from].includes(to);
}

export interface BuyoutPackageTransitionGuardOptions {
  readonly reason?: string;
  readonly deferredUntilUtc?: string;
}

export function assertBuyoutPackageTransition(
  from: BuyoutPackageState,
  to: BuyoutPackageState,
  opts: BuyoutPackageTransitionGuardOptions = {},
): void {
  if (!isBuyoutPackageTransitionAllowed(from, to)) {
    throw new Error(`buyout package transition not allowed: ${from} -> ${to}`);
  }
  if (to === 'blocked') {
    if (!opts.reason || opts.reason.trim().length === 0) {
      throw new Error('blocked transition requires a reason');
    }
  }
  if (to === 'deferred') {
    if (!opts.reason || opts.reason.trim().length === 0) {
      throw new Error('deferred transition requires a reason');
    }
    if (!opts.deferredUntilUtc || opts.deferredUntilUtc.trim().length === 0) {
      throw new Error('deferred transition requires a deferredUntilUtc date');
    }
  }
}

export interface BuyoutCompletionGateChildren {
  readonly commitmentLinks: readonly BuyoutCommitmentLink[];
  readonly complianceRequirements: readonly BuyoutComplianceRequirement[];
  readonly procurementMilestones: readonly BuyoutProcurementMilestone[];
  readonly evidenceLinks: readonly BuyoutEvidenceLink[];
  readonly reconciliationIssues: readonly BuyoutReconciliationIssue[];
  readonly budgetAllocations: readonly BuyoutBudgetAllocation[];
}

export interface BuyoutCompletionGateOutcome {
  readonly result: BuyoutCompletionGateResult;
  readonly missing: readonly string[];
  readonly hasComplianceHold: boolean;
  readonly hasUnresolvedReconciliation: boolean;
  readonly hasActiveWaivers: boolean;
}

function isComplianceSatisfiedOrWaived(req: BuyoutComplianceRequirement): boolean {
  if (!req.required) return true;
  if (req.status === 'satisfied' || req.status === 'received') return true;
  if (req.status === 'waived') {
    return Boolean(
      req.waiverReason &&
        req.waiverReason.trim().length > 0 &&
        req.waiverApprovedBy &&
        req.waiverApprovedBy.trim().length > 0 &&
        req.waiverApprovedAtUtc &&
        req.waiverApprovedAtUtc.trim().length > 0,
    );
  }
  return false;
}

export function evaluateBuyoutCompletionGate(
  pkg: BuyoutPackage,
  children: BuyoutCompletionGateChildren,
): BuyoutCompletionGateOutcome {
  const missing: string[] = [];

  if (!pkg.selectedVendorName || pkg.selectedVendorName.trim().length === 0) {
    missing.push('selected-vendor');
  }
  if (pkg.pccAwardAmount === undefined) {
    missing.push('award-amount');
  }
  if (
    pkg.loiExecutedDate === undefined &&
    !children.evidenceLinks.some((e) => e.classification === 'loi')
  ) {
    missing.push('loi-execution-or-evidence');
  }
  if (!children.evidenceLinks.some((e) => e.classification === 'subcontract')) {
    missing.push('subcontract-evidence');
  }
  const procoreLinked = children.commitmentLinks.some(
    (link) => link.procoreCommitmentId !== undefined,
  );
  if (
    !procoreLinked &&
    pkg.status !== 'not-applicable' &&
    pkg.status !== 'compliance-pending' &&
    !children.evidenceLinks.some((e) => e.classification === 'general' && e.label.toLowerCase().includes('commitment-not-required'))
  ) {
    missing.push('procore-commitment-or-waiver');
  }
  if (children.budgetAllocations.length === 0) {
    missing.push('budget-allocation');
  }
  if (children.evidenceLinks.length === 0) {
    missing.push('evidence-link');
  }

  const hasComplianceHold = children.complianceRequirements.some(
    (req) => !isComplianceSatisfiedOrWaived(req),
  );
  if (hasComplianceHold) {
    missing.push('compliance');
  }

  const hasUnresolvedReconciliation = children.reconciliationIssues.some(
    (i) => i.resolvedAtUtc === undefined,
  );
  if (hasUnresolvedReconciliation) {
    missing.push('reconciliation');
  }

  if (
    pkg.sourceLineage.sourceSystem === 'procore' ||
    pkg.sourceLineage.sourceSystem === 'sage'
  ) {
    if (!pkg.sourceLineage.sourceObjectId || pkg.sourceLineage.sourceObjectId.length === 0) {
      missing.push('source-lineage');
    }
  }

  const hasActiveWaivers = children.complianceRequirements.some(
    (req) => req.status === 'waived' && req.waiverReason && req.waiverReason.length > 0,
  );

  const result: BuyoutCompletionGateResult = ((): BuyoutCompletionGateResult => {
    if (pkg.status === 'complete' && missing.length === 0) return 'complete';
    if (hasComplianceHold || hasUnresolvedReconciliation) return 'blocked';
    if (missing.length === 0) {
      return hasActiveWaivers ? 'ready-with-exceptions' : 'ready-for-award';
    }
    return 'not-ready';
  })();

  return { result, missing, hasComplianceHold, hasUnresolvedReconciliation, hasActiveWaivers };
}

export function validateBuyoutWaiver(req: BuyoutComplianceRequirement): void {
  if (!req.waiverRequired) return;
  if (!req.waiverReason || req.waiverReason.trim().length === 0) {
    throw new Error('waiver requires a reason');
  }
  if (!req.waiverApprovedBy || req.waiverApprovedBy.trim().length === 0) {
    throw new Error('waiver requires an approver');
  }
  if (!req.waiverApprovedAtUtc || req.waiverApprovedAtUtc.trim().length === 0) {
    throw new Error('waiver requires an approval timestamp');
  }
}

export interface BuyoutReconciliationOptions {
  readonly absoluteToleranceUsd?: number;
  readonly percentTolerance?: number;
}

export interface BuyoutReconciliationOutcome {
  readonly status: BuyoutReconciliationState;
  readonly mismatches: readonly BuyoutReconciliationIssueKind[];
}

const DEFAULT_RECONCILIATION_TOLERANCE_USD = 500;
const DEFAULT_RECONCILIATION_PERCENT = 0.005;

export function reconcileBuyoutAmounts(
  pccAwardAmount: number,
  procoreAmount?: number,
  sageAmount?: number,
  opts: BuyoutReconciliationOptions = {},
): BuyoutReconciliationOutcome {
  const absoluteTolerance = opts.absoluteToleranceUsd ?? DEFAULT_RECONCILIATION_TOLERANCE_USD;
  const percentTolerance = opts.percentTolerance ?? DEFAULT_RECONCILIATION_PERCENT;
  const mismatches: BuyoutReconciliationIssueKind[] = [];

  if (procoreAmount !== undefined) {
    const diff = Math.abs(pccAwardAmount - procoreAmount);
    const pct = pccAwardAmount === 0 ? Infinity : diff / Math.abs(pccAwardAmount);
    const operationalLimit = Math.min(absoluteTolerance, Math.abs(pccAwardAmount) * percentTolerance);
    if (diff > operationalLimit) {
      mismatches.push('amount-mismatch');
    } else if (pct > percentTolerance && diff > absoluteTolerance) {
      mismatches.push('amount-mismatch');
    }
  }

  if (sageAmount !== undefined) {
    if (Math.abs(pccAwardAmount - sageAmount) > 0) {
      mismatches.push('sage-accounting-mismatch');
    }
  }

  const status: BuyoutReconciliationState = ((): BuyoutReconciliationState => {
    if (mismatches.length > 0) return 'variance-exception';
    if (procoreAmount !== undefined) return 'reconciled';
    if (sageAmount !== undefined) return 'linked-to-sage-reference';
    return 'not-linked';
  })();
  return { status, mismatches };
}

export function requireBuyoutSourceLineage(pkg: BuyoutPackage): void {
  if (!pkg.sourceLineage || !pkg.sourceLineage.sourceSystem) {
    throw new Error('source lineage missing sourceSystem');
  }
  const system = pkg.sourceLineage.sourceSystem;
  if (system === 'procore' || system === 'sage') {
    if (
      !pkg.sourceLineage.sourceObjectId ||
      pkg.sourceLineage.sourceObjectId.trim().length === 0
    ) {
      throw new Error(
        `source lineage for ${system} requires sourceObjectId`,
      );
    }
  }
  if (system === 'workbook-template') {
    if (!pkg.sourceLineage.workbookRef) {
      throw new Error('source lineage for workbook-template requires workbookRef');
    }
  }
}

export interface BuyoutHbiEligibilityResult {
  readonly eligible: boolean;
  readonly refusalReasons: readonly BuyoutHbiRefusalReason[];
}

export function isBuyoutHbiEligible(
  pkg: BuyoutPackage,
  evidenceLinks: readonly BuyoutEvidenceLink[],
  viewerPersonaPermissionOk: boolean,
): BuyoutHbiEligibilityResult {
  const refusalReasons: BuyoutHbiRefusalReason[] = [];
  const lineageOk =
    pkg.sourceLineage &&
    pkg.sourceLineage.sourceSystem !== undefined &&
    !(
      (pkg.sourceLineage.sourceSystem === 'procore' ||
        pkg.sourceLineage.sourceSystem === 'sage') &&
      (!pkg.sourceLineage.sourceObjectId ||
        pkg.sourceLineage.sourceObjectId.trim().length === 0)
    );
  if (!lineageOk) refusalReasons.push('missing-source-lineage');
  const evidenceForPackage = evidenceLinks.filter((e) => e.buyoutPackageId === pkg.id);
  if (evidenceForPackage.length === 0) refusalReasons.push('missing-evidence-link');
  if (!viewerPersonaPermissionOk) refusalReasons.push('permission-blocked');
  return { eligible: refusalReasons.length === 0, refusalReasons };
}

export function buyoutPriorityActionDedupeKey(
  projectId: PccProjectId,
  buyoutPackageId: string,
  reasonCode: BuyoutExceptionReasonCode,
): string {
  return `${projectId}:${buyoutPackageId}:${reasonCode}`;
}

// `'buyout-log'` is registered in `PccReadModelResponseMap` (see
// `PccReadModels.ts`). The model contract here is read-only-by-design;
// no provider, no client, no live URLs.
