/**
 * PCC Constraints Log — deterministic sample fixtures.
 *
 * Phase 3 / Wave 12 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * Graph / PnP / SharePoint REST / Procore / Sage / AHJ / Document
 * Crunch / Adobe Sign calls. Evidence is reference-only.
 *
 * Fixture coverage:
 *   - one risk in every severity band (low, moderate, high, very-high,
 *     critical) plus one converted risk;
 *   - one constraint in every severity band, including an `overdue`
 *     constraint with `dueDateUtc` and an `awaiting-external-party`
 *     constraint with `externalPartyReference`;
 *   - initial-vs-residual risk delta with mitigation rationale;
 *   - missing-owner / ball-in-court gap;
 *   - safety override, regulatory-permitting override, contractual
 *     milestone override;
 *   - delay-exposure and change-exposure review flags (review only);
 *   - reference seams to Document Control evidence ids, Priority
 *     Actions candidates, Project Readiness source module, Wave 9
 *     lifecycle gate, Wave 10 permit/inspection record, Wave 11
 *     responsibility role, Wave 14 approval checkpoint, and an
 *     external-system launcher reference.
 *
 * @module pcc/fixtures/constraintsLog
 */

import {
  CONSTRAINTS_LOG_SEED_CATEGORY_IDS,
  EXPOSURE_BANDS,
  IMPACT_DIMENSION_IDS,
  IMPACT_LABELS,
  LIKELIHOOD_LABELS,
  SEVERITY_OVERRIDE_RULES,
  URGENCY_LABELS,
  type ConstraintExposureAssessment,
  type ConstraintItem,
  type ConstraintsLogAuditEvent,
  type ConstraintsLogExposureSummary,
  type ConstraintsLogModuleIdentity,
  type ConstraintsLogRiskMatrixConfig,
  type ConstraintsLogSeedCategory,
  type ConstraintsLogSnapshot,
  type ConstraintsLogSourcePosture,
  type IConstraintsLogWorkbookSourceRef,
  type PccConstraintsLogReadModel,
  type ResidualRiskAssessment,
  type RiskItem,
  type RiskScoreAssessment,
  type SeverityBandKey,
} from '../ConstraintsLog.js';
import type { PccProjectId } from '../types.js';

const SAMPLE_PROJECT_ID = 'p-wave12-constraints-log-sample' as PccProjectId;

const WORKBOOK = 'HB_ConstraintsLog_Template';

function workbookRef(
  sheetSection: string,
  rowReference: string,
): IConstraintsLogWorkbookSourceRef {
  return { workbook: WORKBOOK, sheetSection, rowReference };
}

export const SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES: readonly ConstraintsLogSeedCategory[] = [
  {
    id: 'permits',
    displayName: 'Permits',
    description: 'Permits — Open / Closed workbook section. Reference taxonomy only.',
  },
  {
    id: 'ahj-coordination',
    displayName: 'AHJ Coordination',
    description: 'AHJ Coordination — Open / Closed workbook section. Reference taxonomy only.',
  },
  {
    id: 'design-development',
    displayName: 'Design Development',
    description: 'Design Development — Open / Closed workbook section. Reference taxonomy only.',
  },
  {
    id: 'utility-service-providers',
    displayName: 'Utility Service Providers',
    description:
      'Utility Service Providers — Open / Closed workbook section. Reference taxonomy only.',
  },
  {
    id: 'hb-internal-coordination',
    displayName: 'HB Internal Coordination Items',
    description:
      'Hedrick Brothers internal coordination items — Open / Closed workbook section.',
  },
  {
    id: 'construction-progress',
    displayName: 'Construction Progress',
    description:
      'Construction Progress — Open / Closed workbook section. Reference taxonomy only.',
  },
  {
    id: 'placeholder-new-section',
    displayName: 'Placeholder / New Section',
    description: 'Placeholder for project-specific category creation prior to activation.',
  },
  {
    id: 'change-tracking-source-context',
    displayName: 'Change Tracking Source Context',
    description:
      'Source-context taxonomy for change-exposure review flags; not a change-order engine.',
  },
  {
    id: 'delay-log-source-context',
    displayName: 'Delay Log Source Context',
    description:
      'Source-context taxonomy for delay-exposure review flags; not a delay-damages calculator.',
  },
];

