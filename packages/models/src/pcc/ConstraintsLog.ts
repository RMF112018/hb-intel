/**
 * PCC Constraints Log — shared model contracts.
 *
 * Phase 3 / Wave 12 / Prompt 02. No runtime behavior, no I/O, no clients,
 * no providers, no external system imports. The module exposes vocabulary
 * tuples (`as const`), discriminated-union item shapes, deterministic
 * pure utilities for governing-impact / risk / constraint-exposure
 * scoring, raise-only severity override semantics with rationale
 * enforcement, explicit allowed-transition maps for risk and constraint
 * states, and a read-model envelope contract. SPFx UI, backend routes,
 * and provider implementations are downstream prompt scope.
 *
 * Authority:
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Constraints_Log_Target_Architecture.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Constraints_Log_Scope_Lock.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Risk_And_Constraint_Exposure_Model.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Resolved_Decisions_Register.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Workbook_Source_Mapping.md
 *
 * Locked decisions:
 *   - The user-facing module title is "Constraints Log"; subtitle is
 *     "Make-Ready Constraint & Risk Exposure Center". The read-model key
 *     registered in `PccReadModelResponseMap` is `constraints-log`.
 *   - Source-model placement is intentional dual posture (Wave 12
 *     Prompt 01 audit, Path B): `constraints-log` is registered against
 *     work-center `risk-issues-decision` AND is a Project Readiness
 *     source module. Both registrations are authoritative; tests pin
 *     the dual posture so it is captured rather than silently ignored.
 *   - Governing impact rule: `governingImpactScore = max(impactDimensionScores)`.
 *   - Risk score = likelihood * governing impact (5x5 matrix, 1..25).
 *   - Constraint exposure score = urgency * governing impact (1..25).
 *   - Severity bands: 1-4 low, 5-9 moderate, 10-14 high, 15-19 very-high,
 *     20-25 critical.
 *   - Severity overrides may raise a band but never reduce one. Applying
 *     any override requires non-empty rationale.
 *   - Residual risk reduction (residual < initial) is permitted only
 *     when mitigation rationale is present. Maintaining or raising
 *     residual relative to initial requires no rationale.
 *
 * Guardrails:
 *   - No legal advice, claim entitlement, compensability determination,
 *     delay damages calculation, notice sufficiency decision, or
 *     forensic schedule analysis. Delay-exposure and change-exposure
 *     are review flags only; they are not entitlement determinations.
 *   - No external runtime (Microsoft Graph, SharePoint REST, PnP,
 *     Procore, Sage, Primavera/P6, Autodesk, AHJ portals, utility
 *     portals, Document Crunch, Adobe Sign).
 *   - No backend write routes, no approval execution (Wave 14 owns
 *     approvals/checkpoints), no scheduler mutation, no evidence
 *     binary upload/download/sync/storage. Evidence is reference-only.
 *
 * @module pcc/ConstraintsLog
 */

import type { PccReadModelSourceStatus } from './PccReadModels.js';
import type { ProjectReadinessConfidenceState } from './ProjectReadinessFramework.js';
import type { PccProjectId } from './types.js';

// ---------------------------------------------------------------------------
// Item types. Risks and constraints are first-class authored records.
// `issue` records active problems; `delay-exposure` and `change-exposure`
// are review flags only and never entitlement / compensability outputs.
// ---------------------------------------------------------------------------

export const CONSTRAINTS_LOG_ITEM_TYPES = [
  'risk',
  'constraint',
  'issue',
  'delay-exposure',
  'change-exposure',
] as const;
export type ConstraintsLogItemType = (typeof CONSTRAINTS_LOG_ITEM_TYPES)[number];

// ---------------------------------------------------------------------------
// Eight impact dimensions per Wave 12 risk/exposure model. Each receives a
// 1..5 score; `governingImpactScore` is the maximum across dimensions.
// ---------------------------------------------------------------------------

export const IMPACT_DIMENSION_IDS = [
  'schedule',
  'cost',
  'safety',
  'quality',
  'contract-compliance',
  'client-owner-impact',
  'logistics-access',
  'reputation-executive-visibility',
] as const;
export type ImpactDimensionId = (typeof IMPACT_DIMENSION_IDS)[number];

export const SCORE_LEVELS = [1, 2, 3, 4, 5] as const;
export type ScoreLevel = (typeof SCORE_LEVELS)[number];
export type LikelihoodLevel = ScoreLevel;
export type ImpactLevel = ScoreLevel;
export type UrgencyLevel = ScoreLevel;

