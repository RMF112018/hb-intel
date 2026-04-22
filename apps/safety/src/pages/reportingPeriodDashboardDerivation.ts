import type { SafetyProjectWeekRecord } from '@hbc/features-safety';

/**
 * Reporting-period dashboard derivation (Phase-04 audit G-04).
 *
 * Pure, deterministic helpers that turn the loaded project-weeks into the
 * dashboard's decision-oriented story:
 *
 *   - classifyPeriodHealth(projectWeeks) — the period's operational story
 *   - rankProjectWeeks(projectWeeks)     — the priority attention list
 *
 * All logic is local, explainable, and test-locked. No fabricated backend
 * signals. No invented analytics. No speculative historical trend. Weights
 * and thresholds are exported constants so tests can assert them directly.
 *
 * Canonical period-health state set (locked — do not introduce synonyms):
 *   'on-track' | 'watchlist' | 'attention-needed' | 'critical'
 */

export type SafetyPeriodHealthState =
  | 'on-track'
  | 'watchlist'
  | 'attention-needed'
  | 'critical';

/** Tone used by SafetyPeriodHealthPanel + chip layer to pick a visual variant. */
export type SafetySignalTone = 'info' | 'success' | 'warning' | 'critical';

export interface SafetyPeriodHealthSignal {
  readonly id: string;
  readonly label: string;
  readonly tone: SafetySignalTone;
}

export interface SafetyPeriodHealth {
  readonly state: SafetyPeriodHealthState;
  readonly headline: string;
  readonly rationale: string;
  readonly signals: ReadonlyArray<SafetyPeriodHealthSignal>;
}

export interface SafetyPriorityProjectItem {
  readonly projectWeek: SafetyProjectWeekRecord;
  readonly priorityScore: number;
  readonly reasons: ReadonlyArray<string>;
  readonly topReason: string;
}

/**
 * Per-signal priority weights. Sum per project-week yields priorityScore.
 * Keep in sync with the signal schema in the Wave-3 plan §3.4.
 */
export const DASHBOARD_PRIORITY_WEIGHTS = {
  highRiskFinding: 4,
  mediumRiskFinding: 2,
  scoreBelow75: 3,
  scoreBelow85: 1,
  reviewRequiredStatus: 2,
  missingExpectedInspection: 3,
} as const;

/**
 * Aggregate thresholds driving period-health classification. Percentages are
 * expressed as fractions in [0, 1] for deterministic arithmetic.
 */
export const DASHBOARD_HEALTH_THRESHOLDS = {
  criticalScoreBelow75Fraction: 0.3,
  criticalMissingInspectionFraction: 0.3,
  attentionMediumOrHighRiskFraction: 0.15,
  attentionScoreBelow85Fraction: 0.25,
  attentionReviewRequiredFraction: 0.2,
} as const;

const REASON_FRAGMENTS = {
  highRiskFinding: 'High-risk finding',
  mediumRiskFinding: 'Medium-risk finding',
  scoreBelow75: 'Average score below 75%',
  scoreBelow85: 'Average score below 85%',
  reviewRequiredStatus: 'Review required',
  missingExpectedInspection: 'No inspection logged this week',
} as const;

/**
 * Score one project-week and collect its reason fragments. Reasons are
 * collected in the order of the locked signal schema so topReason is
 * deterministic.
 */
