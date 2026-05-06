/**
 * PCC Buyout Log read-model adapter (Phase 3 / Wave 13 / Prompt 05).
 *
 * Pure mapping layer. Converts a `PccBuyoutLogReadModel` envelope into a
 * stable ten-region view-model. No React, no hooks, no fetch, no client
 * calls, no clock reads.
 *
 * The adapter returns `status: 'ready'` for `available`,
 * `source-unavailable`, and `backend-unavailable` envelopes; degraded
 * envelopes are reflected in `cardState` and `sourceStatus`. The hook
 * (`useBuyoutLogReadModel`) owns `loading` and `error`.
 *
 * No legal, claim entitlement, compensability, accounting, or payment
 * determination is performed. Procore commitment state and Sage committed
 * cost state are surfaced as imported-lineage-only references; the
 * adapter does not call any external system.
 */

import {
  BUYOUT_PACKAGE_STATES,
  type BuyoutAuditEvent,
  type BuyoutAuditEventType,
  type BuyoutBudgetAllocation,
  type BuyoutCommitmentLink,
  type BuyoutComplianceRequirement,
  type BuyoutComplianceRequirementState,
  type BuyoutComplianceRequirementType,
  type BuyoutEvidenceLink,
  type BuyoutHbiEligibilityMarker,
  type BuyoutHbiRefusalReason,
  type BuyoutPackage,
  type BuyoutPackageState,
  type BuyoutPriorityActionCandidate,
  type BuyoutProcurementMilestone,
  type BuyoutProcurementMilestoneState,
  type BuyoutProcurementMilestoneType,
  type BuyoutProcurementRiskLevel,
  type BuyoutProjectMemoryContribution,
  type BuyoutProjectMemoryKind,
  type BuyoutReconciliationIssue,
  type BuyoutReconciliationIssueKind,
  type BuyoutReconciliationState,
  type BuyoutReferenceSeams,
  type BuyoutScopeLine,
  type BuyoutSourceLineage,
  type BuyoutSourceSystem,
  type BuyoutTraceabilityEdgeContribution,
  type BuyoutTraceabilityEdgeKind,
  type PccBuyoutLogReadModel,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';
import type { PccCardState } from '../projectHome/shared.js';
import {
  PCC_BL_BOUNDARY_KEYS,
  PCC_BL_INTEGRATION_TARGET_IDS,
  type IPccBlAuditEventRow,
  type IPccBlAuditHistoryViewModel,
  type IPccBlBoundaryNotice,
  type IPccBlBudgetMatrixRow,
  type IPccBlBudgetVsCommitmentViewModel,
  type IPccBlCommandCenterViewModel,
  type IPccBlComplianceGroup,
  type IPccBlComplianceRow,
  type IPccBlComplianceSdiBondViewModel,
  type IPccBlEvidenceClassificationCount,
  type IPccBlEvidenceLineageEvidenceRow,
  type IPccBlEvidenceLineagePackageRow,
  type IPccBlEvidenceLineageViewModel,
  type IPccBlExceptionClassificationCount,
  type IPccBlHbiEligibilityNotice,
  type IPccBlHbiEligibilitySummary,
  type IPccBlIntegrationPostureRow,
  type IPccBlPackageBudgetAllocationDetail,
  type IPccBlPackageCommitmentDetail,
  type IPccBlPackageDetailEntry,
  type IPccBlPackageDetailViewModel,
  type IPccBlPackageEvidenceDetail,
  type IPccBlPackagePriorityActionDetail,
  type IPccBlPackageRow,
  type IPccBlPackageScopeLineDetail,
  type IPccBlPackageStateCount,
  type IPccBlPackageTableViewModel,
  type IPccBlProcoreReconciliationViewModel,
  type IPccBlProcurementLeadTimeViewModel,
  type IPccBlProcurementMilestoneGroup,
  type IPccBlProcurementMilestoneRow,
  type IPccBlProjectMemoryRow,
  type IPccBlReconciliationCommitmentRow,
  type IPccBlReconciliationIssueRow,
  type IPccBlReferenceSeamRow,
  type IPccBlSourceLineageDisplay,
  type IPccBlSourcePostureViewModel,
  type IPccBlTraceabilityEdgeRow,
  type IPccBlUnboughtScopeQueueViewModel,
  type IPccBlUnboughtScopeRow,
  type IPccBlPackageAuditDetail,
  type IPccBuyoutLogViewModel,
  type PccBlBoundaryKey,
  type PccBlIntegrationTargetId,
  type PccBlSeamKind,
  type PccBlStatusToneKey,
  type PccBlVarianceToneKey,
} from './buyoutLogViewModel.js';

// ---------------------------------------------------------------------------
// Canonical copy
// ---------------------------------------------------------------------------

const READ_ONLY_CAPTION = 'Buyout Log';
const NO_EXECUTION_CAPTION =
  'Commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, payments, approvals, and external-system writebacks are managed by your PCC administrator. Local UI selection only.';
const PACKAGE_TABLE_DEFINITIONS_CAPTION =
  'All Buyout Log records are reference-only. Status reflects the recorded lifecycle state; Procore and Sage references are imported lineage only.';
const BUDGET_DEFINITIONS_CAPTION =
  'Budget, award, and commitment values reflect recorded numbers only. No accounting determination, payment authorization, or commitment creation occurs here.';
const UNBOUGHT_DEFINITIONS_CAPTION =
  'Unbought scope reflects scope-line records flagged "partial" or "uncovered" in the read model. No bid, leveling, or award action is executed here.';
const RECONCILIATION_BOUNDARY_CAPTION =
  'Procore reconciliation issues are reference-only review flags. No Procore call, writeback, or commitment mutation occurs here.';
const COMPLIANCE_BOUNDARY_CAPTION =
  'Compliance, SDI, bond, insurance, lien-waiver, and prequalification states are reference-only. No legal determination, compliance certification, or vendor enrollment is executed here.';
const EVIDENCE_BOUNDARY_CAPTION =
  'Evidence references point to Document Control / SharePoint records only. No evidence binary is owned, uploaded, downloaded, or synced from this surface.';
const PROJECT_MEMORY_CAPTION =
  'Project memory contributions are reference-only narratives — recorded by other surfaces, surfaced here for traceability.';
const TRACEABILITY_CAPTION =
  'Traceability edges are reference-only and surfaced for lineage inspection.';
const HBI_ELIGIBILITY_HEADLINE =
  'HBI grounded answers are future-gated. Citations to recorded buyout fields will be required.';
const HBI_FUTURE_GATED_CAPTION =
  'Eligibility is recorded for future grounded-answer surfaces. No grounded answer, summarization, or generation runs from this surface.';
const PACKAGE_DETAIL_BOUNDARY_CAPTION =
  'Reference-only package detail. No legal, claim entitlement, compensability, delay-damages, accounting, payment, or approval determination is performed here.';

// ---------------------------------------------------------------------------
// Cross-surface integration seams (Wave 13 / Prompt 06).
// All copy stays in "reference only" / "not enabled here" vocabulary so the
// surface advertises its boundary without describing or enabling any
// runtime call, writeback, approval execution, or evidence-binary action.
// ---------------------------------------------------------------------------

const SEAM_KIND_DISPLAY_LABELS: Readonly<Record<PccBlSeamKind, string>> = {
  'priority-actions-candidate': 'Priority Actions candidate',
  'document-control-evidence': 'Document Control evidence reference',
  'lifecycle-readiness-gate': 'Lifecycle Readiness gate',
  'responsibility-role': 'Responsibility role',
  'approval-checkpoint': 'Approval / checkpoint',
  'external-system-launcher': 'External system launcher',
  'project-memory-contribution': 'Project memory contribution',
  'traceability-edge': 'Traceability edge',
  'project-readiness-source-module': 'Project Readiness source module',
};

const SEAM_KIND_REFERENCE_ONLY_LABELS: Readonly<Record<PccBlSeamKind, string>> = {
  'priority-actions-candidate': 'Reference only — Priority Actions queue is not mutated here.',
  'document-control-evidence':
    'Reference only — evidence file ownership stays with Document Control.',
  'lifecycle-readiness-gate':
    'Reference only — lifecycle gate evaluation is owned by the lifecycle readiness surface.',
  'responsibility-role':
    'Reference only — role assignment is owned by the responsibility matrix surface.',
  'approval-checkpoint':
    'Reference only — approval and checkpoint execution is not enabled here; Wave 14 owns it.',
  'external-system-launcher':
    'Reference only — external system launcher; no runtime call is made here.',
  'project-memory-contribution':
    'Reference only — project memory contribution narrative; ownership stays with the project memory surface.',
  'traceability-edge':
    'Reference only — traceability edge is surfaced for lineage inspection only.',
  'project-readiness-source-module':
    'Reference only — declares this package as a Project Readiness source module signal.',
};

const INTEGRATION_POSTURE_ROWS: readonly IPccBlIntegrationPostureRow[] = [
  {
    targetId: 'project-readiness',
    targetLabel: 'Project Readiness Center',
    postureCaption:
      'Reference only — Project Readiness owns the framework view and source-module registry.',
  },
  {
    targetId: 'priority-actions',
    targetLabel: 'Priority Actions',
    postureCaption:
      'Reference only — candidate references; the Priority Actions queue is not mutated here.',
  },
  {
    targetId: 'lifecycle-readiness',
    targetLabel: 'Lifecycle Readiness',
    postureCaption:
      'Reference only — lifecycle gate evaluation is owned by the lifecycle readiness surface.',
  },
  {
    targetId: 'permit-inspection',
    targetLabel: 'Permit & Inspection',
    postureCaption:
      'Reference only — permit and inspection lifecycle is owned by the permit & inspection surface.',
  },
  {
    targetId: 'responsibility-matrix',
    targetLabel: 'Responsibility Matrix',
    postureCaption:
      'Reference only — role assignment is owned by the responsibility matrix surface.',
  },
  {
    targetId: 'constraints-log',
    targetLabel: 'Constraints Log',
    postureCaption:
      'Reference only — make-ready constraints and risks are owned by the constraints log surface.',
  },
  {
    targetId: 'approvals-checkpoints',
    targetLabel: 'Approvals & Checkpoints',
    postureCaption:
      'Reference only — approval and checkpoint execution is not enabled here; Wave 14 owns it.',
  },
  {
    targetId: 'document-control',
    targetLabel: 'Document Control',
    postureCaption: 'Reference only — evidence file ownership stays with Document Control.',
  },
  {
    targetId: 'external-systems',
    targetLabel: 'External Platforms',
    postureCaption:
      'Reference only — external system launchers; no runtime call is made from here to Procore, Sage, or SharePoint.',
  },
  {
    targetId: 'project-memory',
    targetLabel: 'Project Memory',
    postureCaption:
      'Reference only — project memory contribution markers; ownership stays with the project memory surface.',
  },
  {
    targetId: 'traceability',
    targetLabel: 'Traceability',
    postureCaption: 'Reference only — traceability edges surfaced for lineage inspection only.',
  },
];

const BOUNDARY_NOTICE_CAPTIONS: Readonly<Record<PccBlBoundaryKey, string>> = {
  'no-procore-runtime':
    'Procore commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, and payments are not enabled here. Procore commitment state is imported lineage only.',
  'no-sage-accounting':
    'Sage accounting writeback, payment authorization, and accounting determinations are not enabled here. Sage committed cost is imported lineage only.',
  'no-evidence-binary':
    'Evidence binary upload, download, and sync are not enabled here. Evidence references point to Document Control / SharePoint records only.',
  'no-approval-execution':
    'Approval and checkpoint execution is not enabled here. Wave 14 owns approval / checkpoint execution.',
  'no-legal-determination':
    'Legal, claim entitlement, compensability, delay-damages, and forensic schedule-analysis determinations are not enabled here.',
};

function buildBoundaryNotices(): readonly IPccBlBoundaryNotice[] {
  return PCC_BL_BOUNDARY_KEYS.map((key) => ({
    key,
    caption: BOUNDARY_NOTICE_CAPTIONS[key],
  }));
}

function buildIntegrationPosture(): readonly IPccBlIntegrationPostureRow[] {
  // Validate that the registry covers every target id in the canonical
  // tuple. Throws fast in tests if a new target is added without a row.
  const present = new Set(INTEGRATION_POSTURE_ROWS.map((r) => r.targetId));
  for (const targetId of PCC_BL_INTEGRATION_TARGET_IDS) {
    if (!present.has(targetId)) {
      throw new Error(
        `INTEGRATION_POSTURE_ROWS missing entry for target ${targetId satisfies PccBlIntegrationTargetId}`,
      );
    }
  }
  return INTEGRATION_POSTURE_ROWS;
}

function makeSeamRow(seamKind: PccBlSeamKind, reference: string): IPccBlReferenceSeamRow {
  return {
    seamKind,
    label: SEAM_KIND_DISPLAY_LABELS[seamKind],
    reference,
    referenceOnlyLabel: SEAM_KIND_REFERENCE_ONLY_LABELS[seamKind],
  };
}

function buildReferenceSeamRows(seams: BuyoutReferenceSeams): readonly IPccBlReferenceSeamRow[] {
  const rows: IPccBlReferenceSeamRow[] = [];
  if (seams.priorityActionsCandidateRef) {
    rows.push(makeSeamRow('priority-actions-candidate', seams.priorityActionsCandidateRef));
  }
  for (const ref of seams.documentControlEvidenceRefs ?? []) {
    rows.push(makeSeamRow('document-control-evidence', ref));
  }
  if (seams.lifecycleReadinessGateRef) {
    rows.push(makeSeamRow('lifecycle-readiness-gate', seams.lifecycleReadinessGateRef));
  }
  if (seams.responsibilityRoleRef) {
    rows.push(makeSeamRow('responsibility-role', seams.responsibilityRoleRef));
  }
  if (seams.wave14ApprovalCheckpointRef) {
    rows.push(makeSeamRow('approval-checkpoint', seams.wave14ApprovalCheckpointRef));
  }
  if (seams.externalSystemReferenceRef) {
    rows.push(makeSeamRow('external-system-launcher', seams.externalSystemReferenceRef));
  }
  for (const ref of seams.projectMemoryContributionRefs ?? []) {
    rows.push(makeSeamRow('project-memory-contribution', ref));
  }
  for (const ref of seams.traceabilityEdgeRefs ?? []) {
    rows.push(makeSeamRow('traceability-edge', ref));
  }
  // Always-present marker — declares the package as a Project Readiness
  // source module signal.
  rows.push(makeSeamRow('project-readiness-source-module', seams.projectReadinessSourceModuleRef));
  return rows;
}

// ---------------------------------------------------------------------------
// Internal label maps (module-local; tests assert adapter outputs, not the
// internal label-map shape — feedback_test_adapter_output_not_internal_maps).
// ---------------------------------------------------------------------------

const PREVIEW_TO_CARD_STATE: Readonly<Record<PccPreviewStateKind, PccCardState>> = {
  preview: 'preview',
  empty: 'empty',
  loading: 'preview',
  error: 'error',
  'missing-config': 'missing-config',
  'unavailable-fixture': 'unavailable-fixture',
  'unauthorized-persona': 'unauthorized-persona',
  'not-yet-implemented-operation': 'preview',
};

function toCardState(sourceStatus: PccReadModelSourceStatus): PccCardState {
  return PREVIEW_TO_CARD_STATE[mapPccSourceStatusToPreviewState(sourceStatus)];
}

const BUYOUT_PACKAGE_STATE_LABELS: Readonly<Record<BuyoutPackageState, string>> = {
  'not-started': 'Not started',
  'scope-defined': 'Scope defined',
  'bid-coverage-needed': 'Bid coverage needed',
  'bids-received': 'Bids received',
  leveling: 'Leveling',
  'award-recommended': 'Award recommended',
  'award-approved': 'Award approved',
  'loi-pending': 'LOI pending',
  'loi-executed': 'LOI executed',
  'contract-drafting': 'Contract drafting',
  'contract-executed': 'Contract executed',
  'procore-commitment-pending': 'Procore commitment pending (imported lineage)',
  'procore-commitment-created': 'Procore commitment created (imported lineage)',
  'compliance-pending': 'Compliance pending',
  'procurement-tracking': 'Procurement tracking',
  complete: 'Complete',
  blocked: 'Blocked',
  deferred: 'Deferred',
  'not-applicable': 'Not applicable',
};

const COMPLIANCE_REQUIREMENT_TYPE_LABELS: Readonly<
  Record<BuyoutComplianceRequirementType, string>
> = {
  sdi: 'SDI',
  bond: 'Bond',
  insurance: 'Insurance',
  'lien-waiver': 'Lien waiver',
  prequalification: 'Prequalification',
  license: 'License',
  w9: 'W-9',
};

const COMPLIANCE_REQUIREMENT_STATE_LABELS: Readonly<
  Record<BuyoutComplianceRequirementState, string>
> = {
  'not-required': 'Not required',
  pending: 'Pending',
  received: 'Received',
  satisfied: 'Satisfied',
  waived: 'Waived',
  expired: 'Expired',
  'non-compliant': 'Non-compliant',
};

const PROCUREMENT_MILESTONE_TYPE_LABELS: Readonly<Record<BuyoutProcurementMilestoneType, string>> =
  {
    procurement: 'Procurement',
    submittal: 'Submittal',
    'lead-time': 'Lead time',
    'required-on-job': 'Required on job',
    delivery: 'Delivery',
    'order-by': 'Order by',
  };

const PROCUREMENT_MILESTONE_STATE_LABELS: Readonly<
  Record<BuyoutProcurementMilestoneState, string>
> = {
  pending: 'Pending',
  'on-track': 'On track',
  'at-risk': 'At risk',
  overdue: 'Overdue',
  complete: 'Complete',
};

const PROCUREMENT_RISK_LEVEL_LABELS: Readonly<Record<BuyoutProcurementRiskLevel, string>> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
  critical: 'Critical',
};