export interface ImpactScores {
  readonly schedule: ImpactLevel;
  readonly cost: ImpactLevel;
  readonly safety: ImpactLevel;
  readonly quality: ImpactLevel;
  readonly contractCompliance: ImpactLevel;
  readonly clientOwnerImpact: ImpactLevel;
  readonly logisticsAccess: ImpactLevel;
  readonly reputationExecutiveVisibility: ImpactLevel;
}

// ---------------------------------------------------------------------------
// Likelihood / impact / urgency scale labels. Documentation-only; helpers
// operate on numeric levels.
// ---------------------------------------------------------------------------

export const LIKELIHOOD_LABELS = [
  'rare',
  'unlikely',
  'possible',
  'likely',
  'almost-certain',
] as const;
export type LikelihoodLabel = (typeof LIKELIHOOD_LABELS)[number];

export const IMPACT_LABELS = [
  'negligible',
  'minor',
  'moderate',
  'major',
  'severe',
] as const;
export type ImpactLabel = (typeof IMPACT_LABELS)[number];

export const URGENCY_LABELS = [
  'watchlist',
  'near-term',
  'active-planning-pressure',
  'imminent-blocker',
  'critical-blocker',
] as const;
export type UrgencyLabel = (typeof URGENCY_LABELS)[number];

// ---------------------------------------------------------------------------
// Severity bands. Score-to-band mapping is fixed by the Wave 12 spec.
// ---------------------------------------------------------------------------

export const SEVERITY_BAND_KEYS = [
  'low',
  'moderate',
  'high',
  'very-high',
  'critical',
] as const;
export type SeverityBandKey = (typeof SEVERITY_BAND_KEYS)[number];

const SEVERITY_BAND_RANK: Readonly<Record<SeverityBandKey, number>> = {
  low: 0,
  moderate: 1,
  high: 2,
  'very-high': 3,
  critical: 4,
};

export interface ExposureBandDefinition {
  readonly key: SeverityBandKey;
  readonly minScoreInclusive: number;
  readonly maxScoreInclusive: number;
  readonly requiredAction: string;
}

export const EXPOSURE_BANDS: readonly ExposureBandDefinition[] = [
  {
    key: 'low',
    minScoreInclusive: 1,
    maxScoreInclusive: 4,
    requiredAction: 'Assign owner; monitor on cadence; maintain notes.',
  },
  {
    key: 'moderate',
    minScoreInclusive: 5,
    maxScoreInclusive: 9,
    requiredAction: 'Assign owner and due date; add mitigation action; weekly review.',
  },
  {
    key: 'high',
    minScoreInclusive: 10,
    maxScoreInclusive: 14,
    requiredAction:
      'Escalate to Priority Actions; define mitigation plan; twice-weekly review.',
  },
  {
    key: 'very-high',
    minScoreInclusive: 15,
    maxScoreInclusive: 19,
    requiredAction:
      'Leadership review; immediate unblock plan; daily tracking until stabilized.',
  },
  {
    key: 'critical',
    minScoreInclusive: 20,
    maxScoreInclusive: 25,
    requiredAction:
      'Executive escalation; immediate response plan; active blocker management with daily command review.',
  },
];

// ---------------------------------------------------------------------------
// Severity override rules. Overrides may raise a band; reductions are
// disallowed.
// ---------------------------------------------------------------------------

export const SEVERITY_OVERRIDE_CODES = [
  'regulatory-permitting-deadline',
  'contractual-milestone-exposure',
  'multi-path-dependency-block',
  'unresolved-escalation-sla-breach',
  'executive-directed-cross-project',
  'safety-immediate-command-attention',
] as const;
export type SeverityOverrideCode = (typeof SEVERITY_OVERRIDE_CODES)[number];

export interface SeverityOverrideRule {
  readonly code: SeverityOverrideCode;
  readonly label: string;
  readonly minBandAfterOverride: SeverityBandKey;
}

export const SEVERITY_OVERRIDE_RULES: Readonly<
  Record<SeverityOverrideCode, SeverityOverrideRule>
