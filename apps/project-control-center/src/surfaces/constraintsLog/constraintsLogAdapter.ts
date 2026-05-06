/**
 * PCC Constraints Log read-model adapter (Phase 3 / Wave 12 / Prompt 05).
 *
 * Pure mapping layer. Converts a `PccConstraintsLogReadModel` envelope
 * into a stable nine-lane view-model. No React, no hooks, no fetch, no
 * client calls, no clock reads.
 *
 * The adapter returns `status: 'ready'` for `available`,
 * `source-unavailable`, and `backend-unavailable` envelopes; degraded
 * envelopes are reflected in `cardState` and `sourceStatus`. The hook
 * (`useConstraintsLogReadModel`) owns `loading` and `error`.
 *
 * No legal advice, claim entitlement, compensability determination,
 * delay-damages calculation, notice sufficiency, or forensic schedule
 * analysis is performed. Delay-exposure and change-exposure items are
 * surfaced as review flags only.
 */

import {
  CONSTRAINT_STATES,
  EXPOSURE_BANDS,
  IMPACT_LABELS,
  LIKELIHOOD_LABELS,
  SEVERITY_BAND_KEYS,
  URGENCY_LABELS,
  mapSeverityBand,
  type ConstraintExposureAssessment,
  type ConstraintItem,
  type ConstraintState,
  type ConstraintsLogAuditEvent,
  type ConstraintsLogReferenceSeams,
  type ConstraintsLogSeedCategory,
  type ConstraintsLogSeedCategoryId,
  type ImpactLevel,
  type LikelihoodLevel,
  type PccConstraintsLogReadModel,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type RiskItem,
  type ResidualRiskAssessment,
  type RiskScoreAssessment,
  type SeverityBandKey,
  type SeverityOverrideCode,
  type SeverityOverrideRule,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';
import type { PccCardState } from '../projectHome/shared.js';
import {
  PCC_CL_BOUNDARY_KEYS,
  PCC_CL_INTEGRATION_TARGET_IDS,
  type IPccClAuditEventRow,
  type IPccClBandCount,
  type IPccClBoardCardEntry,
  type IPccClBoundaryNotice,
  type IPccClCategoryTrendRow,
  type IPccClCommandCenterViewModel,
  type IPccClConstraintExposureMatrixViewModel,
  type IPccClConstraintPlotEntry,
  type IPccClDetailPanelEntry,
  type IPccClDetailPanelViewModel,
  type IPccClExecutiveBandRow,
  type IPccClExecutiveExposureSummaryViewModel,
  type IPccClHuddleEntry,
  type IPccClIntegrationPostureRow,
  type IPccClLogRow,
  type IPccClLogTableViewModel,
  type IPccClMakeReadyBoardColumn,
  type IPccClMakeReadyBoardViewModel,
  type IPccClMatrixCell,
  type IPccClOverrideUsageRow,
  type IPccClReferenceSeamRow,
  type IPccClResidualDeltaRow,
  type IPccClRiskMatrixViewModel,
  type IPccClRiskPlotEntry,
  type IPccClRootCauseLessonsLearnedViewModel,
  type IPccClSourcePostureViewModel,
  type IPccClWeeklyHuddleSection,
  type IPccClWeeklyHuddleViewModel,
  type IPccConstraintsLogViewModel,
  type PccClBoundaryKey,
  type PccClIntegrationTargetId,
  type PccClSeamKind,
} from './constraintsLogViewModel.js';

// ---------------------------------------------------------------------------
// Canonical copy
// ---------------------------------------------------------------------------

const READ_ONLY_CAPTION = 'Constraints Log';
const NO_EXECUTION_CAPTION =
  'Approvals and external writebacks are managed by your PCC administrator. Local UI selection only.';
const BOARD_DEFINITIONS_CAPTION =
  'Risk = uncertain future event. Constraint = known blocker to planned work. Issue = active problem. Delay-exposure / change-exposure = review flags only, not entitlement determinations.';
const LOG_DEFINITIONS_CAPTION =
  'Constraints Log items are reference records. Mutations, approvals, and external writebacks are managed by your PCC administrator.';
const HUDDLE_CADENCE_CAPTION =
  'Weekly Huddle focus: open commitments, overdue items, awaiting external party, high-exposure items, and triggered risks.';
const EXEC_HEADLINE_CAPTION = 'Executive exposure posture summary.';
const LEGAL_BOUNDARY_CAPTION =
  'Reference-only review surface. No claim entitlement, no compensability determination, no delay-damages calculation, no forensic schedule analysis.';

// Four canonical boundary notices surfaced in the Command Center lane.
// Phrased as posture statements (not legal/forensic conclusions) so the
// surface stays product-safe and stage-agnostic.
const BOUNDARY_NOTICE_CAPTIONS: Readonly<Record<PccClBoundaryKey, string>> = {
  'delay-exposure':
    'Delay exposure is a project-controls review flag. Forensic schedule-analysis conclusions are not enabled here.',
  'change-exposure':
    'Change exposure is a review flag. Change-order entitlement and compensability determinations are not enabled here.',
  'evidence-link':
    'Evidence links reference Document Control. Evidence file ownership is not enabled here.',
  'approval-checkpoint':
    'Approval and checkpoint execution is not enabled here; ownership stays with the approvals surface.',
};

// Always-present integration posture rows, one per receiving target.
// These render even when the current envelope contains no items so the
// reference-only boundary is structurally legible regardless of content.
const INTEGRATION_POSTURE_ROWS: readonly IPccClIntegrationPostureRow[] = [
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
    targetId: 'approvals-checkpoints',
    targetLabel: 'Approvals & Checkpoints',
    postureCaption: 'Reference only — approval and checkpoint execution is not enabled here.',
  },
  {
    targetId: 'document-control',
    targetLabel: 'Document Control',
    postureCaption: 'Reference only — evidence file ownership stays with Document Control.',
  },
  {
    targetId: 'scheduler-look-ahead',
    targetLabel: 'Scheduler & Look-Ahead',
    postureCaption: 'Reference only — scheduler and look-ahead data is not mutated here.',
  },
  {
    targetId: 'external-systems',
    targetLabel: 'External Platforms',
    postureCaption:
      'Reference only — external system launchers; no runtime calls are made from here.',
  },
  {
    targetId: 'team-access',
    targetLabel: 'Team & Access',
    postureCaption: 'Reference only — Team & Access roster ownership stays with that surface.',
  },
];