// Sanity check at module-load time that the seed category list mirrors the
// authoritative tuple. If the source list grows, this fixture must be
// updated; the assertion makes drift visible immediately.
{
  const fixtureIds = SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES.map((c) => c.id);
  const tupleIds = [...CONSTRAINTS_LOG_SEED_CATEGORY_IDS];
  if (
    fixtureIds.length !== tupleIds.length ||
    fixtureIds.some((id, i) => id !== tupleIds[i])
  ) {
    throw new Error('SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES drift from CONSTRAINTS_LOG_SEED_CATEGORY_IDS');
  }
}

// ---------------------------------------------------------------------------
// Risks. One per severity band plus a converted risk. Initial vs residual
// delta lives on the high-band risk. Safety override lives on the very-high
// risk; without that override its base score would still place it in
// very-high but below the safety-driven floor.
// ---------------------------------------------------------------------------

const LOW_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 2,
  impactScores: {
    schedule: 1,
    cost: 1,
    safety: 1,
    quality: 2,
    contractCompliance: 1,
    clientOwnerImpact: 1,
    logisticsAccess: 1,
    reputationExecutiveVisibility: 1,
  },
  governingImpactScore: 2,
  riskScore: 4,
  band: 'low',
};

const MODERATE_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 2,
  impactScores: {
    schedule: 4,
    cost: 3,
    safety: 1,
    quality: 2,
    contractCompliance: 2,
    clientOwnerImpact: 2,
    logisticsAccess: 2,
    reputationExecutiveVisibility: 2,
  },
  governingImpactScore: 4,
  riskScore: 8,
  band: 'moderate',
};

const HIGH_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 4,
  impactScores: {
    schedule: 3,
    cost: 3,
    safety: 1,
    quality: 2,
    contractCompliance: 3,
    clientOwnerImpact: 2,
    logisticsAccess: 2,
    reputationExecutiveVisibility: 1,
  },
  governingImpactScore: 3,
  riskScore: 12,
  band: 'high',
};

const HIGH_RISK_RESIDUAL: ResidualRiskAssessment = {
  residualLikelihood: 2,
  governingImpactScore: 3,
  residualRiskScore: 6,
  band: 'moderate',
  mitigationRationale:
    'Mock-up sequence resequenced; weekly checkpoint with the architect of record validates remaining issues.',
};

const VERY_HIGH_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 3,
  impactScores: {
    schedule: 5,
    cost: 4,
    safety: 3,
    quality: 4,
    contractCompliance: 4,
    clientOwnerImpact: 4,
    logisticsAccess: 3,
    reputationExecutiveVisibility: 3,
  },
  governingImpactScore: 5,
  riskScore: 15,
  band: 'very-high',
};

const CRITICAL_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 5,
  impactScores: {
    schedule: 5,
    cost: 5,
    safety: 5,
    quality: 4,
    contractCompliance: 4,
    clientOwnerImpact: 4,
    logisticsAccess: 5,
    reputationExecutiveVisibility: 4,
  },
  governingImpactScore: 5,
  riskScore: 25,
  band: 'critical',
  appliedOverrideCodes: ['safety-immediate-command-attention'],
  overrideRationale:
    'Confined-space ventilation gap identified during pre-task plan review; pause work pending command-level action plan.',
};

const CONVERTED_RISK_INITIAL: RiskScoreAssessment = {
  likelihood: 4,
  impactScores: {
    schedule: 4,
    cost: 3,
    safety: 1,
    quality: 2,
    contractCompliance: 3,
    clientOwnerImpact: 2,
    logisticsAccess: 3,
    reputationExecutiveVisibility: 2,
  },
  governingImpactScore: 4,
  riskScore: 16,
  band: 'very-high',
};

