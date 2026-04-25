import { beforeEach, describe, expect, it } from 'vitest';
import { generateCandidateScore } from '../generate.js';
import { rankCandidates } from '../ranking.js';
import { EXCELLENCE_REASON_CODES } from '../types.js';
import {
  makeFinding,
  makeInput,
  makeInspection,
  makeProjectWeek,
  resetCounters,
} from './fixtures.js';

describe('generate (integration)', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('produces an eligible primary candidate end-to-end', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({
          projectNumber: '4815',
          projectStageSnapshot: 'Active Construction',
        }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.96 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.94 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
        ],
        priorInspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.9 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.92 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.91 }),
        ],
        activityEvidence: {
          status: 'proven',
          source: 'manual',
          activeTradeCount: 8,
          estimatedManpower: 64,
        },
      }),
    );
    expect(score.eligibilityStatus).toBe('eligible');
    expect(['primary', 'secondary']).toContain(score.publishRecommendation);
    expect(score.compositeScore).toBeGreaterThan(70);
    expect(score.activityEvidenceStatus).toBe('proven');
    expect(score.sourceInspectionIds).toHaveLength(3);
  });

  it('produces a do-not-publish candidate for the perfect-score-without-activity case', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 }),
        ],
      }),
    );
    expect(score.publishRecommendation).toBe('do-not-publish');
    expect(score.eligibilityStatus).toBe('ineligible');
    expect(score.exclusionReasons).toContain(
      EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
    );
  });

  it('produces a low-confidence monitor candidate when data quality is poor', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.92 }),
          makeInspection({ status: 'duplicate-suspected' }),
          makeInspection({ status: 'duplicate-suspected' }),
          makeInspection({ status: 'accepted', scoreFraction: 0.9, parserVersion: '' }),
        ],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    expect(['low-confidence', 'eligible']).toContain(score.eligibilityStatus);
    if (score.eligibilityStatus === 'low-confidence') {
      expect(score.publishRecommendation).toBe('monitor');
    }
  });

  it('ranking places eligible primary above do-not-publish even with higher raw score', () => {
    const eligible = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({
          projectNumber: '4815',
          projectStageSnapshot: 'Active Construction',
        }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.94 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.93 }),
        ],
        priorInspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.9 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.91 }),
        ],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    const blocked = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({
          projectNumber: '9999',
          projectStageSnapshot: 'Closeout',
        }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 1, totalNo: 0 }),
        ],
      }),
    );
    const ranked = rankCandidates([blocked, eligible]);
    expect(ranked[0].publishRecommendation).not.toBe('do-not-publish');
  });

  it('serializes activity evidence into JSON for persistence', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [makeInspection({ status: 'accepted', scoreFraction: 0.9 })],
        activityEvidence: { status: 'proven', source: 'manual', activeTradeCount: 6 },
      }),
    );
    const parsed = JSON.parse(score.activityEvidenceJson);
    expect(parsed.status).toBe('proven');
    expect(parsed.source).toBe('manual');
  });

  it('domain output never contains raw checklist or inspector detail', () => {
    const score = generateCandidateScore(
      makeInput({
        projectWeek: makeProjectWeek({ projectStageSnapshot: 'Active Construction' }),
        inspections: [
          makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
          makeInspection({ status: 'accepted', scoreFraction: 0.92 }),
        ],
        findings: [makeFinding({ severity: 'medium', isOpen: false })],
        activityEvidence: { status: 'proven', source: 'manual' },
      }),
    );
    const serialized = JSON.stringify(score);
    expect(serialized).not.toMatch(/rawChecklistJson|inspectorName|inspectorUpn/i);
  });
});