function scoreProjectWeek(pw: SafetyProjectWeekRecord): {
  priorityScore: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let priorityScore = 0;

  if (pw.highestRiskFindingLevel === 'high') {
    priorityScore += DASHBOARD_PRIORITY_WEIGHTS.highRiskFinding;
    reasons.push(REASON_FRAGMENTS.highRiskFinding);
  } else if (pw.highestRiskFindingLevel === 'medium') {
    priorityScore += DASHBOARD_PRIORITY_WEIGHTS.mediumRiskFinding;
    reasons.push(REASON_FRAGMENTS.mediumRiskFinding);
  }

  if (pw.averageInspectionScore !== null) {
    if (pw.averageInspectionScore < 0.75) {
      priorityScore += DASHBOARD_PRIORITY_WEIGHTS.scoreBelow75;
      reasons.push(REASON_FRAGMENTS.scoreBelow75);
    } else if (pw.averageInspectionScore < 0.85) {
      priorityScore += DASHBOARD_PRIORITY_WEIGHTS.scoreBelow85;
      reasons.push(REASON_FRAGMENTS.scoreBelow85);
    }
  }

  if (pw.publishStatus === 'review-required') {
    priorityScore += DASHBOARD_PRIORITY_WEIGHTS.reviewRequiredStatus;
    reasons.push(REASON_FRAGMENTS.reviewRequiredStatus);
  }

  if (pw.expectedInspectionThisWeek && pw.inspectionCount === 0) {
    priorityScore += DASHBOARD_PRIORITY_WEIGHTS.missingExpectedInspection;
    reasons.push(REASON_FRAGMENTS.missingExpectedInspection);
  }

  return { priorityScore, reasons };
}

/**
 * Produce the ranked attention list. Sort descending by priorityScore;
 * ties break on projectNumber ascending. Only flagged project-weeks
 * (priorityScore > 0) are included. Capped at `limit`.
 */
export function rankProjectWeeks(
  projectWeeks: ReadonlyArray<SafetyProjectWeekRecord>,
  limit = 5,
): ReadonlyArray<SafetyPriorityProjectItem> {
  const items: SafetyPriorityProjectItem[] = [];
  for (const pw of projectWeeks) {
    const { priorityScore, reasons } = scoreProjectWeek(pw);
    if (priorityScore <= 0 || reasons.length === 0) continue;
    items.push({
      projectWeek: pw,
      priorityScore,
      reasons,
      topReason: reasons[0] ?? '',
    });
  }
  items.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.projectWeek.projectNumber.localeCompare(b.projectWeek.projectNumber);
  });
  return items.slice(0, Math.max(0, limit));
}

function buildAggregateSignals(
  projectWeeks: ReadonlyArray<SafetyProjectWeekRecord>,
): {
  total: number;
  scored: number;
  expectedInspections: number;
  highRiskCount: number;
  mediumOrHighRiskCount: number;
  below75Count: number;
  below85Count: number;
  reviewRequiredCount: number;
  missingInspectionCount: number;
} {
  let highRiskCount = 0;
  let mediumOrHighRiskCount = 0;
  let below75Count = 0;
  let below85Count = 0;
  let reviewRequiredCount = 0;
  let missingInspectionCount = 0;
  let scored = 0;
  let expectedInspections = 0;

  for (const pw of projectWeeks) {
    if (pw.highestRiskFindingLevel === 'high') {
      highRiskCount += 1;
      mediumOrHighRiskCount += 1;
    } else if (pw.highestRiskFindingLevel === 'medium') {
      mediumOrHighRiskCount += 1;
    }
    if (pw.averageInspectionScore !== null) {
      scored += 1;
      if (pw.averageInspectionScore < 0.75) below75Count += 1;
      if (pw.averageInspectionScore < 0.85) below85Count += 1;
    }
    if (pw.publishStatus === 'review-required') reviewRequiredCount += 1;
    if (pw.expectedInspectionThisWeek) {
      expectedInspections += 1;
      if (pw.inspectionCount === 0) missingInspectionCount += 1;
    }
  }

  return {
    total: projectWeeks.length,
    scored,
    expectedInspections,
    highRiskCount,
    mediumOrHighRiskCount,
    below75Count,
    below85Count,
    reviewRequiredCount,
    missingInspectionCount,
  };
}