export const SAMPLE_CONSTRAINTS_LOG_RISKS: readonly RiskItem[] = [
  {
    id: 'risk-w12-001',
    itemNumber: 1,
    type: 'risk',
    state: 'identified',
    title: 'Sample low-band risk: minor finishes coordination uncertainty',
    description:
      'Coordinating final finishes color schedule with the interior designer; minor schedule risk only.',
    seedCategoryId: 'design-development',
    sourceLineage: workbookRef('Design Development — Open', 'row 12'),
    responsibleParty: 'PM-Owner',
    ballInCourt: 'Interior Designer',
    dateIdentifiedUtc: '2026-04-10T14:00:00Z',
    initial: LOW_RISK_INITIAL,
    documentControlEvidenceRefs: ['dc-source-finishes-schedule'],
    projectReadinessSourceModuleRef: 'constraints-log',
  },
  {
    id: 'risk-w12-002',
    itemNumber: 2,
    type: 'risk',
    state: 'response-planned',
    title: 'Sample moderate-band risk: utility service provider response window',
    description:
      'Utility service provider has indicated a 6-week response window for service connection sign-off.',
    seedCategoryId: 'utility-service-providers',
    sourceLineage: workbookRef('Utility Service Providers — Open', 'row 18'),
    responsibleParty: 'Project Manager',
    ballInCourt: 'Utility Coordinator',
    dateIdentifiedUtc: '2026-04-12T15:00:00Z',
    initial: MODERATE_RISK_INITIAL,
    permitInspectionRef: 'permit-w10-electrical-service',
    externalSystemReferenceRef: 'external-system-utility-portal-launcher',
  },
  {
    id: 'risk-w12-003',
    itemNumber: 3,
    type: 'risk',
    state: 'monitoring',
    title: 'Sample high-band risk: design coordination clash backlog',
    description:
      'MEP-architectural clash backlog has not closed at the rate planned; monitoring weekly to confirm.',
    seedCategoryId: 'design-development',
    sourceLineage: workbookRef('Design Development — Open', 'row 31'),
    responsibleParty: 'PM-Field',
    ballInCourt: 'BIM Coordinator',
    dateIdentifiedUtc: '2026-04-08T13:00:00Z',
    initial: HIGH_RISK_INITIAL,
    residual: HIGH_RISK_RESIDUAL,
    priorityActionsCandidateRef: 'pa-candidate-mep-clash-backlog',
    responsibilityRoleRef: 'role-w11-bim-coordinator',
  },
  {
    id: 'risk-w12-004',
    itemNumber: 4,
    type: 'risk',
    state: 'assessed',
    title: 'Sample very-high-band risk: safety exposure on confined-space activity',
    description:
      'Confined-space ventilation gap surfaced; risk score elevated by safety override pending command-level review.',
    seedCategoryId: 'construction-progress',
    sourceLineage: workbookRef('Construction Progress — Open', 'row 47'),
    responsibleParty: 'Superintendent',
    ballInCourt: 'Safety Manager',
    dateIdentifiedUtc: '2026-04-22T10:00:00Z',
    initial: VERY_HIGH_RISK_INITIAL,
    wave14ApprovalCheckpointRef: 'checkpoint-w14-safety-pause',
    lifecycleReadinessGateRef: 'gate-w9-construction-startup',
  },
  {
    id: 'risk-w12-005',
    itemNumber: 5,
    type: 'risk',
    state: 'triggered',
    title: 'Sample critical-band risk: regulatory permit jeopardy with safety overlay',
    description:
      'AHJ inspection escalation overlapping with confined-space exposure; critical band held until both clear.',
    seedCategoryId: 'permits',
    sourceLineage: workbookRef('Permits — Open', 'row 4'),
    responsibleParty: 'Project Executive',
    ballInCourt: 'Permit Lead',
    dateIdentifiedUtc: '2026-04-25T12:00:00Z',
    initial: CRITICAL_RISK_INITIAL,
    permitInspectionRef: 'permit-w10-fire-suppression',
    wave14ApprovalCheckpointRef: 'checkpoint-w14-executive-pause',
  },
  {
    id: 'risk-w12-006',
    itemNumber: 6,
    type: 'risk',
    state: 'converted',
    title: 'Sample converted risk: long-lead switchgear delivery materialized as a constraint',
    description:
      'Long-lead switchgear delivery slipped; risk converted to a tracked constraint with active mitigation.',
    seedCategoryId: 'utility-service-providers',
    sourceLineage: workbookRef('Utility Service Providers — Open', 'row 22'),
    responsibleParty: 'Procurement Lead',
    ballInCourt: 'Procurement Lead',
    dateIdentifiedUtc: '2026-04-01T09:00:00Z',
    initial: CONVERTED_RISK_INITIAL,
    convertedToConstraintId: 'constraint-w12-005',
  },
];

