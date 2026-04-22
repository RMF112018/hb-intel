import { describe, expect, it } from 'vitest';
import { parseChecklist } from './parseChecklist.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';

describe('parseChecklist', () => {
  it('parses metadata from the ScoreCard anchors', () => {
    const view = buildCleanAllYesWorkbook({
      projectSiteText: '2025-041 Brightwater Residences',
      inspectionNumber: '2',
      inspectionDate: '2026-04-23',
    });
    const parsed = parseChecklist(view);
    expect(parsed.metadata.inspectionDate).toBe('2026-04-23');
    expect(parsed.metadata.inspectionNumber).toBe('2');
    expect(parsed.metadata.projectSiteText).toContain('2025-041');
  });

  it('classifies responses from cell marks', () => {
    const view = buildCleanAllYesWorkbook({
      noRows: [44],
      naRows: [77],
      incompleteRows: [11],
      multiRows: [33],
    });
    const parsed = parseChecklist(view);
    const byRow = new Map(parsed.rows.map((r) => [r.rowNumber, r]));
    expect(byRow.get(44)?.response).toBe('no');
    expect(byRow.get(77)?.response).toBe('na');
    expect(byRow.get(11)?.response).toBe('incomplete');
    expect(byRow.get(33)?.response).toBe('multi');
    expect(byRow.get(12)?.response).toBe('yes');
  });
});