// Per-seam-kind reference-only label rendered next to each populated seam
// row in the detail panel. Stable kind keys (PccClSeamKind) drive both the
// DOM marker (data-pcc-cl-detail-seam-kind="<kind>") and the label copy.
const SEAM_KIND_LABELS: Readonly<Record<PccClSeamKind, string>> = {
  'priority-actions-candidate': 'Reference only — Priority Actions queue is not mutated here.',
  'document-control-evidence':
    'Reference only — evidence file ownership stays with Document Control.',
  'lifecycle-readiness-gate':
    'Reference only — lifecycle gate evaluation is owned by the lifecycle readiness surface.',
  'permit-inspection':
    'Reference only — permit/inspection lifecycle is owned by the permit & inspection surface.',
  'responsibility-role':
    'Reference only — role assignment is owned by the responsibility matrix surface.',
  'approval-checkpoint': 'Reference only — approval/checkpoint execution is not enabled here.',
  'external-system-launcher':
    'Reference only — external system launcher; no runtime call is made here.',
  'scheduler-look-ahead': 'Reference only — scheduler/look-ahead data is not mutated here.',
  'team-access-role': 'Reference only — Team & Access roster ownership stays with that surface.',
  'project-readiness-source-module':
    'Reference only — declares this item as a Project Readiness source module signal.',
  'converted-to-constraint': 'Reference only — names the constraint id this risk converted into.',
  'external-party-reference':
    'Reference only — names the external party blocking this constraint; no external runtime call from here.',
};

// Public-facing seam row labels (the human-readable name of the seam).
// Stage-agnostic; no Wave references in user-facing copy.
const SEAM_KIND_DISPLAY_LABELS: Readonly<Record<PccClSeamKind, string>> = {
  'priority-actions-candidate': 'Priority Actions candidate',
  'document-control-evidence': 'Document Control evidence reference',
  'lifecycle-readiness-gate': 'Lifecycle Readiness gate',
  'permit-inspection': 'Permit / inspection record',
  'responsibility-role': 'Responsibility role',
  'approval-checkpoint': 'Approval / checkpoint',
  'external-system-launcher': 'External system launcher',
  'scheduler-look-ahead': 'Scheduler look-ahead',
  'team-access-role': 'Team & Access role',
  'project-readiness-source-module': 'Project Readiness source module',
  'converted-to-constraint': 'Converted to constraint',
  'external-party-reference': 'External party reference',
};

function buildBoundaryNotices(): readonly IPccClBoundaryNotice[] {
  return PCC_CL_BOUNDARY_KEYS.map((key) => ({
    key,
    caption: BOUNDARY_NOTICE_CAPTIONS[key],
  }));
}

function buildIntegrationPosture(): readonly IPccClIntegrationPostureRow[] {
  // Validate (at runtime) that the registry covers every target id in the
  // tuple. Throws fast in tests if a new target id is added without a row.
  const present = new Set(INTEGRATION_POSTURE_ROWS.map((r) => r.targetId));
  for (const targetId of PCC_CL_INTEGRATION_TARGET_IDS) {
    if (!present.has(targetId)) {
      throw new Error(
        `INTEGRATION_POSTURE_ROWS missing entry for target ${targetId satisfies PccClIntegrationTargetId}`,
      );
    }
  }
  return INTEGRATION_POSTURE_ROWS;
}

// ---------------------------------------------------------------------------
// Internal label maps (module-local; tests assert adapter outputs, not the
// internal label-map shape)
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

const BAND_LABELS: Readonly<Record<SeverityBandKey, string>> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very high',
  critical: 'Critical',
};

const RISK_STATE_LABELS: Readonly<Record<RiskItem['state'], string>> = {
  draft: 'Draft',
  identified: 'Identified',
  assessed: 'Assessed',
  'response-planned': 'Response planned',
  monitoring: 'Monitoring',
  triggered: 'Triggered',
  converted: 'Converted',
  closed: 'Closed',
  retired: 'Retired',
};