function buildSignalChips(
  agg: ReturnType<typeof buildAggregateSignals>,
): SafetyPeriodHealthSignal[] {
  const chips: SafetyPeriodHealthSignal[] = [];
  if (agg.highRiskCount > 0) {
    chips.push({
      id: 'high-risk',
      label: `${agg.highRiskCount} ${agg.highRiskCount === 1 ? 'project with a high-risk finding' : 'projects with high-risk findings'}`,
      tone: 'critical',
    });
  }
  if (agg.below75Count > 0) {
    chips.push({
      id: 'below-75',
      label: `${agg.below75Count} scored below 75%`,
      tone: 'critical',
    });
  }
  if (agg.missingInspectionCount > 0) {
    chips.push({
      id: 'missing-inspection',
      label: `${agg.missingInspectionCount} missing this week’s expected inspection`,
      tone: 'warning',
    });
  }
  if (agg.mediumOrHighRiskCount > 0) {
    chips.push({
      id: 'any-risk',
      label: `${agg.mediumOrHighRiskCount} with medium-or-high findings`,
      tone: 'warning',
    });
  }
  if (agg.below85Count > 0 && agg.below85Count !== agg.below75Count) {
    chips.push({
      id: 'below-85',
      label: `${agg.below85Count} scored below 85%`,
      tone: 'warning',
    });
  }
  if (agg.reviewRequiredCount > 0) {
    chips.push({
      id: 'review-required',
      label: `${agg.reviewRequiredCount} ${agg.reviewRequiredCount === 1 ? 'project' : 'projects'} awaiting review`,
      tone: 'warning',
    });
  }
  return chips;
}

/**
 * Classify the overall period health from the loaded project-weeks.
 * Returns a headline, rationale, and chip list the panel renders as-is.
 */
export function classifyPeriodHealth(
  projectWeeks: ReadonlyArray<SafetyProjectWeekRecord>,
): SafetyPeriodHealth {
  const total = projectWeeks.length;
  if (total === 0) {
    return {
      state: 'on-track',
      headline: 'No project-weeks loaded',
      rationale:
        'The dashboard has no project-week records to evaluate for this period.',
      signals: [],
    };
  }

  const agg = buildAggregateSignals(projectWeeks);
  const T = DASHBOARD_HEALTH_THRESHOLDS;

  const below75Fraction = agg.scored === 0 ? 0 : agg.below75Count / agg.scored;
  const missingFraction =
    agg.expectedInspections === 0
      ? 0
      : agg.missingInspectionCount / agg.expectedInspections;
  const below85Fraction = agg.scored === 0 ? 0 : agg.below85Count / agg.scored;
  const mediumOrHighFraction = agg.mediumOrHighRiskCount / total;
  const reviewRequiredFraction = agg.reviewRequiredCount / total;

  const isCritical =
    agg.highRiskCount > 0 ||
    below75Fraction >= T.criticalScoreBelow75Fraction ||
    missingFraction >= T.criticalMissingInspectionFraction;

  const isAttentionNeeded =
    mediumOrHighFraction >= T.attentionMediumOrHighRiskFraction ||
    below85Fraction >= T.attentionScoreBelow85Fraction ||
    reviewRequiredFraction >= T.attentionReviewRequiredFraction;

  const anyFlagged = projectWeeks.some(
    (pw) => scoreProjectWeek(pw).priorityScore > 0,
  );

  const signals = buildSignalChips(agg);

  if (isCritical) {
    return {
      state: 'critical',
      headline: 'Critical — this period needs immediate attention',
      rationale:
        'One or more projects show high-risk findings, low average scores, or a significant share of missing expected inspections. Prioritize these before lower-signal items.',
      signals,
    };
  }
  if (isAttentionNeeded) {
    return {
      state: 'attention-needed',
      headline: 'Attention needed',
      rationale:
        'Several projects show risk or workflow signals that warrant a deliberate triage pass. No single critical threshold has been crossed.',
      signals,
    };
  }
  if (anyFlagged) {
    return {
      state: 'watchlist',
      headline: 'Watchlist — a few projects to monitor',
      rationale:
        'Most projects are clean. A small number of projects show signals worth monitoring this period.',
      signals,
    };
  }
  return {
    state: 'on-track',
    headline: 'On track',
    rationale:
      'No project-weeks in this reporting period show risk, score, or workflow signals that require drill-in.',
    signals,
  };
}