> = {
  'regulatory-permitting-deadline': {
    code: 'regulatory-permitting-deadline',
    label: 'Regulatory or permitting deadline jeopardy',
    minBandAfterOverride: 'high',
  },
  'contractual-milestone-exposure': {
    code: 'contractual-milestone-exposure',
    label: 'Contractual milestone exposure with immediate delivery risk',
    minBandAfterOverride: 'high',
  },
  'multi-path-dependency-block': {
    code: 'multi-path-dependency-block',
    label: 'Multi-path dependency block affecting multiple crews or trades',
    minBandAfterOverride: 'high',
  },
  'unresolved-escalation-sla-breach': {
    code: 'unresolved-escalation-sla-breach',
    label: 'Repeated unresolved escalation beyond defined SLA window',
    minBandAfterOverride: 'very-high',
  },
  'executive-directed-cross-project': {
    code: 'executive-directed-cross-project',
    label: 'Executive-directed escalation due to cross-project impact',
    minBandAfterOverride: 'very-high',
  },
  'safety-immediate-command-attention': {
    code: 'safety-immediate-command-attention',
    label: 'Explicit safety exposure requiring immediate command attention',
    minBandAfterOverride: 'critical',
  },
};

// ---------------------------------------------------------------------------
// Risk and constraint state vocabularies and explicit allowed-transition
// maps. Maps are exhaustive; helpers below validate transitions.
// ---------------------------------------------------------------------------

export const RISK_STATES = [
  'draft',
  'identified',
  'assessed',
  'response-planned',
  'monitoring',
  'triggered',
  'converted',
  'closed',
  'retired',
] as const;
export type RiskState = (typeof RISK_STATES)[number];

export const RISK_ALLOWED_TRANSITIONS: Readonly<Record<RiskState, readonly RiskState[]>> = {
  draft: ['identified', 'retired'],
  identified: ['assessed', 'retired'],
  assessed: ['response-planned', 'monitoring', 'retired'],
  'response-planned': ['monitoring', 'triggered', 'retired'],
  monitoring: ['triggered', 'closed', 'retired'],
  triggered: ['converted', 'closed', 'retired'],
  converted: [],
  closed: [],
  retired: [],
};

export const CONSTRAINT_STATES = [
  'draft',
  'identified',
  'accepted',
  'action-planned',
  'in-progress',
  'awaiting-external-party',
  'at-risk',
  'overdue',
  'resolved-pending-validation',
  'resolved',
] as const;
export type ConstraintState = (typeof CONSTRAINT_STATES)[number];

export const CONSTRAINT_ALLOWED_TRANSITIONS: Readonly<
  Record<ConstraintState, readonly ConstraintState[]>
> = {
  draft: ['identified'],
  identified: ['accepted'],
  accepted: ['action-planned'],
  'action-planned': ['in-progress', 'awaiting-external-party', 'at-risk', 'overdue'],
  'in-progress': [
    'awaiting-external-party',
    'at-risk',
    'overdue',
    'resolved-pending-validation',
  ],
  'awaiting-external-party': [
    'in-progress',
    'at-risk',
    'overdue',
    'resolved-pending-validation',
  ],
  'at-risk': [
    'in-progress',
    'awaiting-external-party',
    'overdue',
    'resolved-pending-validation',
  ],
  overdue: [
    'in-progress',
    'awaiting-external-party',
    'at-risk',
    'resolved-pending-validation',
  ],
  'resolved-pending-validation': ['resolved', 'at-risk'],
  resolved: [],
};

// ---------------------------------------------------------------------------
// Workbook seed categories. Workbook rows seed the taxonomy only; no row
// becomes an active default constraint at runtime.
// ---------------------------------------------------------------------------

export const CONSTRAINTS_LOG_SEED_CATEGORY_IDS = [
  'permits',
  'ahj-coordination',
  'design-development',
  'utility-service-providers',
  'hb-internal-coordination',
  'construction-progress',
  'placeholder-new-section',
  'change-tracking-source-context',
  'delay-log-source-context',
] as const;
export type ConstraintsLogSeedCategoryId = (typeof CONSTRAINTS_LOG_SEED_CATEGORY_IDS)[number];

