/**
 * PCC Constraints Log view-model contract (Phase 3 / Wave 12 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccConstraintsLogViewModel`. The
 * view-model is a discriminated union (`loading` / `error` / `ready`) that
 * mirrors `IPccResponsibilityMatrixViewModel`. Each lane carries the data
 * its dedicated card needs without re-walking the read-model.
 *
 * The narrow read-model client interface lists only `getConstraintsLog`
 * so non-api consumers can type the client prop without crossing the
 * controlled-consumption guard.
 */

import type {
  ConstraintExposureAssessment,
  ConstraintItem,
  ConstraintState,
  ConstraintsLogAuditEvent,
  ConstraintsLogExposureSummary,
  ConstraintsLogModuleIdentity,
  ConstraintsLogSeedCategoryId,
  ImpactLevel,
  LikelihoodLevel,
  PccConstraintsLogReadModel,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  RiskItem,
  RiskScoreAssessment,
  ResidualRiskAssessment,
  SeverityBandKey,
  SeverityOverrideCode,
  UrgencyLevel,
} from '@hbc/models/pcc';
import type { PccCardState } from '../projectHome/shared.js';

// ---------------------------------------------------------------------------
// Narrow read-model client interface — single method
// ---------------------------------------------------------------------------

export interface IPccConstraintsLogReadModelClient {
  getConstraintsLog(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccConstraintsLogReadModel>>;
}

// ---------------------------------------------------------------------------
// Lane: 1 — Command Center
// ---------------------------------------------------------------------------

export interface IPccClBandCount {
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly count: number;
}

export interface IPccClSourcePostureViewModel {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidenceLabel: string;
  readonly lastIngestedDisplay: string;
  readonly pendingHumanReviewCount: number;
  readonly captionLine: string;
}

export interface IPccClCommandCenterViewModel {
  readonly readOnlyCaption: string;
  readonly noExecutionCaption: string;
  readonly riskBandCounts: readonly IPccClBandCount[];
  readonly constraintBandCounts: readonly IPccClBandCount[];
  readonly overdueConstraintCount: number;
  readonly awaitingExternalPartyCount: number;
  readonly delayExposureReviewQueueCount: number;
  readonly changeExposureReviewQueueCount: number;
  readonly priorityActionsCandidateCount: number;
  readonly sourcePosture: IPccClSourcePostureViewModel;
  readonly latestSnapshotDisplay?: string;
}

// ---------------------------------------------------------------------------
// Lane: 2 — Make-Ready Board
// ---------------------------------------------------------------------------

export interface IPccClBoardCardEntry {
  readonly id: string;
  readonly itemNumber: number;
  readonly title: string;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly responsiblePartyDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly dueDateDisplay?: string;
  readonly seedCategoryLabel: string;
}

export interface IPccClMakeReadyBoardColumn {
  readonly state: ConstraintState;
  readonly stateLabel: string;
  readonly entries: readonly IPccClBoardCardEntry[];
}

export interface IPccClMakeReadyBoardViewModel {
  readonly columns: readonly IPccClMakeReadyBoardColumn[];
  readonly totalConstraints: number;
  readonly emptyCaption: string;
  readonly definitionsCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 3 — Risk Matrix (5x5 likelihood × governing impact)
// ---------------------------------------------------------------------------

export interface IPccClMatrixCell {
  readonly likelihood: LikelihoodLevel;
  readonly impact: ImpactLevel;
  readonly band: SeverityBandKey;
  readonly score: number;
  readonly count: number;
  readonly itemIds: readonly string[];
}

export interface IPccClRiskPlotEntry {
  readonly id: string;
  readonly itemNumber: number;
  readonly title: string;
  readonly likelihood: LikelihoodLevel;
  readonly governingImpact: ImpactLevel;
  readonly score: number;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly residualScore?: number;
  readonly residualBand?: SeverityBandKey;
  readonly appliedOverrideCodes: readonly SeverityOverrideCode[];
}

export interface IPccClRiskMatrixViewModel {
  readonly cells: readonly (readonly IPccClMatrixCell[])[];
  readonly entries: readonly IPccClRiskPlotEntry[];
  readonly likelihoodLabels: readonly string[];
  readonly impactLabels: readonly string[];
  readonly emptyCaption: string;
  readonly axisCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 4 — Constraint Exposure Matrix (5x5 urgency × governing impact)
// ---------------------------------------------------------------------------

export interface IPccClConstraintPlotEntry {
  readonly id: string;
  readonly itemNumber: number;
  readonly title: string;
  readonly urgency: UrgencyLevel;
  readonly governingImpact: ImpactLevel;
  readonly score: number;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly state: ConstraintState;
  readonly stateLabel: string;
  readonly appliedOverrideCodes: readonly SeverityOverrideCode[];
}

export interface IPccClConstraintExposureMatrixViewModel {
  readonly cells: readonly (readonly IPccClMatrixCell[])[];
  readonly entries: readonly IPccClConstraintPlotEntry[];
  readonly urgencyLabels: readonly string[];
  readonly impactLabels: readonly string[];
  readonly emptyCaption: string;
  readonly axisCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 5 — Log Table (union of risks + constraints)
// ---------------------------------------------------------------------------

export type PccClLogRowKind = 'risk' | 'constraint';

export interface IPccClLogRow {
  readonly id: string;
  readonly kind: PccClLogRowKind;
  readonly itemNumber: number;
  readonly itemTypeLabel: string;
  readonly title: string;
  readonly state: string;
  readonly stateLabel: string;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly score: number;
  readonly seedCategoryLabel: string;
  readonly responsiblePartyDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly dueDateDisplay?: string;
  readonly daysAgingFromIdentified?: number;
  readonly hasOverrides: boolean;
  readonly hasResidualReduction: boolean;
}

export interface IPccClLogTableViewModel {
  readonly rows: readonly IPccClLogRow[];
  readonly totalCount: number;
  readonly emptyCaption: string;
  readonly definitionsCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 6 — Detail Panel (driven by local selection state in the regions
// component; the view-model exposes the full record set so the panel can
// resolve the selected id to a record without re-walking the envelope)
// ---------------------------------------------------------------------------

export interface IPccClDetailPanelEntry {
  readonly id: string;
  readonly kind: PccClLogRowKind;
  readonly itemNumber: number;
  readonly itemTypeLabel: string;
  readonly title: string;
  readonly description: string;
  readonly state: string;
  readonly stateLabel: string;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly score: number;
  readonly governingImpact: ImpactLevel;
  readonly likelihoodOrUrgency: number;
  readonly likelihoodOrUrgencyLabel: string;
  readonly seedCategoryLabel: string;
  readonly responsiblePartyDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly dateIdentifiedDisplay?: string;
  readonly needByDateDisplay?: string;
  readonly promisedDateDisplay?: string;
  readonly dueDateDisplay?: string;
  readonly daysAgingFromIdentified?: number;
  readonly mitigationPlanSummary?: string;
  readonly externalPartyReference?: string;
  readonly convertedToConstraintId?: string;
  readonly residualScore?: number;
  readonly residualBand?: SeverityBandKey;
  readonly residualBandLabel?: string;
  readonly mitigationRationale?: string;
  readonly appliedOverrideCodes: readonly SeverityOverrideCode[];
  readonly overrideRationale?: string;
  readonly sourceLineageDisplay: string;
  readonly referenceSeams: readonly IPccClReferenceSeamRow[];
  readonly auditTrail: readonly IPccClAuditEventRow[];
  readonly boundaryCaption: string;
}

export interface IPccClReferenceSeamRow {
  readonly label: string;
  readonly reference: string;
}

export interface IPccClAuditEventRow {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAtDisplay: string;
  readonly summary: string;
}

export interface IPccClDetailPanelViewModel {
  readonly entries: ReadonlyMap<string, IPccClDetailPanelEntry>;
  readonly defaultEntryId?: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 7 — Weekly Huddle
// ---------------------------------------------------------------------------

export interface IPccClHuddleEntry {
  readonly id: string;
  readonly kind: PccClLogRowKind;
  readonly itemNumber: number;
  readonly title: string;
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly stateLabel: string;
  readonly responsiblePartyDisplay: string;
  readonly ballInCourtDisplay: string;
  readonly dueDateDisplay?: string;
}

export interface IPccClWeeklyHuddleSection {
  readonly key:
    | 'open-commitments'
    | 'overdue'
    | 'awaiting-external-party'
    | 'high-exposure'
    | 'triggered-risks';
  readonly label: string;
  readonly entries: readonly IPccClHuddleEntry[];
}

export interface IPccClWeeklyHuddleViewModel {
  readonly sections: readonly IPccClWeeklyHuddleSection[];
  readonly priorityActionsCandidateCount: number;
  readonly emptyCaption: string;
  readonly cadenceCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 8 — Root Cause & Lessons Learned
// ---------------------------------------------------------------------------

export interface IPccClCategoryTrendRow {
  readonly seedCategoryId: ConstraintsLogSeedCategoryId;
  readonly seedCategoryLabel: string;
  readonly riskCount: number;
  readonly constraintCount: number;
  readonly highestBand: SeverityBandKey;
  readonly highestBandLabel: string;
}

export interface IPccClOverrideUsageRow {
  readonly code: SeverityOverrideCode;
  readonly label: string;
  readonly count: number;
}

export interface IPccClResidualDeltaRow {
  readonly id: string;
  readonly itemNumber: number;
  readonly title: string;
  readonly initialScore: number;
  readonly residualScore: number;
  readonly delta: number;
  readonly mitigationRationale: string;
}

export interface IPccClRootCauseLessonsLearnedViewModel {
  readonly categoryTrends: readonly IPccClCategoryTrendRow[];
  readonly overrideUsage: readonly IPccClOverrideUsageRow[];
  readonly residualDeltas: readonly IPccClResidualDeltaRow[];
  readonly boundaryCaption: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 9 — Executive Exposure Summary
// ---------------------------------------------------------------------------

export interface IPccClExecutiveBandRow {
  readonly band: SeverityBandKey;
  readonly bandLabel: string;
  readonly riskCount: number;
  readonly constraintCount: number;
  readonly totalCount: number;
}

export interface IPccClExecutiveExposureSummaryViewModel {
  readonly bandRows: readonly IPccClExecutiveBandRow[];
  readonly totalCriticalCount: number;
  readonly totalVeryHighCount: number;
  readonly snapshotDisplay?: string;
  readonly confidenceLabel: string;
  readonly boundaryCaption: string;
  readonly headlineCaption: string;
}

// ---------------------------------------------------------------------------
// Discriminated union exported as the surface contract
// ---------------------------------------------------------------------------

export type IPccConstraintsLogViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'ready';
      readonly cardState: PccCardState;
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly moduleIdentity: ConstraintsLogModuleIdentity;
      readonly commandCenter: IPccClCommandCenterViewModel;
      readonly makeReadyBoard: IPccClMakeReadyBoardViewModel;
      readonly riskMatrix: IPccClRiskMatrixViewModel;
      readonly constraintExposureMatrix: IPccClConstraintExposureMatrixViewModel;
      readonly logTable: IPccClLogTableViewModel;
      readonly detailPanel: IPccClDetailPanelViewModel;
      readonly weeklyHuddle: IPccClWeeklyHuddleViewModel;
      readonly rootCauseLessonsLearned: IPccClRootCauseLessonsLearnedViewModel;
      readonly executiveExposureSummary: IPccClExecutiveExposureSummaryViewModel;
    };

// ---------------------------------------------------------------------------
// Re-exported model types for downstream consumers
// ---------------------------------------------------------------------------

export type {
  ConstraintExposureAssessment,
  ConstraintItem,
  ConstraintsLogAuditEvent,
  ConstraintsLogExposureSummary,
  RiskItem,
  RiskScoreAssessment,
  ResidualRiskAssessment,
};
