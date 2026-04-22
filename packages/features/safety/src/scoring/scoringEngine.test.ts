import { describe, expect, it } from 'vitest';
import { computeInspectionScore } from './scoringEngine.js';
import { parseChecklist } from '../parser/parseChecklist.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';

describe('scoringEngine', () => {
  it('scores a clean all-yes workbook at 100%', () => {
    const parsed = parseChecklist(buildCleanAllYesWorkbook());
    const score = computeInspectionScore(parsed);
    expect(score.finalScorePct).toBeCloseTo(1.0, 5);
    expect(score.scoringMode).toBe('template-compat-v1');
  });

  it('excludes rows 20/37/62/63/99/100 from compat count-ranges', () => {
    // Mark all of these "No"; they should not reduce the weighted score
    // because compat mode does not count them.
    const parsed = parseChecklist(
      buildCleanAllYesWorkbook({ noRows: [20, 37, 62, 63, 99, 100] }),
    );
    const score = computeInspectionScore(parsed);
    expect(score.finalScorePct).toBeCloseTo(1.0, 5);
    // Excluded rows still get counted in the overall totals
    expect(score.totalNo).toBe(6);
  });

  it('deducts weighted contribution when a counted row is No', () => {
    // Section 4 (Fall Protection) has weight 0.18 and 10 displayed rows.
    // Flipping row 44 from yes to no should drop the score by
    // 0.18 * (1/10) = 0.018.
    const cleanScore = computeInspectionScore(parseChecklist(buildCleanAllYesWorkbook()));
    const flippedScore = computeInspectionScore(
      parseChecklist(buildCleanAllYesWorkbook({ noRows: [44] })),
    );
    expect(cleanScore.finalScorePct - flippedScore.finalScorePct).toBeCloseTo(0.018, 5);
  });

  it('throws for unimplemented normalized-vNext mode', () => {
    const parsed = parseChecklist(buildCleanAllYesWorkbook());
    expect(() => computeInspectionScore(parsed, 'normalized-vNext')).toThrow();
  });
});