export interface ConstraintsLogSeedCategory {
  readonly id: ConstraintsLogSeedCategoryId;
  readonly displayName: string;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Workbook source lineage. Records trace back to specific workbook rows;
// references are documentation only and are never read as runtime defaults.
// ---------------------------------------------------------------------------

export interface IConstraintsLogWorkbookSourceRef {
  readonly workbook: string;
  readonly sheetSection: string;
  readonly rowReference: string;
  readonly importedAtUtc?: string;
}

// ---------------------------------------------------------------------------
// Reference seams. All cross-module touches are reference-by-id; no shape
// from another module is dereferenced at runtime by Wave 12.
// ---------------------------------------------------------------------------

export interface ConstraintsLogReferenceSeams {
  readonly priorityActionsCandidateRef?: string;
  readonly documentControlEvidenceRefs?: readonly string[];
  readonly lifecycleReadinessGateRef?: string;
  readonly permitInspectionRef?: string;
  readonly responsibilityRoleRef?: string;
  readonly wave14ApprovalCheckpointRef?: string;
  readonly externalSystemReferenceRef?: string;
  readonly schedulerLookAheadRef?: string;
  readonly teamAccessRoleRef?: string;
  readonly projectReadinessSourceModuleRef?: 'constraints-log';
}

// ---------------------------------------------------------------------------
// Risk score and constraint-exposure score envelopes. `appliedOverrideCodes`
// records which override rules raised the band; rationale travels with the
// score so audit and UI surfaces have provenance.
// ---------------------------------------------------------------------------

export interface RiskScoreAssessment {
  readonly likelihood: LikelihoodLevel;
  readonly impactScores: ImpactScores;
  readonly governingImpactScore: ImpactLevel;
  readonly riskScore: number;
  readonly band: SeverityBandKey;
  readonly appliedOverrideCodes?: readonly SeverityOverrideCode[];
  readonly overrideRationale?: string;
}

export interface ResidualRiskAssessment {
  readonly residualLikelihood: LikelihoodLevel;
  readonly governingImpactScore: ImpactLevel;
  readonly residualRiskScore: number;
  readonly band: SeverityBandKey;
  readonly mitigationRationale?: string;
}

export interface ConstraintExposureAssessment {
  readonly urgency: UrgencyLevel;
  readonly governingImpactScore: ImpactLevel;
  readonly exposureScore: number;
  readonly band: SeverityBandKey;
  readonly appliedOverrideCodes?: readonly SeverityOverrideCode[];
  readonly overrideRationale?: string;
}

// ---------------------------------------------------------------------------
// Risk item. Discriminated by `state`. `converted` requires the constraint
// id it produced; other states share the base shape. Optional fields stay
// optional to keep authoring ergonomic.
// ---------------------------------------------------------------------------

interface BaseRiskItem extends ConstraintsLogReferenceSeams {
  readonly id: string;
  readonly itemNumber: number;
  readonly type: 'risk';
  readonly title: string;
  readonly description: string;
  readonly seedCategoryId: ConstraintsLogSeedCategoryId;
  readonly sourceLineage: IConstraintsLogWorkbookSourceRef;
  readonly responsibleParty?: string;
  readonly ballInCourt?: string;
  readonly dateIdentifiedUtc?: string;
  readonly initial: RiskScoreAssessment;
  readonly residual?: ResidualRiskAssessment;
}

export type RiskItem =
  | (BaseRiskItem & {
      readonly state:
        | 'draft'
        | 'identified'
        | 'assessed'
        | 'response-planned'
        | 'monitoring'
        | 'triggered'
        | 'closed'
        | 'retired';
    })
  | (BaseRiskItem & {
      readonly state: 'converted';
      readonly convertedToConstraintId: string;
    });

// ---------------------------------------------------------------------------
// Constraint item. Discriminated by `state` for the conditional invariants
// the Wave 12 spec enforces:
//   - `awaiting-external-party` requires `externalPartyReference`;
//   - `overdue` requires `dueDateUtc`.
// Other states share the base shape with optional field semantics.
// ---------------------------------------------------------------------------

interface BaseConstraintItem extends ConstraintsLogReferenceSeams {
  readonly id: string;
  readonly itemNumber: number;
  readonly type: 'constraint' | 'issue' | 'delay-exposure' | 'change-exposure';
  readonly title: string;
  readonly description: string;
  readonly seedCategoryId: ConstraintsLogSeedCategoryId;
  readonly sourceLineage: IConstraintsLogWorkbookSourceRef;
  readonly responsibleParty?: string;
  readonly ballInCourt?: string;
  readonly dateIdentifiedUtc?: string;
  readonly needByDateUtc?: string;
  readonly promisedDateUtc?: string;
  readonly dueDateUtc?: string;
  readonly deliveredDateUtc?: string;
  readonly daysAgingFromIdentified?: number;
  readonly mitigationPlanSummary?: string;
  readonly exposure: ConstraintExposureAssessment;
}

export type ConstraintItem =
  | (BaseConstraintItem & {
      readonly state:
        | 'draft'
        | 'identified'
        | 'accepted'
        | 'action-planned'
        | 'in-progress'
        | 'at-risk'
        | 'resolved-pending-validation'
        | 'resolved';
    })
  | (BaseConstraintItem & {
      readonly state: 'awaiting-external-party';
      readonly externalPartyReference: string;
    })
  | (BaseConstraintItem & {
      readonly state: 'overdue';
      readonly dueDateUtc: string;
    });

// ---------------------------------------------------------------------------
// Aggregate exposure summary. Counts by band and queue volumes. Non-leaking
// counts only; no item ids surface in the summary.
// ---------------------------------------------------------------------------

export interface ConstraintsLogExposureSummary {
  readonly riskCountsByBand: Readonly<Record<SeverityBandKey, number>>;
  readonly constraintCountsByBand: Readonly<Record<SeverityBandKey, number>>;
  readonly overdueConstraintCount: number;
  readonly awaitingExternalPartyCount: number;
  readonly delayExposureReviewQueueCount: number;
  readonly changeExposureReviewQueueCount: number;
  readonly priorityActionsCandidateCount: number;
}

// ---------------------------------------------------------------------------
// Source posture and snapshot record. Snapshots are governed read-only
// artifacts; never a substitute for executed contracts or approvals.
// ---------------------------------------------------------------------------

export interface ConstraintsLogSourcePosture {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidence?: ProjectReadinessConfidenceState;
  readonly lastIngestedAtUtc?: string;
  readonly pendingHumanReviewCount: number;
}

export interface ConstraintsLogSnapshot {
  readonly snapshotId: string;
  readonly generatedAtUtc: string;
  readonly projectId: PccProjectId;
  readonly readOnly: true;
  readonly summary: string;
  readonly exposureSummary: ConstraintsLogExposureSummary;
}

// ---------------------------------------------------------------------------
// Audit events. Required for item create / update / state-change /
// override-application / snapshot-generation actions in downstream waves.
// ---------------------------------------------------------------------------

export const CONSTRAINTS_LOG_AUDIT_EVENT_TYPES = [
  'item-recorded',
  'item-updated',
  'state-transitioned',
  'override-recorded',
  'mitigation-recorded',
  'snapshot-generated',
] as const;
export type ConstraintsLogAuditEventType = (typeof CONSTRAINTS_LOG_AUDIT_EVENT_TYPES)[number];

export interface ConstraintsLogAuditEvent {
  readonly eventId: string;
  readonly eventType: ConstraintsLogAuditEventType;
  readonly occurredAtUtc: string;
  readonly entityRef: string;
  readonly summary: string;
}

// ---------------------------------------------------------------------------
// Module identity carried in the read-model envelope. Mirrors Wave 11's
// "the module knows its own name" pattern so SPFx surfaces have a single
// source of truth for the title/subtitle copy.
// ---------------------------------------------------------------------------

export interface ConstraintsLogModuleIdentity {
  readonly moduleId: 'constraints-log';
  readonly displayName: 'Constraints Log';
  readonly subtitle: 'Make-Ready Constraint & Risk Exposure Center';
  readonly governance: 'project-readiness';
  readonly workCenterId: 'risk-issues-decision';
}

export interface ConstraintsLogRiskMatrixConfig {
  readonly likelihoodLabels: readonly LikelihoodLabel[];
  readonly impactLabels: readonly ImpactLabel[];
  readonly urgencyLabels: readonly UrgencyLabel[];
  readonly impactDimensions: readonly ImpactDimensionId[];
}

// ---------------------------------------------------------------------------
// Read-model envelope payload registered as `'constraints-log'` in
// `PccReadModelResponseMap`.
// ---------------------------------------------------------------------------

export interface PccConstraintsLogReadModel {
  readonly moduleIdentity: ConstraintsLogModuleIdentity;
  readonly riskMatrixConfig: ConstraintsLogRiskMatrixConfig;
  readonly exposureBands: readonly ExposureBandDefinition[];
  readonly overrideRules: Readonly<Record<SeverityOverrideCode, SeverityOverrideRule>>;
  readonly seedCategories: readonly ConstraintsLogSeedCategory[];
  readonly riskItems: readonly RiskItem[];
  readonly constraintItems: readonly ConstraintItem[];
  readonly exposureSummary: ConstraintsLogExposureSummary;
  readonly sourcePosture: ConstraintsLogSourcePosture;
  readonly snapshotHistory: readonly ConstraintsLogSnapshot[];
  readonly auditEvents: readonly ConstraintsLogAuditEvent[];
}

// ---------------------------------------------------------------------------
// Pure helpers. No I/O, no side effects, no clock reads. Inputs are the
// scalar levels and structured impact scores; outputs are scalar scores or
// band/transition decisions. Helpers throw only when an authoring
// invariant is violated (rationale missing for override or residual
// reduction).
// ---------------------------------------------------------------------------

const SCORE_LEVEL_SET: ReadonlyArray<ScoreLevel> = SCORE_LEVELS;

function clampToScoreLevel(value: number): ScoreLevel {
  for (const level of SCORE_LEVEL_SET) {
    if (level === value) {
      return level;
    }
  }
  throw new Error(
    `score level out of range; expected one of ${SCORE_LEVELS.join('|')} but received ${value}`,
  );
}

export function computeGoverningImpactScore(impact: ImpactScores): ImpactLevel {
  const max = Math.max(
    impact.schedule,
    impact.cost,
    impact.safety,
    impact.quality,
    impact.contractCompliance,
    impact.clientOwnerImpact,
    impact.logisticsAccess,
    impact.reputationExecutiveVisibility,
  );
  return clampToScoreLevel(max);
}

export function computeRiskScore(
  likelihood: LikelihoodLevel,
  governingImpact: ImpactLevel,
): number {
  return likelihood * governingImpact;
}

export function computeResidualRiskScore(
  residualLikelihood: LikelihoodLevel,
  governingImpact: ImpactLevel,
): number {
  return residualLikelihood * governingImpact;
}

export function computeConstraintExposureScore(
  urgency: UrgencyLevel,
  governingImpact: ImpactLevel,
): number {
  return urgency * governingImpact;
}

export function mapSeverityBand(score: number): SeverityBandKey {
  if (!Number.isFinite(score) || score < 1 || score > 25) {
    throw new Error(`severity score out of range; expected 1..25 but received ${score}`);
  }
  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 14) return 'high';
  if (score <= 19) return 'very-high';
  return 'critical';
}