const CONSTRAINT_STATE_LABELS: Readonly<Record<ConstraintState, string>> = {
  draft: 'Draft',
  identified: 'Identified',
  accepted: 'Accepted',
  'action-planned': 'Action planned',
  'in-progress': 'In progress',
  'awaiting-external-party': 'Awaiting external party',
  'at-risk': 'At risk',
  overdue: 'Overdue',
  'resolved-pending-validation': 'Resolved (pending validation)',
  resolved: 'Resolved',
};

const ITEM_TYPE_LABELS: Readonly<Record<ConstraintItem['type'] | 'risk', string>> = {
  risk: 'Risk',
  constraint: 'Constraint',
  issue: 'Issue',
  'delay-exposure': 'Delay exposure (review only)',
  'change-exposure': 'Change exposure (review only)',
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function formatDateDisplay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  // Slice ISO to YYYY-MM-DD (deterministic, no Date construction so tests
  // do not depend on the host time zone).
  return iso.slice(0, 10);
}

function ownerDisplay(name: string | undefined, fallback: string): string {
  if (!name || name.trim().length === 0) return fallback;
  return name;
}

function bandLabel(band: SeverityBandKey): string {
  return BAND_LABELS[band];
}

function makeSeedCategoryLookup(
  seedCategories: readonly ConstraintsLogSeedCategory[],
): Readonly<Record<ConstraintsLogSeedCategoryId, string>> {
  const out: Partial<Record<ConstraintsLogSeedCategoryId, string>> = {};
  for (const c of seedCategories) {
    out[c.id] = c.displayName;
  }
  return out as Readonly<Record<ConstraintsLogSeedCategoryId, string>>;
}