const RECONCILIATION_STATE_LABELS: Readonly<Record<BuyoutReconciliationState, string>> = {
  'not-linked': 'Not linked',
  'linked-to-procore': 'Linked to Procore',
  'linked-to-sage-reference': 'Linked to Sage reference',
  'budget-under-buyout': 'Budget under buyout',
  'budget-over-buyout': 'Budget over buyout',
  'pending-review': 'Pending review',
  reconciled: 'Reconciled',
  'variance-exception': 'Variance exception',
};

const RECONCILIATION_ISSUE_KIND_LABELS: Readonly<Record<BuyoutReconciliationIssueKind, string>> = {
  'amount-mismatch': 'Amount mismatch',
  'vendor-mismatch': 'Vendor mismatch',
  'budget-code-mismatch': 'Budget-code mismatch',
  'sage-accounting-mismatch': 'Sage accounting mismatch',
};

const SOURCE_SYSTEM_LABELS: Readonly<Record<BuyoutSourceSystem, string>> = {
  pcc: 'PCC (manual)',
  procore: 'Procore (imported)',
  sage: 'Sage (imported)',
  'workbook-template': 'Workbook template',
  sharepoint: 'SharePoint reference',
  derived: 'Derived',
};

const CREATION_SOURCE_LABELS: Readonly<Record<BuyoutSourceLineage['creationSource'], string>> = {
  'workbook-seed': 'Workbook seed',
  'manual-pcc': 'Manual PCC',
  'procore-budget-line': 'Procore budget line',
  'procore-commitment-gap': 'Procore commitment gap',
  'estimate-handoff': 'Estimate handoff',
  'bid-leveling-import-future': 'Bid leveling import (future)',
};

