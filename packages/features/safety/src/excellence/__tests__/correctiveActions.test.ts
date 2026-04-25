import { beforeEach, describe, expect, it } from 'vitest';
import {
  computeCorrectiveActionScore,
  summarizeFindings,
} from '../correctiveActions.js';
import { makeFinding, resetCounters } from './fixtures.js';

describe('correctiveActions', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('summarizes severities and open counts', () => {
    const summary = summarizeFindings(
      [
        makeFinding({ severity: 'high', isOpen: true }),
        makeFinding({ severity: 'medium', isOpen: true }),
        makeFinding({ severity: 'medium', isOpen: false }),
        makeFinding({ severity: 'info', isOpen: true }),
      ],
      [],
      '4815',
    );
    expect(summary.highSeverityFindingCount).toBe(1);
    expect(summary.mediumSeverityFindingCount).toBe(2);
    expect(summary.openFindingCount).toBe(3);
    expect(summary.highSeverityOpenCount).toBe(1);
    expect(summary.mediumSeverityOpenCount).toBe(1);
    expect(summary.highestRiskFindingLevel).toBe('high');
  });

  it('detects repeat findings via (project, section, row) key', () => {
    const summary = summarizeFindings(
      [makeFinding({ sectionNumber: 5, checklistRowNumber: 22 })],
      [
        makeFinding({ sectionNumber: 5, checklistRowNumber: 22 }),
        makeFinding({ sectionNumber: 5, checklistRowNumber: 99 }),
      ],
      '4815',
    );
    expect(summary.repeatFindingCount).toBe(1);
  });

  it('reports zero repeats when keys do not align', () => {
    const summary = summarizeFindings(
      [makeFinding({ sectionNumber: 1, checklistRowNumber: 2 })],
      [makeFinding({ sectionNumber: 9, checklistRowNumber: 9 })],
      '4815',
    );
    expect(summary.repeatFindingCount).toBe(0);
  });

  it('penalizes high-severity open findings most strongly', () => {
    const summary = summarizeFindings(
      [
        makeFinding({ severity: 'high', isOpen: true }),
        makeFinding({ severity: 'high', isOpen: true }),
      ],
      [],
      '4815',
    );
    const result = computeCorrectiveActionScore(summary);
    expect(result.score).toBe(50); // 100 - 25*2
    expect(result.confidence).toBe('low');
  });

  it('reduces score for medium open findings', () => {
    const summary = summarizeFindings(
      [
        makeFinding({ severity: 'medium', isOpen: true }),
        makeFinding({ severity: 'medium', isOpen: true }),
      ],
      [],
      '4815',
    );
    const result = computeCorrectiveActionScore(summary);
    expect(result.score).toBe(80); // 100 - 10*2
  });

  it('caps high-severity penalty', () => {
    const summary = summarizeFindings(
      Array.from({ length: 5 }, () => makeFinding({ severity: 'high', isOpen: true })),
      [],
      '4815',
    );
    const result = computeCorrectiveActionScore(summary);
    expect(result.score).toBe(40); // 100 - capped 60
  });

  it('reports low confidence today since due/resolved date data does not exist', () => {
    const summary = summarizeFindings([], [], '4815');
    const result = computeCorrectiveActionScore(summary);
    expect(result.confidence).toBe('low');
    expect(summary.agedOpenFindingCount).toBe(0);
  });

  it('does not produce false confidence when there are no findings and no activity evidence', () => {
    const summary = summarizeFindings([], [], '4815');
    const result = computeCorrectiveActionScore(summary);
    expect(result.score).toBe(100);
    // The high score is fine here in isolation; the combined eligibility
    // path enforces activity evidence separately.
    expect(result.confidence).toBe('low');
  });
});