function buildSourcePosture(data: PccConstraintsLogReadModel): IPccClSourcePostureViewModel {
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

function bandCounts(source: Readonly<Record<SeverityBandKey, number>>): readonly IPccClBandCount[] {
  return SEVERITY_BAND_KEYS.map((band) => ({
    band,
    bandLabel: bandLabel(band),
    count: source[band] ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Lane: 1 — Command Center
// ---------------------------------------------------------------------------

function buildCommandCenter(data: PccConstraintsLogReadModel): IPccClCommandCenterViewModel {
  const summary = data.exposureSummary;
  const latestSnapshot = data.snapshotHistory.length
    ? data.snapshotHistory[data.snapshotHistory.length - 1]
    : undefined;
  return {
    readOnlyCaption: READ_ONLY_CAPTION,
    noExecutionCaption: NO_EXECUTION_CAPTION,
    riskBandCounts: bandCounts(summary.riskCountsByBand),
    constraintBandCounts: bandCounts(summary.constraintCountsByBand),
    overdueConstraintCount: summary.overdueConstraintCount,
    awaitingExternalPartyCount: summary.awaitingExternalPartyCount,
    delayExposureReviewQueueCount: summary.delayExposureReviewQueueCount,
    changeExposureReviewQueueCount: summary.changeExposureReviewQueueCount,
    priorityActionsCandidateCount: summary.priorityActionsCandidateCount,
    sourcePosture: buildSourcePosture(data),
    latestSnapshotDisplay: latestSnapshot
      ? `Snapshot ${latestSnapshot.snapshotId} · ${formatDateDisplay(latestSnapshot.generatedAtUtc) ?? ''}`
      : undefined,
    boundaryNotices: buildBoundaryNotices(),
    integrationPosture: buildIntegrationPosture(),
  };
}

// ---------------------------------------------------------------------------
// Lane: 2 — Make-Ready Board
// ---------------------------------------------------------------------------

function makeBoardEntry(
  c: ConstraintItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
): IPccClBoardCardEntry {
  return {
    id: c.id,
    itemNumber: c.itemNumber,
    title: c.title,
    band: c.exposure.band,
    bandLabel: bandLabel(c.exposure.band),
    responsiblePartyDisplay: ownerDisplay(c.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(c.ballInCourt, 'Unassigned'),
    dueDateDisplay: formatDateDisplay(c.dueDateUtc),
    seedCategoryLabel: seedLabels[c.seedCategoryId] ?? c.seedCategoryId,
  };
}

function buildMakeReadyBoard(data: PccConstraintsLogReadModel): IPccClMakeReadyBoardViewModel {
  const seedLabels = makeSeedCategoryLookup(data.seedCategories);
  const byState = new Map<ConstraintState, IPccClBoardCardEntry[]>();
  for (const state of CONSTRAINT_STATES) byState.set(state, []);
  for (const c of data.constraintItems) {
    const list = byState.get(c.state);
    if (list) list.push(makeBoardEntry(c, seedLabels));
  }
  const columns: IPccClMakeReadyBoardColumn[] = CONSTRAINT_STATES.map((state) => ({
    state,
    stateLabel: CONSTRAINT_STATE_LABELS[state],
    entries: byState.get(state) ?? [],
  }));
  return {
    columns,
    totalConstraints: data.constraintItems.length,
    emptyCaption: 'No constraints in the current envelope.',
    definitionsCaption: BOARD_DEFINITIONS_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Lane: 3 / 4 — Matrix builders
// ---------------------------------------------------------------------------

function emptyMatrix(): IPccClMatrixCell[][] {
  const out: IPccClMatrixCell[][] = [];
  for (let row = 1; row <= 5; row += 1) {
    const cells: IPccClMatrixCell[] = [];
    for (let col = 1; col <= 5; col += 1) {
      const score = row * col;
      cells.push({
        likelihood: row as LikelihoodLevel,
        impact: col as ImpactLevel,
        band: mapSeverityBand(score),
        score,
        count: 0,
        itemIds: [],
      });
    }
    out.push(cells);
  }
  return out;
}

function bumpMatrixCell(
  matrix: IPccClMatrixCell[][],
  rowAxis: number,
  colAxis: number,
  itemId: string,
): void {
  if (rowAxis < 1 || rowAxis > 5 || colAxis < 1 || colAxis > 5) return;
  const cell = matrix[rowAxis - 1][colAxis - 1];
  matrix[rowAxis - 1][colAxis - 1] = {
    ...cell,
    count: cell.count + 1,
    itemIds: [...cell.itemIds, itemId],
  };
}

function buildRiskMatrix(data: PccConstraintsLogReadModel): IPccClRiskMatrixViewModel {
  const matrix = emptyMatrix();
  const entries: IPccClRiskPlotEntry[] = [];
  for (const r of data.riskItems) {
    const initial = r.initial;
    bumpMatrixCell(matrix, initial.likelihood, initial.governingImpactScore, r.id);
    entries.push({
      id: r.id,
      itemNumber: r.itemNumber,
      title: r.title,
      likelihood: initial.likelihood,
      governingImpact: initial.governingImpactScore,
      score: initial.riskScore,
      band: initial.band,
      bandLabel: bandLabel(initial.band),
      residualScore: r.residual?.residualRiskScore,
      residualBand: r.residual?.band,
      appliedOverrideCodes: initial.appliedOverrideCodes ?? [],
    });
  }
  return {
    cells: matrix,
    entries,
    likelihoodLabels: data.riskMatrixConfig.likelihoodLabels.length
      ? Array.from(data.riskMatrixConfig.likelihoodLabels)
      : Array.from(LIKELIHOOD_LABELS),
    impactLabels: data.riskMatrixConfig.impactLabels.length
      ? Array.from(data.riskMatrixConfig.impactLabels)
      : Array.from(IMPACT_LABELS),
    emptyCaption: 'No risks recorded in the current envelope.',
    axisCaption:
      'Rows: likelihood (1-5). Columns: governing impact (1-5). Cell color reflects severity band.',
  };
}

function buildConstraintExposureMatrix(
  data: PccConstraintsLogReadModel,
): IPccClConstraintExposureMatrixViewModel {
  const matrix = emptyMatrix();
  const entries: IPccClConstraintPlotEntry[] = [];
  for (const c of data.constraintItems) {
    const ex = c.exposure;
    bumpMatrixCell(matrix, ex.urgency, ex.governingImpactScore, c.id);
    entries.push({
      id: c.id,
      itemNumber: c.itemNumber,
      title: c.title,
      urgency: ex.urgency,
      governingImpact: ex.governingImpactScore,
      score: ex.exposureScore,
      band: ex.band,
      bandLabel: bandLabel(ex.band),
      state: c.state,
      stateLabel: CONSTRAINT_STATE_LABELS[c.state],
      appliedOverrideCodes: ex.appliedOverrideCodes ?? [],
    });
  }
  return {
    cells: matrix,
    entries,
    urgencyLabels: data.riskMatrixConfig.urgencyLabels.length
      ? Array.from(data.riskMatrixConfig.urgencyLabels)
      : Array.from(URGENCY_LABELS),
    impactLabels: data.riskMatrixConfig.impactLabels.length
      ? Array.from(data.riskMatrixConfig.impactLabels)
      : Array.from(IMPACT_LABELS),
    emptyCaption: 'No constraints recorded in the current envelope.',
    axisCaption:
      'Rows: urgency (1-5). Columns: governing impact (1-5). Cell color reflects severity band.',
  };
}

// ---------------------------------------------------------------------------
// Lane: 5 — Log Table (union of risks + constraints)
// ---------------------------------------------------------------------------

function riskRow(
  r: RiskItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
): IPccClLogRow {
  const initial = r.initial;
  const effectiveBand = r.residual?.band ?? initial.band;
  return {
    id: r.id,
    kind: 'risk',
    itemNumber: r.itemNumber,
    itemTypeLabel: ITEM_TYPE_LABELS.risk,
    title: r.title,
    state: r.state,
    stateLabel: RISK_STATE_LABELS[r.state],
    band: effectiveBand,
    bandLabel: bandLabel(effectiveBand),
    score: r.residual?.residualRiskScore ?? initial.riskScore,
    seedCategoryLabel: seedLabels[r.seedCategoryId] ?? r.seedCategoryId,
    responsiblePartyDisplay: ownerDisplay(r.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(r.ballInCourt, 'Unassigned'),
    daysAgingFromIdentified: undefined,
    hasOverrides: (initial.appliedOverrideCodes ?? []).length > 0,
    hasResidualReduction: r.residual ? r.residual.residualRiskScore < initial.riskScore : false,
  };
}

function constraintRow(
  c: ConstraintItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
): IPccClLogRow {
  return {
    id: c.id,
    kind: 'constraint',
    itemNumber: c.itemNumber,
    itemTypeLabel: ITEM_TYPE_LABELS[c.type],
    title: c.title,
    state: c.state,
    stateLabel: CONSTRAINT_STATE_LABELS[c.state],
    band: c.exposure.band,
    bandLabel: bandLabel(c.exposure.band),
    score: c.exposure.exposureScore,
    seedCategoryLabel: seedLabels[c.seedCategoryId] ?? c.seedCategoryId,
    responsiblePartyDisplay: ownerDisplay(c.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(c.ballInCourt, 'Unassigned'),
    dueDateDisplay: formatDateDisplay(c.dueDateUtc),
    daysAgingFromIdentified: c.daysAgingFromIdentified,
    hasOverrides: (c.exposure.appliedOverrideCodes ?? []).length > 0,
    hasResidualReduction: false,
  };
}

function buildLogTable(data: PccConstraintsLogReadModel): IPccClLogTableViewModel {
  const seedLabels = makeSeedCategoryLookup(data.seedCategories);
  const rows: IPccClLogRow[] = [];
  for (const r of data.riskItems) rows.push(riskRow(r, seedLabels));
  for (const c of data.constraintItems) rows.push(constraintRow(c, seedLabels));
  return {
    rows,
    totalCount: rows.length,
    emptyCaption: 'No risks or constraints recorded in the current envelope.',
    definitionsCaption: LOG_DEFINITIONS_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Lane: 6 — Detail Panel entries (driven by local selection state)
// ---------------------------------------------------------------------------

function makeSeamRow(seamKind: PccClSeamKind, reference: string): IPccClReferenceSeamRow {
  return {
    seamKind,
    label: SEAM_KIND_DISPLAY_LABELS[seamKind],
    reference,
    referenceOnlyLabel: SEAM_KIND_LABELS[seamKind],
  };
}

function referenceSeamRows(
  seams: ConstraintsLogReferenceSeams,
  stateExtras: readonly { readonly seamKind: PccClSeamKind; readonly reference: string }[] = [],
): readonly IPccClReferenceSeamRow[] {
  const rows: IPccClReferenceSeamRow[] = [];
  const push = (seamKind: PccClSeamKind, ref: string | undefined): void => {
    if (ref) rows.push(makeSeamRow(seamKind, ref));
  };
  push('priority-actions-candidate', seams.priorityActionsCandidateRef);
  for (const evidenceRef of seams.documentControlEvidenceRefs ?? []) {
    rows.push(makeSeamRow('document-control-evidence', evidenceRef));
  }
  push('lifecycle-readiness-gate', seams.lifecycleReadinessGateRef);
  push('permit-inspection', seams.permitInspectionRef);
  push('responsibility-role', seams.responsibilityRoleRef);
  push('approval-checkpoint', seams.wave14ApprovalCheckpointRef);
  push('external-system-launcher', seams.externalSystemReferenceRef);
  push('scheduler-look-ahead', seams.schedulerLookAheadRef);
  push('team-access-role', seams.teamAccessRoleRef);
  push('project-readiness-source-module', seams.projectReadinessSourceModuleRef);
  for (const extra of stateExtras) {
    rows.push(makeSeamRow(extra.seamKind, extra.reference));
  }
  return rows;
}

function auditTrailFor(
  itemId: string,
  events: readonly ConstraintsLogAuditEvent[],
): readonly IPccClAuditEventRow[] {
  return events
    .filter((e) => e.entityRef === itemId)
    .map((e) => ({
      eventId: e.eventId,
      eventType: e.eventType,
      occurredAtDisplay: formatDateDisplay(e.occurredAtUtc) ?? '',
      summary: e.summary,
    }));
}

function riskDetail(
  r: RiskItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
  events: readonly ConstraintsLogAuditEvent[],
): IPccClDetailPanelEntry {
  const initial = r.initial;
  const effectiveBand = r.residual?.band ?? initial.band;
  const sourceLineageDisplay = `${r.sourceLineage.workbook} · ${r.sourceLineage.sheetSection} · ${r.sourceLineage.rowReference}`;
  const seamsExtra: { readonly seamKind: PccClSeamKind; readonly reference: string }[] =
    r.state === 'converted'
      ? [{ seamKind: 'converted-to-constraint', reference: r.convertedToConstraintId }]
      : [];
  return {
    id: r.id,
    kind: 'risk',
    itemNumber: r.itemNumber,
    itemTypeLabel: ITEM_TYPE_LABELS.risk,
    title: r.title,
    description: r.description,
    state: r.state,
    stateLabel: RISK_STATE_LABELS[r.state],
    band: effectiveBand,
    bandLabel: bandLabel(effectiveBand),
    score: r.residual?.residualRiskScore ?? initial.riskScore,
    governingImpact: initial.governingImpactScore,
    likelihoodOrUrgency: initial.likelihood,
    likelihoodOrUrgencyLabel: 'Likelihood',
    seedCategoryLabel: seedLabels[r.seedCategoryId] ?? r.seedCategoryId,
    responsiblePartyDisplay: ownerDisplay(r.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(r.ballInCourt, 'Unassigned'),
    dateIdentifiedDisplay: formatDateDisplay(r.dateIdentifiedUtc),
    needByDateDisplay: undefined,
    promisedDateDisplay: undefined,
    dueDateDisplay: undefined,
    daysAgingFromIdentified: undefined,
    mitigationPlanSummary: undefined,
    externalPartyReference: undefined,
    convertedToConstraintId: r.state === 'converted' ? r.convertedToConstraintId : undefined,
    residualScore: r.residual?.residualRiskScore,
    residualBand: r.residual?.band,
    residualBandLabel: r.residual ? bandLabel(r.residual.band) : undefined,
    mitigationRationale: r.residual?.mitigationRationale,
    appliedOverrideCodes: initial.appliedOverrideCodes ?? [],
    overrideRationale: initial.overrideRationale,
    sourceLineageDisplay,
    referenceSeams: referenceSeamRows(r, seamsExtra),
    auditTrail: auditTrailFor(r.id, events),
    boundaryCaption: LEGAL_BOUNDARY_CAPTION,
  };
}

function constraintDetail(
  c: ConstraintItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
  events: readonly ConstraintsLogAuditEvent[],
): IPccClDetailPanelEntry {
  const sourceLineageDisplay = `${c.sourceLineage.workbook} · ${c.sourceLineage.sheetSection} · ${c.sourceLineage.rowReference}`;
  const seamsExtra: { readonly seamKind: PccClSeamKind; readonly reference: string }[] =
    c.state === 'awaiting-external-party'
      ? [{ seamKind: 'external-party-reference', reference: c.externalPartyReference }]
      : [];
  return {
    id: c.id,
    kind: 'constraint',
    itemNumber: c.itemNumber,
    itemTypeLabel: ITEM_TYPE_LABELS[c.type],
    title: c.title,
    description: c.description,
    state: c.state,
    stateLabel: CONSTRAINT_STATE_LABELS[c.state],
    band: c.exposure.band,
    bandLabel: bandLabel(c.exposure.band),
    score: c.exposure.exposureScore,
    governingImpact: c.exposure.governingImpactScore,
    likelihoodOrUrgency: c.exposure.urgency,
    likelihoodOrUrgencyLabel: 'Urgency',
    seedCategoryLabel: seedLabels[c.seedCategoryId] ?? c.seedCategoryId,
    responsiblePartyDisplay: ownerDisplay(c.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(c.ballInCourt, 'Unassigned'),
    dateIdentifiedDisplay: formatDateDisplay(c.dateIdentifiedUtc),
    needByDateDisplay: formatDateDisplay(c.needByDateUtc),
    promisedDateDisplay: formatDateDisplay(c.promisedDateUtc),
    dueDateDisplay: formatDateDisplay(c.dueDateUtc),
    daysAgingFromIdentified: c.daysAgingFromIdentified,
    mitigationPlanSummary: c.mitigationPlanSummary,
    externalPartyReference:
      c.state === 'awaiting-external-party' ? c.externalPartyReference : undefined,
    convertedToConstraintId: undefined,
    residualScore: undefined,
    residualBand: undefined,
    residualBandLabel: undefined,
    mitigationRationale: undefined,
    appliedOverrideCodes: c.exposure.appliedOverrideCodes ?? [],
    overrideRationale: c.exposure.overrideRationale,
    sourceLineageDisplay,
    referenceSeams: referenceSeamRows(c, seamsExtra),
    auditTrail: auditTrailFor(c.id, events),
    boundaryCaption: LEGAL_BOUNDARY_CAPTION,
  };
}

function buildDetailPanel(data: PccConstraintsLogReadModel): IPccClDetailPanelViewModel {
  const seedLabels = makeSeedCategoryLookup(data.seedCategories);
  const entries = new Map<string, IPccClDetailPanelEntry>();
  for (const r of data.riskItems) entries.set(r.id, riskDetail(r, seedLabels, data.auditEvents));
  for (const c of data.constraintItems)
    entries.set(c.id, constraintDetail(c, seedLabels, data.auditEvents));
  const defaultEntryId = data.riskItems[0]?.id ?? data.constraintItems[0]?.id;
  return {
    entries,
    defaultEntryId,
    emptyCaption: 'No detail records available in the current envelope.',
  };
}

// ---------------------------------------------------------------------------
// Lane: 7 — Weekly Huddle
// ---------------------------------------------------------------------------

function huddleEntryFromRisk(
  r: RiskItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
): IPccClHuddleEntry {
  void seedLabels;
  const band = r.residual?.band ?? r.initial.band;
  return {
    id: r.id,
    kind: 'risk',
    itemNumber: r.itemNumber,
    title: r.title,
    band,
    bandLabel: bandLabel(band),
    stateLabel: RISK_STATE_LABELS[r.state],
    responsiblePartyDisplay: ownerDisplay(r.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(r.ballInCourt, 'Unassigned'),
  };
}

function huddleEntryFromConstraint(
  c: ConstraintItem,
  seedLabels: Readonly<Record<ConstraintsLogSeedCategoryId, string>>,
): IPccClHuddleEntry {
  void seedLabels;
  return {
    id: c.id,
    kind: 'constraint',
    itemNumber: c.itemNumber,
    title: c.title,
    band: c.exposure.band,
    bandLabel: bandLabel(c.exposure.band),
    stateLabel: CONSTRAINT_STATE_LABELS[c.state],
    responsiblePartyDisplay: ownerDisplay(c.responsibleParty, 'Unassigned'),
    ballInCourtDisplay: ownerDisplay(c.ballInCourt, 'Unassigned'),
    dueDateDisplay: formatDateDisplay(c.dueDateUtc),
  };
}

const HIGH_EXPOSURE_BANDS: readonly SeverityBandKey[] = ['high', 'very-high', 'critical'];

function buildWeeklyHuddle(data: PccConstraintsLogReadModel): IPccClWeeklyHuddleViewModel {
  const seedLabels = makeSeedCategoryLookup(data.seedCategories);

  const openCommitments: IPccClHuddleEntry[] = data.constraintItems
    .filter(
      (c) => c.state === 'in-progress' || c.state === 'action-planned' || c.state === 'at-risk',
    )
    .map((c) => huddleEntryFromConstraint(c, seedLabels));

  const overdue: IPccClHuddleEntry[] = data.constraintItems
    .filter((c) => c.state === 'overdue')
    .map((c) => huddleEntryFromConstraint(c, seedLabels));

  const awaiting: IPccClHuddleEntry[] = data.constraintItems
    .filter((c) => c.state === 'awaiting-external-party')
    .map((c) => huddleEntryFromConstraint(c, seedLabels));

  const triggered: IPccClHuddleEntry[] = data.riskItems
    .filter((r) => r.state === 'triggered' || r.state === 'monitoring')
    .map((r) => huddleEntryFromRisk(r, seedLabels));

  const highExposure: IPccClHuddleEntry[] = [
    ...data.riskItems
      .filter((r) => HIGH_EXPOSURE_BANDS.includes(r.residual?.band ?? r.initial.band))
      .map((r) => huddleEntryFromRisk(r, seedLabels)),
    ...data.constraintItems
      .filter((c) => HIGH_EXPOSURE_BANDS.includes(c.exposure.band))
      .map((c) => huddleEntryFromConstraint(c, seedLabels)),
  ];

  const sections: IPccClWeeklyHuddleSection[] = [
    { key: 'open-commitments', label: 'Open commitments', entries: openCommitments },
    { key: 'overdue', label: 'Overdue', entries: overdue },
    { key: 'awaiting-external-party', label: 'Awaiting external party', entries: awaiting },
    { key: 'triggered-risks', label: 'Triggered or monitoring risks', entries: triggered },
    { key: 'high-exposure', label: 'High exposure', entries: highExposure },
  ];

  return {
    sections,
    priorityActionsCandidateCount: data.exposureSummary.priorityActionsCandidateCount,
    emptyCaption: 'No active items for the weekly huddle in the current envelope.',
    cadenceCaption: HUDDLE_CADENCE_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Lane: 8 — Root Cause & Lessons Learned
// ---------------------------------------------------------------------------

function highestBandIn(bands: readonly SeverityBandKey[]): SeverityBandKey {
  const rank: Readonly<Record<SeverityBandKey, number>> = {
    low: 0,
    moderate: 1,
    high: 2,
    'very-high': 3,
    critical: 4,
  };
  let best: SeverityBandKey = 'low';
  for (const b of bands) if (rank[b] > rank[best]) best = b;
  return best;
}

function buildRootCauseLessonsLearned(
  data: PccConstraintsLogReadModel,
): IPccClRootCauseLessonsLearnedViewModel {
  const seedLabels = makeSeedCategoryLookup(data.seedCategories);
  const trends = new Map<
    ConstraintsLogSeedCategoryId,
    { riskCount: number; constraintCount: number; bands: SeverityBandKey[] }
  >();
  for (const r of data.riskItems) {
    const bucket = trends.get(r.seedCategoryId) ?? { riskCount: 0, constraintCount: 0, bands: [] };
    bucket.riskCount += 1;
    bucket.bands.push(r.residual?.band ?? r.initial.band);
    trends.set(r.seedCategoryId, bucket);
  }
  for (const c of data.constraintItems) {
    const bucket = trends.get(c.seedCategoryId) ?? { riskCount: 0, constraintCount: 0, bands: [] };
    bucket.constraintCount += 1;
    bucket.bands.push(c.exposure.band);
    trends.set(c.seedCategoryId, bucket);
  }
  const categoryTrends: IPccClCategoryTrendRow[] = Array.from(trends.entries()).map(
    ([id, bucket]) => {
      const highest = highestBandIn(bucket.bands);
      return {
        seedCategoryId: id,
        seedCategoryLabel: seedLabels[id] ?? id,
        riskCount: bucket.riskCount,
        constraintCount: bucket.constraintCount,
        highestBand: highest,
        highestBandLabel: bandLabel(highest),
      };
    },
  );

  const overrideUsage = buildOverrideUsage(data);

  const residualDeltas: IPccClResidualDeltaRow[] = data.riskItems
    .filter((r) => r.residual && r.residual.residualRiskScore < r.initial.riskScore)
    .map((r) => ({
      id: r.id,
      itemNumber: r.itemNumber,
      title: r.title,
      initialScore: r.initial.riskScore,
      residualScore: (r.residual as ResidualRiskAssessment).residualRiskScore,
      delta: r.initial.riskScore - (r.residual as ResidualRiskAssessment).residualRiskScore,
      mitigationRationale:
        (r.residual as ResidualRiskAssessment).mitigationRationale ??
        'Mitigation rationale not recorded in the envelope.',
    }));

  return {
    categoryTrends,
    overrideUsage,
    residualDeltas,
    boundaryCaption: LEGAL_BOUNDARY_CAPTION,
    emptyCaption: 'No category trends recorded in the current envelope.',
  };
}

function buildOverrideUsage(data: PccConstraintsLogReadModel): readonly IPccClOverrideUsageRow[] {
  const counts = new Map<SeverityOverrideCode, number>();
  const bumpAll = (codes: readonly SeverityOverrideCode[] | undefined): void => {
    for (const code of codes ?? []) counts.set(code, (counts.get(code) ?? 0) + 1);
  };
  for (const r of data.riskItems) bumpAll(r.initial.appliedOverrideCodes);
  for (const c of data.constraintItems) bumpAll(c.exposure.appliedOverrideCodes);
  const out: IPccClOverrideUsageRow[] = [];
  for (const [code, count] of counts.entries()) {
    const rule: SeverityOverrideRule | undefined = data.overrideRules[code];
    out.push({ code, label: rule?.label ?? code, count });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lane: 9 — Executive Exposure Summary
// ---------------------------------------------------------------------------

function buildExecutiveExposureSummary(
  data: PccConstraintsLogReadModel,
): IPccClExecutiveExposureSummaryViewModel {
  const summary = data.exposureSummary;
  const bandRows: IPccClExecutiveBandRow[] = SEVERITY_BAND_KEYS.map((band) => ({
    band,
    bandLabel: bandLabel(band),
    riskCount: summary.riskCountsByBand[band] ?? 0,
    constraintCount: summary.constraintCountsByBand[band] ?? 0,
    totalCount: (summary.riskCountsByBand[band] ?? 0) + (summary.constraintCountsByBand[band] ?? 0),
  }));
  const totalCriticalCount =
    (summary.riskCountsByBand.critical ?? 0) + (summary.constraintCountsByBand.critical ?? 0);
  const totalVeryHighCount =
    (summary.riskCountsByBand['very-high'] ?? 0) +
    (summary.constraintCountsByBand['very-high'] ?? 0);
  const latestSnapshot = data.snapshotHistory.length
    ? data.snapshotHistory[data.snapshotHistory.length - 1]
    : undefined;
  const posture = data.sourcePosture;
  const confidenceLabel = posture.confidence
    ? `${posture.confidence[0].toUpperCase()}${posture.confidence.slice(1)}`
    : 'Unknown';
  return {
    bandRows,
    totalCriticalCount,
    totalVeryHighCount,
    snapshotDisplay: latestSnapshot
      ? `Snapshot ${latestSnapshot.snapshotId} · ${formatDateDisplay(latestSnapshot.generatedAtUtc) ?? ''}`
      : undefined,
    confidenceLabel,
    boundaryCaption: LEGAL_BOUNDARY_CAPTION,
    headlineCaption: EXEC_HEADLINE_CAPTION,
  };
}

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

export function buildPccConstraintsLogViewModel(
  envelope: PccReadModelEnvelope<PccConstraintsLogReadModel>,
): IPccConstraintsLogViewModel {
  const sourceStatus = envelope.sourceStatus;
  const cardState = toCardState(sourceStatus);
  const data = envelope.data;
  return {
    status: 'ready',
    cardState,
    sourceStatus,
    moduleIdentity: data.moduleIdentity,
    commandCenter: buildCommandCenter(data),
    makeReadyBoard: buildMakeReadyBoard(data),
    riskMatrix: buildRiskMatrix(data),
    constraintExposureMatrix: buildConstraintExposureMatrix(data),
    logTable: buildLogTable(data),
    detailPanel: buildDetailPanel(data),
    weeklyHuddle: buildWeeklyHuddle(data),
    rootCauseLessonsLearned: buildRootCauseLessonsLearned(data),
    executiveExposureSummary: buildExecutiveExposureSummary(data),
  };
}

// `EXPOSURE_BANDS` is referenced by sibling tests and the executive lane via
// the envelope. Re-exported here so consumers can read the canonical band
// definitions through the adapter module without re-importing from
// `@hbc/models/pcc`.
export { EXPOSURE_BANDS };
export type {
  ConstraintExposureAssessment,
  ConstraintItem,
  ConstraintsLogAuditEvent,
  RiskItem,
  RiskScoreAssessment,
  ResidualRiskAssessment,
};