const EVIDENCE_CLASSIFICATION_LABELS: Readonly<
  Record<BuyoutEvidenceLink['classification'], string>
> = {
  loi: 'LOI',
  subcontract: 'Subcontract',
  insurance: 'Insurance',
  bond: 'Bond',
  sdi: 'SDI',
  'lien-waiver': 'Lien waiver',
  submittal: 'Submittal',
  pricing: 'Pricing',
  general: 'General',
};

const AUDIT_EVENT_TYPE_LABELS: Readonly<Record<BuyoutAuditEventType, string>> = {
  'package-recorded': 'Package recorded',
  'package-updated': 'Package updated',
  'state-transitioned': 'State transitioned',
  'evidence-link-viewed': 'Evidence link viewed',
  'source-link-launched': 'Source link launched',
  'exception-recorded': 'Exception recorded',
  'waiver-recorded': 'Waiver recorded',
  'reconciliation-resolved': 'Reconciliation resolved',
  'snapshot-generated': 'Snapshot generated',
};

const PROJECT_MEMORY_KIND_LABELS: Readonly<Record<BuyoutProjectMemoryKind, string>> = {
  'buyout-decision': 'Buyout decision',
  'scope-gap-resolution': 'Scope-gap resolution',
  'waiver-rationale': 'Waiver rationale',
  'vendor-selection-rationale': 'Vendor selection rationale',
};

const TRACEABILITY_EDGE_KIND_LABELS: Readonly<Record<BuyoutTraceabilityEdgeKind, string>> = {
  'cost-code-to-package': 'Cost code → package',
  'package-to-commitment': 'Package → commitment',
  'commitment-to-evidence': 'Commitment → evidence',
  'evidence-to-readiness-gate': 'Evidence → readiness gate',
};

const HBI_REFUSAL_REASON_LABELS: Readonly<Record<BuyoutHbiRefusalReason, string>> = {
  'missing-source-lineage': 'Missing source lineage',
  'missing-evidence-link': 'Missing evidence link',
  'permission-blocked': 'Permission blocked',
};

const PRIORITY_ACTION_CLASSIFICATION_LABELS: Readonly<
  Record<BuyoutPriorityActionCandidate['classification'], string>
> = {
  'readiness-blocker': 'Readiness blocker',
  'financial-reconciliation': 'Financial reconciliation',
  'compliance-risk': 'Compliance risk',
  'procurement-risk': 'Procurement risk',
  'approval-checkpoint': 'Approval checkpoint',
  'external-system-mapping': 'External-system mapping',
};

const PRIORITY_ACTION_SEVERITY_LABELS: Readonly<
  Record<BuyoutPriorityActionCandidate['severity'], string>
> = {
  info: 'Info',
  attention: 'Attention',
  critical: 'Critical',
};

// ---------------------------------------------------------------------------
// Tone mapping helpers (only existing PccStatusPill tones are emitted —
// feedback_existing_pill_tones_only).
// ---------------------------------------------------------------------------

