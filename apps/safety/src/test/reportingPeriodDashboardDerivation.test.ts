/**
 * Phase-04 audit G-04 — dashboard derivation (pure-function proof).
 *
 * Locks the canonical period-health state set, the priority weights and
 * thresholds, and the rankProjectWeeks sort + tie-break behavior. This is
 * the prioritization-honesty proof for Wave 3.
 */
import { describe, expect, it } from 'vitest';
import type { SafetyProjectWeekRecord } from '@hbc/features-safety';
import {
  DASHBOARD_HEALTH_THRESHOLDS,
  DASHBOARD_PRIORITY_WEIGHTS,
  classifyPeriodHealth,
  rankProjectWeeks,
  type SafetyPeriodHealthState,
} from '../pages/reportingPeriodDashboardDerivation.js';

function pw(overrides: Partial<SafetyProjectWeekRecord>): SafetyProjectWeekRecord {
  return {
    id: `pwr-${overrides.projectNumber ?? Math.random().toString(36).slice(2, 8)}`,
    spItemId: 1,
    title: 'Project-week',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
    projectNumber: 'P-000',
    projectNameSnapshot: 'Project snapshot',
    projectLocationSnapshot: '',
    projectStageSnapshot: '',
    projectSourceClassification: 'project',
    expectedInspectionThisWeek: true,
    inspectionCount: 1,
    averageInspectionScore: 0.9,
    highestRiskFindingLevel: null,
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'published',
    ...overrides,
  } as SafetyProjectWeekRecord;
}

describe('DASHBOARD_PRIORITY_WEIGHTS + DASHBOARD_HEALTH_THRESHOLDS', () => {
  it('locks the weight schema per the plan', () => {
    expect(DASHBOARD_PRIORITY_WEIGHTS).toEqual({
      highRiskFinding: 4,
      mediumRiskFinding: 2,
      scoreBelow75: 3,
      scoreBelow85: 1,
      reviewRequiredStatus: 2,
      missingExpectedInspection: 3,
    });
  });

  it('locks the aggregate thresholds per the plan', () => {
    expect(DASHBOARD_HEALTH_THRESHOLDS.criticalScoreBelow75Fraction).toBe(0.3);
    expect(DASHBOARD_HEALTH_THRESHOLDS.criticalMissingInspectionFraction).toBe(0.3);
    expect(DASHBOARD_HEALTH_THRESHOLDS.attentionMediumOrHighRiskFraction).toBe(0.15);
    expect(DASHBOARD_HEALTH_THRESHOLDS.attentionScoreBelow85Fraction).toBe(0.25);
    expect(DASHBOARD_HEALTH_THRESHOLDS.attentionReviewRequiredFraction).toBe(0.2);
  });
});

describe('classifyPeriodHealth — canonical state set', () => {
  it('returns on-track with an empty headline when the queue has no project-weeks', () => {
    const health = classifyPeriodHealth([]);
    expect(health.state).toBe<SafetyPeriodHealthState>('on-track');
    expect(health.signals).toEqual([]);
  });

  it('returns on-track when no project-week has any flagged signal', () => {
    const health = classifyPeriodHealth([
      pw({ projectNumber: 'P-01', averageInspectionScore: 0.95, inspectionCount: 2 }),
      pw({ projectNumber: 'P-02', averageInspectionScore: 0.9, inspectionCount: 3 }),
    ]);
    expect(health.state).toBe<SafetyPeriodHealthState>('on-track');
  });

  it('escalates to critical when any project has a high-risk finding', () => {
    const health = classifyPeriodHealth([
      pw({ projectNumber: 'P-01', highestRiskFindingLevel: 'high' }),
      pw({ projectNumber: 'P-02' }),
    ]);
    expect(health.state).toBe<SafetyPeriodHealthState>('critical');
    expect(health.signals.some((s) => s.id === 'high-risk')).toBe(true);
  });

  it('escalates to critical when ≥30% of scored projects fall below 0.75', () => {
    const health = classifyPeriodHealth([
      pw({ projectNumber: 'P-01', averageInspectionScore: 0.6 }),
      pw({ projectNumber: 'P-02', averageInspectionScore: 0.95 }),
      pw({ projectNumber: 'P-03', averageInspectionScore: 0.95 }),
    ]);
    expect(health.state).toBe<SafetyPeriodHealthState>('critical');
  });

  it('escalates to critical when ≥30% of expected inspections are missing', () => {
    const health = classifyPeriodHealth([
      pw({
        projectNumber: 'P-01',
        expectedInspectionThisWeek: true,
        inspectionCount: 0,
      }),
      pw({
        projectNumber: 'P-02',
        expectedInspectionThisWeek: true,
        inspectionCount: 1,
      }),
      pw({
        projectNumber: 'P-03',
        expectedInspectionThisWeek: true,
        inspectionCount: 1,
      }),
    ]);
    expect(health.state).toBe<SafetyPeriodHealthState>('critical');
  });

  it('resolves attention-needed when ≥15% have medium-or-high risk but no critical threshold is met', () => {
    const health = classifyPeriodHealth([
      pw({ projectNumber: 'P-01', highestRiskFindingLevel: 'medium', averageInspectionScore: 0.92 }),
      pw({ projectNumber: 'P-02', averageInspectionScore: 0.95 }),
      pw({ projectNumber: 'P-03', averageInspectionScore: 0.96 }),
      pw({ projectNumber: 'P-04', averageInspectionScore: 0.95 }),
      pw({ projectNumber: 'P-05', averageInspectionScore: 0.95 }),
      pw({ projectNumber: 'P-06', averageInspectionScore: 0.95 }),
    ]);
    expect(health.state).toBe<SafetyPeriodHealthState>('attention-needed');
  });

  it('resolves watchlist when 1–2 flagged projects exist below attention thresholds', () => {
    // 10 projects, 1 medium-risk: 10% medium-or-high (below 15% attention threshold).
    const entries: SafetyProjectWeekRecord[] = [];
    entries.push(
      pw({ projectNumber: 'P-01', highestRiskFindingLevel: 'medium', averageInspectionScore: 0.92 }),
    );
    for (let i = 2; i <= 10; i += 1) {
      entries.push(
        pw({ projectNumber: `P-${String(i).padStart(2, '0')}`, averageInspectionScore: 0.95 }),
      );
    }
    expect(classifyPeriodHealth(entries).state).toBe<SafetyPeriodHealthState>('watchlist');
  });
});