// ---------------------------------------------------------------------------
// Constraints. One per severity band; includes an `overdue` constraint
// with `dueDateUtc`, an `awaiting-external-party` constraint with
// `externalPartyReference`, a missing-owner gap, plus delay-exposure and
// change-exposure review flags.
// ---------------------------------------------------------------------------

const LOW_CONSTRAINT_EXPOSURE: ConstraintExposureAssessment = {
  urgency: 2,
  governingImpactScore: 2,
  exposureScore: 4,
  band: 'low',
};

const MODERATE_CONSTRAINT_EXPOSURE: ConstraintExposureAssessment = {
  urgency: 2,
  governingImpactScore: 3,
  exposureScore: 6,
  band: 'moderate',
};

const HIGH_CONSTRAINT_EXPOSURE: ConstraintExposureAssessment = {
  urgency: 3,
  governingImpactScore: 4,
  exposureScore: 12,
  band: 'high',
  appliedOverrideCodes: ['contractual-milestone-exposure'],
  overrideRationale:
    'Contractual milestone for substantial completion is at risk if access is not restored within two weeks.',
};

const VERY_HIGH_CONSTRAINT_EXPOSURE: ConstraintExposureAssessment = {
  urgency: 4,
  governingImpactScore: 4,
  exposureScore: 16,
  band: 'very-high',
};

const CRITICAL_CONSTRAINT_EXPOSURE: ConstraintExposureAssessment = {
  urgency: 5,
  governingImpactScore: 5,
  exposureScore: 25,
  band: 'critical',
  appliedOverrideCodes: ['regulatory-permitting-deadline'],
  overrideRationale:
    'Regulatory permit deadline is days away; missed permit will halt the dependent inspection chain.',
};

const DELAY_EXPOSURE_FLAG: ConstraintExposureAssessment = {
  urgency: 3,
  governingImpactScore: 4,
  exposureScore: 12,
  band: 'high',
};

const CHANGE_EXPOSURE_FLAG: ConstraintExposureAssessment = {
  urgency: 2,
  governingImpactScore: 4,
  exposureScore: 8,
  band: 'moderate',
};

