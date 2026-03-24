/**
 * P3-E8-T09 Publication contract business rules.
 * Safety posture derivation, PER projection sanitization.
 */

import type { IncidentType } from '../records/enums.js';
import type { InspectionScoreBand } from '../inspection/enums.js';
import { deriveScoreBand } from '../inspection/business-rules.js';
import type { SafetyPosture } from './enums.js';
import type { ISafetyCompositeScorecard, ISafetyScorecardPERProjection } from './types.js';

// -- Safety Posture Derivation (§2.2) ---------------------------------------

/**
 * §2.2: Derive overall safety posture from composite scorecard.
 * Priority: CRITICAL > AT_RISK > ATTENTION > NORMAL > INSUFFICIENT_DATA.
 */
export const deriveSafetyPosture = (
  scorecard: Pick<ISafetyCompositeScorecard, 'inspectionTrend' | 'correctiveActions' | 'readiness' | 'blockers' | 'compliance'>,
  projectAgeWeeks: number = 4,
): SafetyPosture => {
  // INSUFFICIENT_DATA: project too young
  if (projectAgeWeeks < 2 && scorecard.inspectionTrend.inspectionCount === 0) {
    return 'INSUFFICIENT_DATA';
  }

  // CRITICAL: any HARD blocker, CRITICAL CA open > threshold, NOT_READY project
  if (
    scorecard.blockers.hardBlockersActive > 0 ||
    scorecard.correctiveActions.criticalOpenCount > 0 ||
    scorecard.readiness.projectDecision === 'NOT_READY'
  ) {
    return 'CRITICAL';
  }

  // AT_RISK: MAJOR CA overdue, 2+ subs NOT_READY, inspection score < 70
  if (
    scorecard.correctiveActions.majorOverdueCount > 0 ||
    scorecard.readiness.subcontractorsNotReady >= 2 ||
    (scorecard.inspectionTrend.latestNormalizedScore !== null &&
      scorecard.inspectionTrend.latestNormalizedScore < 70)
  ) {
    return 'AT_RISK';
  }

  // ATTENTION: READY_WITH_EXCEPTION, DECLINING trend, 1 sub NOT_READY, certs expired
  if (
    scorecard.readiness.projectDecision === 'READY_WITH_EXCEPTION' ||
    scorecard.inspectionTrend.trendDirection === 'DECLINING' ||
    scorecard.readiness.subcontractorsNotReady === 1 ||
    scorecard.compliance.certificationsExpired > 0
  ) {
    return 'ATTENTION';
  }

  return 'NORMAL';
};

// -- PER Projection (§2.3) — Sanitized ------------------------------------

/**
 * §2.3: Create sanitized PER projection from composite scorecard.
 * No raw scores, no individual details, no person names.
 */
export const createPERProjection = (
  scorecard: ISafetyCompositeScorecard,
  incidentCountThisMonth: number,
  incidentTypeSummary: Readonly<Partial<Record<IncidentType, number>>>,
): ISafetyScorecardPERProjection => {
  const scoreBand: InspectionScoreBand | null =
    scorecard.inspectionTrend.latestNormalizedScore !== null
      ? deriveScoreBand(scorecard.inspectionTrend.latestNormalizedScore)
      : null;

  return {
    projectId: scorecard.projectId,
    computedAt: scorecard.computedAt,
    overallPosture: scorecard.overallPosture,
    inspectionScoreBand: scoreBand,
    trendDirection: scorecard.inspectionTrend.trendDirection,
    openCorrectiveActionCount: scorecard.correctiveActions.openCount,
    overdueCorrectiveActionCount: scorecard.correctiveActions.overdueCount,
    projectReadinessDecision: scorecard.readiness.projectDecision,
    activeBlockerCount: scorecard.blockers.hardBlockersActive + scorecard.blockers.softBlockersActive,
    incidentCountThisMonth,
    incidentTypeSummary,
    ssspApproved: scorecard.compliance.ssspStatus === 'APPROVED',
  };
};