function packageStatusTone(state: BuyoutPackageState): PccBlStatusToneKey {
  if (state === 'blocked') return 'danger';
  if (state === 'deferred' || state === 'not-applicable') return 'neutral';
  if (state === 'complete') return 'success';
  if (
    state === 'compliance-pending' ||
    state === 'loi-pending' ||
    state === 'contract-drafting' ||
    state === 'bid-coverage-needed'
  )
    return 'warning';
  return 'info';
}

function complianceStatusTone(state: BuyoutComplianceRequirementState): PccBlStatusToneKey {
  if (state === 'non-compliant' || state === 'expired') return 'danger';
  if (state === 'pending') return 'warning';
  if (state === 'satisfied' || state === 'received') return 'success';
  if (state === 'waived' || state === 'not-required') return 'neutral';
  return 'info';
}

function milestoneStatusTone(state: BuyoutProcurementMilestoneState): PccBlStatusToneKey {
  if (state === 'overdue') return 'danger';
  if (state === 'at-risk') return 'warning';
  if (state === 'complete' || state === 'on-track') return 'success';
  return 'neutral';
}

function riskLevelTone(level: BuyoutProcurementRiskLevel): PccBlStatusToneKey {
  if (level === 'critical' || level === 'red') return 'danger';
  if (level === 'yellow') return 'warning';
  return 'success';
}

function severityTone(severity: BuyoutPriorityActionCandidate['severity']): PccBlStatusToneKey {
  if (severity === 'critical') return 'danger';
  if (severity === 'attention') return 'warning';
  return 'info';
}

function varianceTone(varianceAmount: number | undefined): PccBlVarianceToneKey {
  if (varianceAmount === undefined) return 'neutral';
  if (varianceAmount > 0) return 'warning';
  if (varianceAmount < 0) return 'success';
  return 'neutral';
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function formatDateDisplay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return iso.slice(0, 10);
}

function formatCurrencyDisplay(amount: number | undefined): string | undefined {
  if (amount === undefined) return undefined;
  // Deterministic, locale-independent formatting (no toLocaleString to keep
  // tests host-locale-agnostic).
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const groups: string[] = [];
  let rest = whole.toString();
  while (rest.length > 3) {
    groups.unshift(rest.slice(-3));
    rest = rest.slice(0, -3);
  }
  groups.unshift(rest);
  return `$${sign}${groups.join(',')}`;
}

function formatQuantityDisplay(
  quantity: number | undefined,
  unit: string | undefined,
): string | undefined {
  if (quantity === undefined) return undefined;
  return unit ? `${quantity} ${unit}` : `${quantity}`;
}

function ownerDisplay(name: string | undefined, fallback: string): string {
  if (!name || name.trim().length === 0) return fallback;
  return name;
}

function buildSourceLineageDisplay(lineage: BuyoutSourceLineage): IPccBlSourceLineageDisplay {
  return {
    sourceSystem: lineage.sourceSystem,
    sourceSystemLabel: SOURCE_SYSTEM_LABELS[lineage.sourceSystem],
    creationSourceLabel: CREATION_SOURCE_LABELS[lineage.creationSource],
    sourceObjectId: lineage.sourceObjectId,
    workbookSummary: lineage.workbookRef
      ? `${lineage.workbookRef.workbook} · ${lineage.workbookRef.sheetSection} · ${lineage.workbookRef.rowReference}`
      : undefined,
    importedAtDisplay: formatDateDisplay(lineage.importedAtUtc),
  };
}

function packageLookup(packages: readonly BuyoutPackage[]): ReadonlyMap<string, BuyoutPackage> {
  const map = new Map<string, BuyoutPackage>();
  for (const p of packages) map.set(p.id, p);
  return map;
}

function packageCodeFor(
  packages: ReadonlyMap<string, BuyoutPackage>,
  buyoutPackageId: string,
): string {
  return packages.get(buyoutPackageId)?.packageCode ?? buyoutPackageId;
}

function packageTitleFor(
  packages: ReadonlyMap<string, BuyoutPackage>,
  buyoutPackageId: string,
): string {
  return packages.get(buyoutPackageId)?.packageTitle ?? '';
}

function buildSourcePosture(data: PccBuyoutLogReadModel): IPccBlSourcePostureViewModel {
  const posture = data.sourcePosture;
  const confidenceLabel = posture.confidence
    ? `${posture.confidence[0].toUpperCase()}${posture.confidence.slice(1)}`
    : 'Unknown';
  const lastIngestedDisplay = posture.lastIngestedAtUtc
    ? `Last ingested ${formatDateDisplay(posture.lastIngestedAtUtc)}`
    : 'Never ingested';
  return {
    sourceStatus: posture.sourceStatus,
    confidenceLabel,
    lastIngestedDisplay,
    pendingHumanReviewCount: posture.pendingHumanReviewCount,
    captionLine: `Source posture is "${posture.sourceStatus}". ${posture.pendingHumanReviewCount} item${posture.pendingHumanReviewCount === 1 ? '' : 's'} pending human review.`,
  };
}