export const SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS: readonly ConstraintItem[] = [
  {
    id: 'constraint-w12-001',
    itemNumber: 1,
    type: 'constraint',
    state: 'identified',
    title: 'Sample low-band constraint: shop drawing review queue position',
    description: 'Shop drawing for non-critical millwork is queued; on-track per current cadence.',
    seedCategoryId: 'design-development',
    sourceLineage: workbookRef('Design Development — Open', 'row 14'),
    responsibleParty: 'PM-Owner',
    ballInCourt: 'Architect',
    dateIdentifiedUtc: '2026-04-15T10:00:00Z',
    needByDateUtc: '2026-06-15T00:00:00Z',
    daysAgingFromIdentified: 18,
    exposure: LOW_CONSTRAINT_EXPOSURE,
    documentControlEvidenceRefs: ['dc-source-shop-drawing-queue'],
  },
  {
    id: 'constraint-w12-002',
    itemNumber: 2,
    type: 'constraint',
    state: 'action-planned',
    title: 'Sample moderate-band constraint: site logistics access for tower crane mobilization',
    description: 'Crane mobilization plan requires temporary closure of an access lane.',
    seedCategoryId: 'construction-progress',
    sourceLineage: workbookRef('Construction Progress — Open', 'row 9'),
    responsibleParty: 'Superintendent',
    ballInCourt: 'Site Logistics Lead',
    dateIdentifiedUtc: '2026-04-18T11:00:00Z',
    promisedDateUtc: '2026-05-20T00:00:00Z',
    dueDateUtc: '2026-05-27T00:00:00Z',
    daysAgingFromIdentified: 15,
    mitigationPlanSummary:
      'Lane closure permit application drafted; coordination with neighboring tenant scheduled.',
    exposure: MODERATE_CONSTRAINT_EXPOSURE,
    permitInspectionRef: 'permit-w10-row-temporary-closure',
  },
  {
    id: 'constraint-w12-003',
    itemNumber: 3,
    type: 'constraint',
    state: 'in-progress',
    title: 'Sample high-band constraint: contractual substantial-completion milestone slip risk',
    description:
      'Active mitigation in progress to restore access path supporting the substantial-completion milestone.',
    seedCategoryId: 'hb-internal-coordination',
    sourceLineage: workbookRef('Hedrick Brothers Internal Coordination Items — Open', 'row 6'),
    responsibleParty: 'Project Executive',
    ballInCourt: 'PM-Owner',
    dateIdentifiedUtc: '2026-04-09T14:00:00Z',
    promisedDateUtc: '2026-05-10T00:00:00Z',
    dueDateUtc: '2026-05-17T00:00:00Z',
    daysAgingFromIdentified: 24,
    mitigationPlanSummary:
      'Resequenced trades to free critical path; weekly milestone review with owner.',
    exposure: HIGH_CONSTRAINT_EXPOSURE,
    priorityActionsCandidateRef: 'pa-candidate-substantial-completion-slip',
    responsibilityRoleRef: 'role-w11-project-executive',
  },
  {
    id: 'constraint-w12-004',
    itemNumber: 4,
    type: 'constraint',
    state: 'overdue',
    title: 'Sample very-high-band constraint: city utility tap submittal overdue',
    description:
      'City utility tap submittal response window has lapsed; field activity dependent on response remains paused.',
    seedCategoryId: 'utility-service-providers',
    sourceLineage: workbookRef('Utility Service Providers — Open', 'row 11'),
    ballInCourt: 'Utility Coordinator',
    dateIdentifiedUtc: '2026-03-30T08:00:00Z',
    promisedDateUtc: '2026-04-21T00:00:00Z',
    dueDateUtc: '2026-04-28T00:00:00Z',
    daysAgingFromIdentified: 34,
    mitigationPlanSummary:
      'Daily standups with the utility coordinator; escalation pending if no response by week-end.',
    exposure: VERY_HIGH_CONSTRAINT_EXPOSURE,
    externalSystemReferenceRef: 'external-system-utility-portal-launcher',
  },
  {
    id: 'constraint-w12-005',
    itemNumber: 5,
    type: 'constraint',
    state: 'awaiting-external-party',
    title: 'Sample critical-band constraint: long-lead switchgear delivery awaiting vendor confirmation',
    description:
      'Switchgear delivery slipped past commitment; awaiting vendor confirmation of revised delivery window.',
    seedCategoryId: 'utility-service-providers',
    sourceLineage: workbookRef('Utility Service Providers — Open', 'row 22'),
    responsibleParty: 'Procurement Lead',
    ballInCourt: 'Vendor — Switchgear Supplier',
    dateIdentifiedUtc: '2026-04-01T09:00:00Z',
    promisedDateUtc: '2026-04-15T00:00:00Z',
    dueDateUtc: '2026-04-29T00:00:00Z',
    daysAgingFromIdentified: 32,
    mitigationPlanSummary:
      'Procurement lead working with vendor for revised delivery date; alternative vendors assessed for short-term recovery.',
    exposure: CRITICAL_CONSTRAINT_EXPOSURE,
    externalPartyReference: 'vendor-switchgear-acme-electrical-supply',
    wave14ApprovalCheckpointRef: 'checkpoint-w14-procurement-recovery-plan',
  },
  {
    id: 'constraint-w12-006',
    itemNumber: 6,
    type: 'constraint',
    state: 'in-progress',
    title: 'Sample missing-owner-gap constraint: ambiguous owner for AHJ correspondence routing',
    description:
      'No defined owner for routing correspondence from the AHJ permit office; assignment pending leadership decision.',
    seedCategoryId: 'ahj-coordination',
    sourceLineage: workbookRef('AHJ Coordination — Open', 'row 3'),
    dateIdentifiedUtc: '2026-04-26T16:00:00Z',
    daysAgingFromIdentified: 7,
    mitigationPlanSummary: 'Leadership decision required to assign primary AHJ coordination owner.',
    exposure: MODERATE_CONSTRAINT_EXPOSURE,
    priorityActionsCandidateRef: 'pa-candidate-ahj-owner-assignment',
  },
  {
    id: 'constraint-w12-007',
    itemNumber: 7,
    type: 'delay-exposure',
    state: 'identified',
    title: 'Sample delay-exposure review flag: weather-week impact on facade installation',
    description:
      'Reduced facade installation hours noted; flagged for review only — this is not a delay determination or claim entitlement.',
    seedCategoryId: 'delay-log-source-context',
    sourceLineage: workbookRef('Delay Log Source Context', 'row 2'),
    responsibleParty: 'Project Controls',
    ballInCourt: 'Superintendent',
    dateIdentifiedUtc: '2026-04-30T07:00:00Z',
    daysAgingFromIdentified: 3,
    exposure: DELAY_EXPOSURE_FLAG,
  },
  {
    id: 'constraint-w12-008',
    itemNumber: 8,
    type: 'change-exposure',
    state: 'identified',
    title: 'Sample change-exposure review flag: owner-requested finish upgrade pending evaluation',
    description:
      'Owner-requested finish upgrade may carry scope/cost impact; flagged for review only — not a change order or compensability determination.',
    seedCategoryId: 'change-tracking-source-context',
    sourceLineage: workbookRef('Change Tracking Source Context', 'row 5'),
    responsibleParty: 'Project Accountant',
    ballInCourt: 'PM-Owner',
    dateIdentifiedUtc: '2026-04-29T15:00:00Z',
    daysAgingFromIdentified: 4,
    exposure: CHANGE_EXPOSURE_FLAG,
  },
];