export interface SeverityOverrideOutcome {
  readonly band: SeverityBandKey;
  readonly appliedOverrideCodes: readonly SeverityOverrideCode[];
  readonly rationale: string;
}

export function applySeverityOverride(
  baseBand: SeverityBandKey,
  overrideCodes: readonly SeverityOverrideCode[],
  rationale: string,
): SeverityOverrideOutcome {
  if (overrideCodes.length === 0) {
    if (rationale.trim().length === 0) {
      return { band: baseBand, appliedOverrideCodes: [], rationale: '' };
    }
    return { band: baseBand, appliedOverrideCodes: [], rationale };
  }
  if (rationale.trim().length === 0) {
    throw new Error('rationale required to apply severity override');
  }
  const baseRank = SEVERITY_BAND_RANK[baseBand];
  const maxRank = overrideCodes.reduce<number>((acc, code) => {
    const overrideRank = SEVERITY_BAND_RANK[SEVERITY_OVERRIDE_RULES[code].minBandAfterOverride];
    return overrideRank > acc ? overrideRank : acc;
  }, baseRank);
  const band = SEVERITY_BAND_KEYS[maxRank];
  return { band, appliedOverrideCodes: overrideCodes, rationale };
}

export function assertResidualReductionAllowed(
  initialScore: number,
  residualScore: number,
  rationale?: string,
): void {
  if (residualScore < initialScore) {
    if (!rationale || rationale.trim().length === 0) {
      throw new Error('mitigation rationale required to reduce residual risk');
    }
  }
}

export function isRiskTransitionAllowed(from: RiskState, to: RiskState): boolean {
  return RISK_ALLOWED_TRANSITIONS[from].includes(to);
}

export function isConstraintTransitionAllowed(
  from: ConstraintState,
  to: ConstraintState,
): boolean {
  return CONSTRAINT_ALLOWED_TRANSITIONS[from].includes(to);
}

// `'constraints-log'` is registered in `PccReadModelResponseMap` (see
// `PccReadModels.ts`). The model contract here is read-only-by-design;
// no provider, no client, no fetch, no live URLs.
