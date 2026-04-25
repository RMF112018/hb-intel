import { beforeEach, describe, expect, it } from 'vitest';
import { generateCandidateScore } from '../generate.js';
import { EXCELLENCE_REASON_CODES } from '../types.js';
import {
  makeFinding,
  makeInput,
  makeInspection,
  makeProjectWeek,
  resetCounters,
} from './fixtures.js';

describe('eligibility — perfect-score suppression and gates', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('one accepted 100% inspection with missing activity evidence is NEVER primary', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 }),
        ],
      }),
    );
    expect(score.publishRecommendation).not.toBe('primary');
    expect(score.publishRecommendation).toBe('do-not-publish');
    expect(score.eligibilityStatus).toBe('ineligible');
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
    );
  });

  it('one accepted 100% inspection with inferred activity evidence is NEVER primary', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 })],
      }),
    );
    // Even with inferred evidence, the suppression rule disqualifies any
    // single-inspection 100% case unless evidence.status is 'proven'.
    expect(score.publishRecommendation).not.toBe('primary');
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
    );
  });

  it('100% during a mobilization-like stage with no proven exposure is NEVER primary', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Mobilization' }),
        inspections: [makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 })],
      }),
    );
    expect(score.publishRecommendation).not.toBe('primary');
  });

  it('multiple accepted inspections with proven activity and no high-risk findings are eligible', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.92 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.97 }),
        ],
        priorInspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.9 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.91 }),
        ],
        activityEvidence: {
          status: 'proven',
          source: 'manual',
          activeTradeCount: 6,
          estimatedManpower: 48,
        },
      }),
    );
    expect(score.eligibilityStatus).toBe('eligible');
    expect(['primary', 'secondary']).toContain(score.publishRecommendation);
  });

  it('records the suppression reason code on suppressed candidates', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
        inspections: [makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 })],
      }),
    );
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
    );
  });

  it('flags review-required inspections for needs-review status', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
          makeInspection({ status: 'review-required', scoreFraction: 0.5 }),
        ],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    expect(score.eligibilityStatus).toBe('needs-review');
    expect(score.publishRecommendation).toBe('monitor');
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.REVIEW_REQUIRED_INSPECTIONS,
    );
  });

  it('disqualifies candidate with unresolved high-severity open finding', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.92 }),
        ],
        findings: [makeFinding({ severity: 'high', isOpen: true })],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    expect(score.eligibilityStatus).toBe('ineligible');
    expect(score.publishRecommendation).toBe('do-not-publish');
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.UNRESOLVED_HIGH_SEVERITY_FINDING,
    );
  });

  it('disqualifies an unresolved project regardless of score', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({
          projectSourceClassification: 'unresolved',
          projectNumber: '',
        }),
        inspections: [makeInspection({ status: 'accepted', scoreFraction: 0.95 })],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    expect(score.eligibilityStatus).toBe('ineligible');
    expect(score.exclusionReasons).toContain(EXCELLENCE_REASON_CODES.PROJECT_NOT_RESOLVED);
  });
});