// ---------------------------------------------------------------------------
// Aggregate exposure summary derived from the fixtures above by counting
// by-band membership and queue volumes. Hand-computed deterministic
// counts; tests reverify by re-counting from the item arrays.
// ---------------------------------------------------------------------------

function emptyBandCounts(): Record<SeverityBandKey, number> {
  return { low: 0, moderate: 0, high: 0, 'very-high': 0, critical: 0 };
}

const RISK_COUNTS_BY_BAND = SAMPLE_CONSTRAINTS_LOG_RISKS.reduce<Record<SeverityBandKey, number>>(
  (counts, risk) => {
    const band = risk.residual?.band ?? risk.initial.band;
    counts[band] += 1;
    return counts;
  },
  emptyBandCounts(),
);

const CONSTRAINT_COUNTS_BY_BAND = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.reduce<
  Record<SeverityBandKey, number>
>((counts, constraint) => {
  counts[constraint.exposure.band] += 1;
  return counts;
}, emptyBandCounts());

const OVERDUE_COUNT = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.filter(
  (c) => c.state === 'overdue',
).length;

const AWAITING_EXTERNAL_COUNT = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.filter(
  (c) => c.state === 'awaiting-external-party',
).length;

const DELAY_EXPOSURE_QUEUE_COUNT = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.filter(
  (c) => c.type === 'delay-exposure',
).length;

const CHANGE_EXPOSURE_QUEUE_COUNT = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.filter(
  (c) => c.type === 'change-exposure',
).length;

const PRIORITY_ACTIONS_CANDIDATE_COUNT =
  SAMPLE_CONSTRAINTS_LOG_RISKS.filter((r) => r.priorityActionsCandidateRef !== undefined).length +
  SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.filter((c) => c.priorityActionsCandidateRef !== undefined)
    .length;

export const SAMPLE_CONSTRAINTS_LOG_EXPOSURE_SUMMARY: ConstraintsLogExposureSummary = {
  riskCountsByBand: RISK_COUNTS_BY_BAND,
  constraintCountsByBand: CONSTRAINT_COUNTS_BY_BAND,
  overdueConstraintCount: OVERDUE_COUNT,
  awaitingExternalPartyCount: AWAITING_EXTERNAL_COUNT,
  delayExposureReviewQueueCount: DELAY_EXPOSURE_QUEUE_COUNT,
  changeExposureReviewQueueCount: CHANGE_EXPOSURE_QUEUE_COUNT,
  priorityActionsCandidateCount: PRIORITY_ACTIONS_CANDIDATE_COUNT,
};