describe('rankProjectWeeks — sort, tie-break, filter', () => {
  it('includes only project-weeks with priorityScore > 0', () => {
    const items = rankProjectWeeks([
      pw({ projectNumber: 'P-01', averageInspectionScore: 0.92, highestRiskFindingLevel: null }),
      pw({ projectNumber: 'P-02', averageInspectionScore: 0.6 }),
    ]);
    expect(items.map((i) => i.projectWeek.projectNumber)).toEqual(['P-02']);
  });

  it('sorts descending by priorityScore', () => {
    const items = rankProjectWeeks([
      pw({ projectNumber: 'P-01', highestRiskFindingLevel: 'medium' }), // +2
      pw({ projectNumber: 'P-02', highestRiskFindingLevel: 'high' }), // +4
      pw({ projectNumber: 'P-03', averageInspectionScore: 0.6 }), // +3
    ]);
    expect(items.map((i) => i.projectWeek.projectNumber)).toEqual(['P-02', 'P-03', 'P-01']);
  });

  it('breaks ties on projectNumber ascending', () => {
    const items = rankProjectWeeks([
      pw({ projectNumber: 'P-02', highestRiskFindingLevel: 'high' }),
      pw({ projectNumber: 'P-01', highestRiskFindingLevel: 'high' }),
    ]);
    expect(items.map((i) => i.projectWeek.projectNumber)).toEqual(['P-01', 'P-02']);
  });

  it('resolves topReason in the locked signal order (risk level before score)', () => {
    const items = rankProjectWeeks([
      pw({
        projectNumber: 'P-01',
        highestRiskFindingLevel: 'high',
        averageInspectionScore: 0.6,
      }),
    ]);
    expect(items[0]?.topReason).toBe('High-risk finding');
    expect(items[0]?.reasons).toContain('Average score below 75%');
  });

  it('caps the list at the provided limit', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      pw({ projectNumber: `P-${String(i + 1).padStart(2, '0')}`, highestRiskFindingLevel: 'medium' }),
    );
    expect(rankProjectWeeks(entries, 3)).toHaveLength(3);
  });

  it('collects reason fragments per signal for a multi-signal project-week', () => {
    const items = rankProjectWeeks([
      pw({
        projectNumber: 'P-01',
        highestRiskFindingLevel: 'medium',
        averageInspectionScore: 0.6,
        publishStatus: 'review-required',
        expectedInspectionThisWeek: true,
        inspectionCount: 0,
      }),
    ]);
    const reasons = items[0]?.reasons ?? [];
    expect(reasons).toContain('Medium-risk finding');
    expect(reasons).toContain('Average score below 75%');
    expect(reasons).toContain('Review required');
    expect(reasons).toContain('No inspection logged this week');
  });
});