function tallyEvidenceClassifications(
  evidenceLinks: readonly BuyoutEvidenceLink[],
): readonly IPccBlEvidenceClassificationCount[] {
  const counts = new Map<BuyoutEvidenceLink['classification'], number>();
  for (const link of evidenceLinks) {
    counts.set(link.classification, (counts.get(link.classification) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([classification, count]) => ({
    classification,
    classificationLabel: EVIDENCE_CLASSIFICATION_LABELS[classification],
    count,
  }));
}

// ---------------------------------------------------------------------------
// Region 1 — Command Center
// ---------------------------------------------------------------------------

function buildCommandCenter(data: PccBuyoutLogReadModel): IPccBlCommandCenterViewModel {
  const stateCounts = new Map<BuyoutPackageState, number>();
  for (const state of BUYOUT_PACKAGE_STATES) stateCounts.set(state, 0);
  for (const pkg of data.packages) {
    stateCounts.set(pkg.status, (stateCounts.get(pkg.status) ?? 0) + 1);
  }
  const packageStateCounts: IPccBlPackageStateCount[] = BUYOUT_PACKAGE_STATES.map((state) => ({
    state,
    stateLabel: BUYOUT_PACKAGE_STATE_LABELS[state],
    count: stateCounts.get(state) ?? 0,
  }));

  const blockedPackageCount = stateCounts.get('blocked') ?? 0;
  const completePackageCount = stateCounts.get('complete') ?? 0;
  const inactiveOrTerminalCount =
    blockedPackageCount +
    completePackageCount +
    (stateCounts.get('deferred') ?? 0) +
    (stateCounts.get('not-applicable') ?? 0);
  const activePackageCount = data.packages.length - inactiveOrTerminalCount;

  const exceptionByClassification = new Map<
    BuyoutPriorityActionCandidate['classification'],
    number
  >();
  let criticalExceptionCount = 0;
  let attentionExceptionCount = 0;
  for (const candidate of data.priorityActionCandidates) {
    exceptionByClassification.set(
      candidate.classification,
      (exceptionByClassification.get(candidate.classification) ?? 0) + 1,
    );
    if (candidate.severity === 'critical') criticalExceptionCount += 1;
    else if (candidate.severity === 'attention') attentionExceptionCount += 1;
  }
  const exceptionClassificationCounts: IPccBlExceptionClassificationCount[] = Array.from(
    exceptionByClassification.entries(),
  ).map(([classification, count]) => ({
    classification,
    classificationLabel: PRIORITY_ACTION_CLASSIFICATION_LABELS[classification],
    count,
  }));

  const latestSnapshot = data.snapshotHistory.length
    ? data.snapshotHistory[data.snapshotHistory.length - 1]
    : undefined;

  return {
    readOnlyCaption: READ_ONLY_CAPTION,
    noExecutionCaption: NO_EXECUTION_CAPTION,
    totalPackageCount: data.packages.length,
    activePackageCount,
    blockedPackageCount,
    completePackageCount,
    criticalExceptionCount,
    attentionExceptionCount,
    packageStateCounts,
    exceptionClassificationCounts,
    evidenceClassificationCounts: tallyEvidenceClassifications(data.evidenceLinks),
    sourcePosture: buildSourcePosture(data),
    latestSnapshotDisplay: latestSnapshot
      ? `Snapshot ${latestSnapshot.snapshotId} · ${formatDateDisplay(latestSnapshot.generatedAtUtc) ?? ''}`
      : undefined,
    boundaryCaption: COMPLIANCE_BOUNDARY_CAPTION,
    boundaryNotices: buildBoundaryNotices(),
    integrationPosture: buildIntegrationPosture(),
  };
}

// ---------------------------------------------------------------------------
// Region 2 — Package Table
// ---------------------------------------------------------------------------

function buildPackageRow(
  pkg: BuyoutPackage,
  reconciliationByPackage: ReadonlyMap<string, number>,
  complianceHoldByPackage: ReadonlyMap<string, boolean>,
  evidenceByPackage: ReadonlyMap<string, number>,
): IPccBlPackageRow {
  const tone = packageStatusTone(pkg.status);
  return {
    id: pkg.id,
    packageCode: pkg.packageCode,
    packageTitle: pkg.packageTitle,
    csiDivision: pkg.csiDivision,
    costCode: pkg.costCode,
    status: pkg.status,
    statusLabel: BUYOUT_PACKAGE_STATE_LABELS[pkg.status],
    statusToneKey: tone,
    vendorDisplay: ownerDisplay(pkg.selectedVendorName, 'No vendor selected'),
    ballInCourtDisplay: ownerDisplay(pkg.ballInCourtPersonOrRoleRef, 'Unassigned'),
    leadTimeDaysDisplay: pkg.leadTimeDays !== undefined ? `${pkg.leadTimeDays} d` : undefined,
    awardAmountDisplay: formatCurrencyDisplay(pkg.pccAwardAmount),
    currentBudgetDisplay: formatCurrencyDisplay(pkg.currentBudgetAmount),
    procoreCommitmentDisplay: formatCurrencyDisplay(pkg.procoreCurrentCommitmentAmount),
    evidenceLinkCount: evidenceByPackage.get(pkg.id) ?? 0,
    hasReconciliationIssue: (reconciliationByPackage.get(pkg.id) ?? 0) > 0,
    hasComplianceHold: complianceHoldByPackage.get(pkg.id) ?? false,
    sourceLineageDisplay: buildSourceLineageDisplay(pkg.sourceLineage),
  };
}

function buildPackageTable(data: PccBuyoutLogReadModel): IPccBlPackageTableViewModel {
  const reconciliationByPackage = new Map<string, number>();
  for (const issue of data.reconciliationIssues) {
    if (issue.resolvedAtUtc) continue;
    reconciliationByPackage.set(
      issue.buyoutPackageId,
      (reconciliationByPackage.get(issue.buyoutPackageId) ?? 0) + 1,
    );
  }
  const complianceHoldByPackage = new Map<string, boolean>();
  for (const req of data.complianceRequirements) {
    if (
      req.required &&
      (req.status === 'pending' || req.status === 'non-compliant' || req.status === 'expired')
    ) {
      complianceHoldByPackage.set(req.buyoutPackageId, true);
    }
  }
  const evidenceByPackage = new Map<string, number>();
  for (const link of data.evidenceLinks) {
    evidenceByPackage.set(
      link.buyoutPackageId,
      (evidenceByPackage.get(link.buyoutPackageId) ?? 0) + 1,
    );
  }
  const rows = data.packages.map((p) =>
    buildPackageRow(p, reconciliationByPackage, complianceHoldByPackage, evidenceByPackage),
  );
  return {
    rows,
    totalCount: rows.length,
    emptyCaption: 'No buyout packages recorded in the current envelope.',
    definitionsCaption: PACKAGE_TABLE_DEFINITIONS_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Region 3 — Budget vs Commitment Matrix
// ---------------------------------------------------------------------------

function buildBudgetMatrixRow(pkg: BuyoutPackage): IPccBlBudgetMatrixRow {
  const variance =
    pkg.currentBudgetAmount !== undefined && pkg.pccAwardAmount !== undefined
      ? pkg.pccAwardAmount - pkg.currentBudgetAmount
      : undefined;
  const tone = varianceTone(variance);
  // Reconciliation state at the package level reflects the strongest signal
  // recorded across the package's commitment links. Default to 'not-linked'
  // when there are no Procore commitment links recorded.
  return {
    id: pkg.id,
    packageCode: pkg.packageCode,
    packageTitle: pkg.packageTitle,
    originalBudgetDisplay: formatCurrencyDisplay(pkg.originalBudgetAmount),
    currentBudgetDisplay: formatCurrencyDisplay(pkg.currentBudgetAmount),
    awardAmountDisplay: formatCurrencyDisplay(pkg.pccAwardAmount),
    procoreCommitmentDisplay: formatCurrencyDisplay(pkg.procoreCurrentCommitmentAmount),
    sageCommittedDisplay: formatCurrencyDisplay(pkg.sageCommittedCostAmount),
    varianceDisplay: variance !== undefined ? formatCurrencyDisplay(variance) : undefined,
    varianceToneKey: tone,
    mappingStatusLabel: '—',
    reconciliationStateLabel: '—',
  };
}

function buildBudgetVsCommitment(data: PccBuyoutLogReadModel): IPccBlBudgetVsCommitmentViewModel {
  // Map the most informative commitment link per package onto the matrix
  // row. Packages without commitment links keep the default "—" labels.
  const commitmentByPackage = new Map<string, BuyoutCommitmentLink>();
  for (const link of data.commitmentLinks) {
    if (!commitmentByPackage.has(link.buyoutPackageId)) {
      commitmentByPackage.set(link.buyoutPackageId, link);
    }
  }
  const allocationByPackage = new Map<string, BuyoutBudgetAllocation>();
  for (const alloc of data.budgetAllocations) {
    if (!allocationByPackage.has(alloc.buyoutPackageId)) {
      allocationByPackage.set(alloc.buyoutPackageId, alloc);
    }
  }

  const rows: IPccBlBudgetMatrixRow[] = data.packages.map((pkg) => {
    const base = buildBudgetMatrixRow(pkg);
    const link = commitmentByPackage.get(pkg.id);
    const alloc = allocationByPackage.get(pkg.id);
    return {
      ...base,
      mappingStatusLabel: alloc ? `${alloc.mappingStatus} (${alloc.mappingConfidence})` : '—',
      reconciliationStateLabel: link ? RECONCILIATION_STATE_LABELS[link.reconciliationStatus] : '—',
    };
  });

  const totalAward = data.packages.reduce((sum, p) => sum + (p.pccAwardAmount ?? 0), 0);
  const totalCurrentBudget = data.packages.reduce(
    (sum, p) => sum + (p.currentBudgetAmount ?? 0),
    0,
  );
  const totalProcoreCommitment = data.packages.reduce(
    (sum, p) => sum + (p.procoreCurrentCommitmentAmount ?? 0),
    0,
  );

  return {
    rows,
    totalAwardAmountDisplay: data.packages.length ? formatCurrencyDisplay(totalAward) : undefined,
    totalCurrentBudgetDisplay: data.packages.length
      ? formatCurrencyDisplay(totalCurrentBudget)
      : undefined,
    totalProcoreCommitmentDisplay: data.packages.length
      ? formatCurrencyDisplay(totalProcoreCommitment)
      : undefined,
    emptyCaption: 'No budget or commitment records in the current envelope.',
    definitionsCaption: BUDGET_DEFINITIONS_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Region 4 — Unbought Scope Queue
// ---------------------------------------------------------------------------

function buildUnboughtScopeQueue(data: PccBuyoutLogReadModel): IPccBlUnboughtScopeQueueViewModel {
  const lookup = packageLookup(data.packages);
  const flagged = data.scopeLines.filter(
    (line) => line.scopeStatus === 'partial' || line.scopeStatus === 'uncovered',
  );
  const rows: IPccBlUnboughtScopeRow[] = flagged.map((line) => ({
    id: line.id,
    buyoutPackageId: line.buyoutPackageId,
    packageCode: packageCodeFor(lookup, line.buyoutPackageId),
    packageTitle: packageTitleFor(lookup, line.buyoutPackageId),
    csiDivision: line.csiDivision,
    costCode: line.costCode,
    description: line.description,
    scopeStatus: line.scopeStatus,
    scopeStatusLabel: line.scopeStatus === 'partial' ? 'Partially covered' : 'Uncovered',
    quantityDisplay: formatQuantityDisplay(line.quantity, line.unit),
    sourceLineageDisplay: buildSourceLineageDisplay(line.sourceLineage),
  }));
  const partialCount = rows.filter((r) => r.scopeStatus === 'partial').length;
  const uncoveredCount = rows.filter((r) => r.scopeStatus === 'uncovered').length;
  return {
    rows,
    partialCount,
    uncoveredCount,
    emptyCaption: 'No unbought scope flagged in the current envelope.',
    definitionsCaption: UNBOUGHT_DEFINITIONS_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Region 5 — Procore Reconciliation View
// ---------------------------------------------------------------------------

function buildProcoreReconciliation(
  data: PccBuyoutLogReadModel,
): IPccBlProcoreReconciliationViewModel {
  const lookup = packageLookup(data.packages);
  const issues: IPccBlReconciliationIssueRow[] = data.reconciliationIssues.map((issue) => ({
    id: issue.id,
    buyoutPackageId: issue.buyoutPackageId,
    packageCode: packageCodeFor(lookup, issue.buyoutPackageId),
    packageTitle: packageTitleFor(lookup, issue.buyoutPackageId),
    kind: issue.kind,
    kindLabel: RECONCILIATION_ISSUE_KIND_LABELS[issue.kind],
    detail: issue.detail,
    openedAtDisplay: formatDateDisplay(issue.openedAtUtc) ?? '',
    resolvedAtDisplay: formatDateDisplay(issue.resolvedAtUtc),
    resolutionRationale: issue.resolutionRationale,
  }));
  const commitmentLinks: IPccBlReconciliationCommitmentRow[] = data.commitmentLinks.map((link) => ({
    id: link.id,
    buyoutPackageId: link.buyoutPackageId,
    packageCode: packageCodeFor(lookup, link.buyoutPackageId),
    packageTitle: packageTitleFor(lookup, link.buyoutPackageId),
    procoreCommitmentNumber: link.procoreCommitmentNumber,
    procoreCompanyId: link.procoreCompanyId,
    currentCommitmentDisplay: formatCurrencyDisplay(link.procoreCurrentCommitmentAmount),
    originalCommitmentDisplay: formatCurrencyDisplay(link.procoreOriginalCommitmentAmount),
    reconciliationStatus: link.reconciliationStatus,
    reconciliationStatusLabel: RECONCILIATION_STATE_LABELS[link.reconciliationStatus],
  }));
  const openIssueCount = issues.filter((i) => !i.resolvedAtDisplay).length;
  const resolvedIssueCount = issues.length - openIssueCount;
  return {
    issues,
    commitmentLinks,
    openIssueCount,
    resolvedIssueCount,
    boundaryCaption: RECONCILIATION_BOUNDARY_CAPTION,
    emptyCaption: 'No reconciliation issues or Procore commitment links in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Region 6 — Package Detail Panel
// ---------------------------------------------------------------------------

function scopeLinesFor(
  data: PccBuyoutLogReadModel,
  packageId: string,
): readonly IPccBlPackageScopeLineDetail[] {
  return data.scopeLines
    .filter((s) => s.buyoutPackageId === packageId)
    .map((s) => ({
      id: s.id,
      description: s.description,
      csiDivision: s.csiDivision,
      costCode: s.costCode,
      scopeStatusLabel:
        s.scopeStatus === 'partial'
          ? 'Partially covered'
          : s.scopeStatus === 'uncovered'
            ? 'Uncovered'
            : 'Covered',
      quantityDisplay: formatQuantityDisplay(s.quantity, s.unit),
    }));
}

function budgetAllocationsFor(
  data: PccBuyoutLogReadModel,
  packageId: string,
): readonly IPccBlPackageBudgetAllocationDetail[] {
  return data.budgetAllocations
    .filter((a) => a.buyoutPackageId === packageId)
    .map((a) => ({
      id: a.id,
      costCode: a.costCode,
      costType: a.costType,
      budgetCode: a.budgetCode,
      allocationAmountDisplay: formatCurrencyDisplay(a.allocationAmount) ?? '—',
      allocationPercentDisplay: `${a.allocationPercent.toFixed(1)}%`,
      mappingStatusLabel: a.mappingStatus,
      mappingConfidenceLabel: a.mappingConfidence,
      sourceSystemLabel: SOURCE_SYSTEM_LABELS[a.sourceSystem],
    }));
}

function commitmentLinksFor(
  data: PccBuyoutLogReadModel,
  packageId: string,
): readonly IPccBlPackageCommitmentDetail[] {
  return data.commitmentLinks
    .filter((c) => c.buyoutPackageId === packageId)
    .map((c) => ({
      id: c.id,
      procoreCommitmentNumber: c.procoreCommitmentNumber,
      currentCommitmentDisplay: formatCurrencyDisplay(c.procoreCurrentCommitmentAmount),
      originalCommitmentDisplay: formatCurrencyDisplay(c.procoreOriginalCommitmentAmount),
      reconciliationStatusLabel: RECONCILIATION_STATE_LABELS[c.reconciliationStatus],
    }));
}

function evidenceLinksFor(
  data: PccBuyoutLogReadModel,
  packageId: string,
): readonly IPccBlPackageEvidenceDetail[] {
  return data.evidenceLinks
    .filter((e) => e.buyoutPackageId === packageId)
    .map((e) => ({
      id: e.id,
      label: e.label,
      classificationLabel: EVIDENCE_CLASSIFICATION_LABELS[e.classification],
      sharepointReferenceId: e.sharepointReferenceId,
      addedAtDisplay: formatDateDisplay(e.addedAtUtc) ?? '',
    }));
}

function auditTrailFor(
  events: readonly BuyoutAuditEvent[],
  packageId: string,
): readonly IPccBlPackageAuditDetail[] {
  return events
    .filter((e) => e.entityRef === packageId)
    .map((e) => ({
      eventId: e.eventId,
      eventTypeLabel: AUDIT_EVENT_TYPE_LABELS[e.eventType],
      occurredAtDisplay: formatDateDisplay(e.occurredAtUtc) ?? '',
      summary: e.summary,
    }));
}

function priorityActionsFor(
  candidates: readonly BuyoutPriorityActionCandidate[],
  packageId: string,
): readonly IPccBlPackagePriorityActionDetail[] {
  return candidates
    .filter((c) => c.buyoutPackageId === packageId)
    .map((c) => ({
      id: c.id,
      reasonCodeLabel: c.reasonCode,
      classificationLabel: PRIORITY_ACTION_CLASSIFICATION_LABELS[c.classification],
      severityLabel: PRIORITY_ACTION_SEVERITY_LABELS[c.severity],
      severityToneKey: severityTone(c.severity),
      generatedAtDisplay: formatDateDisplay(c.generatedAtUtc) ?? '',
    }));
}

function buildHbiEligibilityNoticeForPackage(
  marker: BuyoutHbiEligibilityMarker | undefined,
): IPccBlHbiEligibilityNotice {
  const eligible = marker?.eligible ?? false;
  return {
    eligible,
    headlineCaption: HBI_ELIGIBILITY_HEADLINE,
    citationCaption: HBI_FUTURE_GATED_CAPTION,
    refusalReasons: marker?.refusalReasons ?? [],
    refusalReasonLabels: (marker?.refusalReasons ?? []).map((r) => HBI_REFUSAL_REASON_LABELS[r]),
  };
}

function sdiEnrollmentLabel(status: BuyoutPackage['sdiEnrollmentStatus']): string {
  switch (status) {
    case 'required':
      return 'SDI required';
    case 'enrolled':
      return 'SDI enrolled';
    case 'waived':
      return 'SDI waived';
    case 'not-required':
    default:
      return 'SDI not required';
  }
}

function bondRequirementLabel(status: BuyoutPackage['bondRequirementStatus']): string {
  switch (status) {
    case 'required':
      return 'Bond required';
    case 'received':
      return 'Bond received';
    case 'waived':
      return 'Bond waived';
    case 'not-required':
    default:
      return 'Bond not required';
  }
}

function buildPackageDetailEntry(
  pkg: BuyoutPackage,
  data: PccBuyoutLogReadModel,
  hbiByPackage: ReadonlyMap<string, BuyoutHbiEligibilityMarker>,
): IPccBlPackageDetailEntry {
  return {
    id: pkg.id,
    packageCode: pkg.packageCode,
    packageTitle: pkg.packageTitle,
    statusLabel: BUYOUT_PACKAGE_STATE_LABELS[pkg.status],
    statusToneKey: packageStatusTone(pkg.status),
    scopeDescription: pkg.scopeDescription,
    csiDivision: pkg.csiDivision,
    costCode: pkg.costCode,
    vendorDisplay: ownerDisplay(pkg.selectedVendorName, 'No vendor selected'),
    ballInCourtDisplay: ownerDisplay(pkg.ballInCourtPersonOrRoleRef, 'Unassigned'),
    awardAmountDisplay: formatCurrencyDisplay(pkg.pccAwardAmount),
    originalBudgetDisplay: formatCurrencyDisplay(pkg.originalBudgetAmount),
    currentBudgetDisplay: formatCurrencyDisplay(pkg.currentBudgetAmount),
    procoreCommitmentDisplay: formatCurrencyDisplay(pkg.procoreCurrentCommitmentAmount),
    sageCommittedDisplay: formatCurrencyDisplay(pkg.sageCommittedCostAmount),
    leadTimeDaysDisplay: pkg.leadTimeDays !== undefined ? `${pkg.leadTimeDays} d` : undefined,
    leadTimeNotes: pkg.leadTimeNotes,
    loiSendTargetDateDisplay: formatDateDisplay(pkg.loiSendTargetDate),
    loiExecutedDateDisplay: formatDateDisplay(pkg.loiExecutedDate),
    sdiEnrollmentLabel: sdiEnrollmentLabel(pkg.sdiEnrollmentStatus),
    bondRequirementLabel: bondRequirementLabel(pkg.bondRequirementStatus),
    blockReason: pkg.blockReason,
    deferredUntilDisplay: formatDateDisplay(pkg.deferredUntilUtc),
    comments: pkg.comments,
    sourceLineageDisplay: buildSourceLineageDisplay(pkg.sourceLineage),
    scopeLines: scopeLinesFor(data, pkg.id),
    budgetAllocations: budgetAllocationsFor(data, pkg.id),
    commitmentLinks: commitmentLinksFor(data, pkg.id),
    evidenceLinks: evidenceLinksFor(data, pkg.id),
    auditTrail: auditTrailFor(data.auditEvents, pkg.id),
    priorityActionCandidates: priorityActionsFor(data.priorityActionCandidates, pkg.id),
    hbiEligibilityNotice: buildHbiEligibilityNoticeForPackage(hbiByPackage.get(pkg.id)),
    referenceSeams: buildReferenceSeamRows(pkg),
    boundaryCaption: PACKAGE_DETAIL_BOUNDARY_CAPTION,
  };
}

function buildPackageDetail(data: PccBuyoutLogReadModel): IPccBlPackageDetailViewModel {
  const hbiByPackage = new Map<string, BuyoutHbiEligibilityMarker>();
  for (const m of data.hbiEligibilityMarkers) hbiByPackage.set(m.buyoutPackageId, m);
  const entries = new Map<string, IPccBlPackageDetailEntry>();
  for (const pkg of data.packages) {
    entries.set(pkg.id, buildPackageDetailEntry(pkg, data, hbiByPackage));
  }
  return {
    entries,
    defaultEntryId: data.packages[0]?.id,
    emptyCaption: 'No packages available in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Region 7 — Compliance / SDI / Bond
// ---------------------------------------------------------------------------

function buildComplianceRow(
  req: BuyoutComplianceRequirement,
  packages: ReadonlyMap<string, BuyoutPackage>,
): IPccBlComplianceRow {
  return {
    id: req.id,
    buyoutPackageId: req.buyoutPackageId,
    packageCode: packageCodeFor(packages, req.buyoutPackageId),
    packageTitle: packageTitleFor(packages, req.buyoutPackageId),
    requirementType: req.requirementType,
    requirementTypeLabel: COMPLIANCE_REQUIREMENT_TYPE_LABELS[req.requirementType],
    status: req.status,
    statusLabel: COMPLIANCE_REQUIREMENT_STATE_LABELS[req.status],
    statusToneKey: complianceStatusTone(req.status),
    required: req.required,
    waiverRequired: req.waiverRequired,
    waiverReason: req.waiverReason,
    dueDateDisplay: formatDateDisplay(req.dueDate),
    receivedDateDisplay: formatDateDisplay(req.receivedDate),
    expirationDateDisplay: formatDateDisplay(req.expirationDate),
    evidenceLinkCount: req.evidenceLinkIds.length,
  };
}

function buildCompliance(data: PccBuyoutLogReadModel): IPccBlComplianceSdiBondViewModel {
  const lookup = packageLookup(data.packages);
  const byType = new Map<BuyoutComplianceRequirementType, IPccBlComplianceRow[]>();
  for (const req of data.complianceRequirements) {
    const row = buildComplianceRow(req, lookup);
    const list = byType.get(req.requirementType) ?? [];
    list.push(row);
    byType.set(req.requirementType, list);
  }
  const groups: IPccBlComplianceGroup[] = Array.from(byType.entries()).map(
    ([requirementType, rows]) => ({
      requirementType,
      requirementTypeLabel: COMPLIANCE_REQUIREMENT_TYPE_LABELS[requirementType],
      rows,
    }),
  );
  const totalCount = data.complianceRequirements.length;
  const nonCompliantCount = data.complianceRequirements.filter(
    (r) => r.status === 'non-compliant' || r.status === 'expired',
  ).length;
  const waivedCount = data.complianceRequirements.filter((r) => r.status === 'waived').length;
  return {
    groups,
    totalCount,
    nonCompliantCount,
    waivedCount,
    emptyCaption: 'No compliance requirements recorded in the current envelope.',
    boundaryCaption: COMPLIANCE_BOUNDARY_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Region 8 — Procurement / Submittal / Lead-Time
// ---------------------------------------------------------------------------

function buildMilestoneRow(
  m: BuyoutProcurementMilestone,
  packages: ReadonlyMap<string, BuyoutPackage>,
): IPccBlProcurementMilestoneRow {
  return {
    id: m.id,
    buyoutPackageId: m.buyoutPackageId,
    packageCode: packageCodeFor(packages, m.buyoutPackageId),
    packageTitle: packageTitleFor(packages, m.buyoutPackageId),
    milestoneType: m.milestoneType,
    milestoneTypeLabel: PROCUREMENT_MILESTONE_TYPE_LABELS[m.milestoneType],
    status: m.status,
    statusLabel: PROCUREMENT_MILESTONE_STATE_LABELS[m.status],
    statusToneKey: milestoneStatusTone(m.status),
    riskLevel: m.riskLevel,
    riskLevelLabel: PROCUREMENT_RISK_LEVEL_LABELS[m.riskLevel],
    riskToneKey: riskLevelTone(m.riskLevel),
    requiredDateDisplay: formatDateDisplay(m.requiredDate),
    forecastDateDisplay: formatDateDisplay(m.forecastDate),
    actualDateDisplay: formatDateDisplay(m.actualDate),
    notes: m.notes,
  };
}

function buildProcurementLeadTime(data: PccBuyoutLogReadModel): IPccBlProcurementLeadTimeViewModel {
  const lookup = packageLookup(data.packages);
  const byType = new Map<BuyoutProcurementMilestoneType, IPccBlProcurementMilestoneRow[]>();
  for (const m of data.procurementMilestones) {
    const row = buildMilestoneRow(m, lookup);
    const list = byType.get(m.milestoneType) ?? [];
    list.push(row);
    byType.set(m.milestoneType, list);
  }
  const groups: IPccBlProcurementMilestoneGroup[] = Array.from(byType.entries()).map(
    ([milestoneType, rows]) => ({
      milestoneType,
      milestoneTypeLabel: PROCUREMENT_MILESTONE_TYPE_LABELS[milestoneType],
      rows,
    }),
  );
  const totalCount = data.procurementMilestones.length;
  const atRiskCount = data.procurementMilestones.filter((m) => m.status === 'at-risk').length;
  const overdueCount = data.procurementMilestones.filter((m) => m.status === 'overdue').length;
  return {
    groups,
    totalCount,
    atRiskCount,
    overdueCount,
    emptyCaption: 'No procurement / submittal / lead-time milestones in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Region 9 — Evidence / Source Lineage
// ---------------------------------------------------------------------------

function buildEvidenceLineage(data: PccBuyoutLogReadModel): IPccBlEvidenceLineageViewModel {
  const lookup = packageLookup(data.packages);
  const evidenceRows: IPccBlEvidenceLineageEvidenceRow[] = data.evidenceLinks.map((e) => ({
    id: e.id,
    buyoutPackageId: e.buyoutPackageId,
    packageCode: packageCodeFor(lookup, e.buyoutPackageId),
    label: e.label,
    classificationLabel: EVIDENCE_CLASSIFICATION_LABELS[e.classification],
    sharepointReferenceId: e.sharepointReferenceId,
    addedAtDisplay: formatDateDisplay(e.addedAtUtc) ?? '',
  }));
  const evidenceCounts = new Map<string, number>();
  for (const e of data.evidenceLinks) {
    evidenceCounts.set(e.buyoutPackageId, (evidenceCounts.get(e.buyoutPackageId) ?? 0) + 1);
  }
  const packageLineageRows: IPccBlEvidenceLineagePackageRow[] = data.packages.map((p) => ({
    id: p.id,
    packageCode: p.packageCode,
    packageTitle: p.packageTitle,
    sourceLineageDisplay: buildSourceLineageDisplay(p.sourceLineage),
    evidenceLinkCount: evidenceCounts.get(p.id) ?? 0,
  }));
  const eligibleCount = data.hbiEligibilityMarkers.filter((m) => m.eligible).length;
  const ineligibleCount = data.hbiEligibilityMarkers.length - eligibleCount;
  const summary: IPccBlHbiEligibilitySummary = {
    eligibleCount,
    ineligibleCount,
    headlineCaption: HBI_ELIGIBILITY_HEADLINE,
    futureGatedCaption: HBI_FUTURE_GATED_CAPTION,
  };
  return {
    evidenceRows,
    packageLineageRows,
    evidenceClassificationCounts: tallyEvidenceClassifications(data.evidenceLinks),
    hbiEligibilitySummary: summary,
    boundaryCaption: EVIDENCE_BOUNDARY_CAPTION,
    emptyCaption: 'No evidence references or source lineage in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Region 10 — Audit History
// ---------------------------------------------------------------------------

function buildAuditHistory(data: PccBuyoutLogReadModel): IPccBlAuditHistoryViewModel {
  const lookup = packageLookup(data.packages);
  const auditEvents: IPccBlAuditEventRow[] = data.auditEvents.map((e) => ({
    eventId: e.eventId,
    eventTypeLabel: AUDIT_EVENT_TYPE_LABELS[e.eventType],
    occurredAtDisplay: formatDateDisplay(e.occurredAtUtc) ?? '',
    entityRef: e.entityRef,
    summary: e.summary,
  }));
  const projectMemoryContributions: IPccBlProjectMemoryRow[] = data.projectMemoryContributions.map(
    (m) => ({
      id: m.id,
      buyoutPackageId: m.buyoutPackageId,
      packageCode: lookup.get(m.buyoutPackageId)?.packageCode,
      kind: m.kind,
      kindLabel: PROJECT_MEMORY_KIND_LABELS[m.kind],
      narrative: m.narrative,
      recordedAtDisplay: formatDateDisplay(m.recordedAtUtc) ?? '',
    }),
  );
  const traceabilityEdges: IPccBlTraceabilityEdgeRow[] = data.traceabilityEdgeContributions.map(
    (t) => ({
      id: t.id,
      buyoutPackageId: t.buyoutPackageId,
      packageCode: lookup.get(t.buyoutPackageId)?.packageCode,
      fromRef: t.fromRef,
      toRef: t.toRef,
      edgeKind: t.edgeKind,
      edgeKindLabel: TRACEABILITY_EDGE_KIND_LABELS[t.edgeKind],
    }),
  );
  return {
    auditEvents,
    projectMemoryContributions,
    traceabilityEdges,
    projectMemoryCaption: PROJECT_MEMORY_CAPTION,
    traceabilityCaption: TRACEABILITY_CAPTION,
    emptyCaption: 'No audit, project-memory, or traceability records in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

export function buildPccBuyoutLogViewModel(
  envelope: PccReadModelEnvelope<PccBuyoutLogReadModel>,
): IPccBuyoutLogViewModel {
  const sourceStatus = envelope.sourceStatus;
  const cardState = toCardState(sourceStatus);
  const data = envelope.data;
  return {
    status: 'ready',
    cardState,
    sourceStatus,
    moduleIdentity: data.moduleIdentity,
    commandCenter: buildCommandCenter(data),
    packageTable: buildPackageTable(data),
    budgetVsCommitment: buildBudgetVsCommitment(data),
    unboughtScopeQueue: buildUnboughtScopeQueue(data),
    procoreReconciliation: buildProcoreReconciliation(data),
    packageDetail: buildPackageDetail(data),
    compliance: buildCompliance(data),
    procurementLeadTime: buildProcurementLeadTime(data),
    evidenceLineage: buildEvidenceLineage(data),
    auditHistory: buildAuditHistory(data),
  };
}