export const SAMPLE_CONSTRAINTS_LOG_SOURCE_POSTURE: ConstraintsLogSourcePosture = {
  sourceStatus: 'available',
  confidence: 'high',
  lastIngestedAtUtc: '2026-05-01T18:30:00Z',
  pendingHumanReviewCount: 1,
};

export const SAMPLE_CONSTRAINTS_LOG_SNAPSHOT_HISTORY: readonly ConstraintsLogSnapshot[] = [
  {
    snapshotId: 'snapshot-w12-2026-05-01',
    generatedAtUtc: '2026-05-01T18:30:00Z',
    projectId: SAMPLE_PROJECT_ID,
    readOnly: true,
    summary:
      'Wave 12 sample snapshot: one critical, one very-high, two high, two moderate, two low across risks and constraints with active overrides recorded.',
    exposureSummary: SAMPLE_CONSTRAINTS_LOG_EXPOSURE_SUMMARY,
  },
];

export const SAMPLE_CONSTRAINTS_LOG_AUDIT_EVENTS: readonly ConstraintsLogAuditEvent[] = [
  {
    eventId: 'evt-w12-001',
    eventType: 'item-recorded',
    occurredAtUtc: '2026-04-10T14:05:00Z',
    entityRef: 'risk-w12-001',
    summary: 'Low-band risk recorded for finishes coordination uncertainty.',
  },
  {
    eventId: 'evt-w12-002',
    eventType: 'state-transitioned',
    occurredAtUtc: '2026-04-26T17:00:00Z',
    entityRef: 'risk-w12-006',
    summary: 'Risk converted to tracked constraint constraint-w12-005.',
  },
  {
    eventId: 'evt-w12-003',
    eventType: 'override-recorded',
    occurredAtUtc: '2026-04-25T12:30:00Z',
    entityRef: 'risk-w12-005',
    summary:
      'Safety and regulatory-permitting overrides recorded with rationale; band held at critical.',
  },
  {
    eventId: 'evt-w12-004',
    eventType: 'mitigation-recorded',
    occurredAtUtc: '2026-04-30T18:00:00Z',
    entityRef: 'risk-w12-003',
    summary:
      'Residual risk reduced from 12 to 6 with documented mock-up resequencing rationale.',
  },
  {
    eventId: 'evt-w12-005',
    eventType: 'snapshot-generated',
    occurredAtUtc: '2026-05-01T18:30:00Z',
    entityRef: 'snapshot-w12-2026-05-01',
    summary: 'Wave 12 sample snapshot generated.',
  },
];

const SAMPLE_MODULE_IDENTITY: ConstraintsLogModuleIdentity = {
  moduleId: 'constraints-log',
  displayName: 'Constraints Log',
  subtitle: 'Make-Ready Constraint & Risk Exposure Center',
  governance: 'project-readiness',
  workCenterId: 'risk-issues-decision',
};

const SAMPLE_RISK_MATRIX_CONFIG: ConstraintsLogRiskMatrixConfig = {
  likelihoodLabels: LIKELIHOOD_LABELS,
  impactLabels: IMPACT_LABELS,
  urgencyLabels: URGENCY_LABELS,
  impactDimensions: IMPACT_DIMENSION_IDS,
};

export const SAMPLE_CONSTRAINTS_LOG_READ_MODEL: PccConstraintsLogReadModel = {
  moduleIdentity: SAMPLE_MODULE_IDENTITY,
  riskMatrixConfig: SAMPLE_RISK_MATRIX_CONFIG,
  exposureBands: EXPOSURE_BANDS,
  overrideRules: SEVERITY_OVERRIDE_RULES,
  seedCategories: SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES,
  riskItems: SAMPLE_CONSTRAINTS_LOG_RISKS,
  constraintItems: SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS,
  exposureSummary: SAMPLE_CONSTRAINTS_LOG_EXPOSURE_SUMMARY,
  sourcePosture: SAMPLE_CONSTRAINTS_LOG_SOURCE_POSTURE,
  snapshotHistory: SAMPLE_CONSTRAINTS_LOG_SNAPSHOT_HISTORY,
  auditEvents: SAMPLE_CONSTRAINTS_LOG_AUDIT_EVENTS,
};
