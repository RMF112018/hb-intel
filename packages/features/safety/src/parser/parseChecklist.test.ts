import { describe, expect, it } from 'vitest';
import { PARSER_META_FIELDS } from '../domain/templateContract.js';
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

  it('emits template/parser version from authoritative markers when present', () => {
    const view = buildCleanAllYesWorkbook({
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '2026-04-22',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: '2',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-002 Marker Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '',
        },
      },
    });

    const parsed = parseChecklist(view);
    expect(parsed.templateVersion).toBe('SafetyChecklist_v1');
    expect(parsed.parserVersion).toBe('parse-first-2026-04');
  });

  it('surfaces parser-critical cell errors from extracted metadata', () => {
    const view = buildCleanAllYesWorkbook({
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '#VALUE!',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: '2',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-002 Marker Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '#NAME?',
        },
      },
    });

    const parsed = parseChecklist(view);
    expect(parsed.metadata.parserCriticalCellErrors?.length).toBeGreaterThanOrEqual(2);
    expect(parsed.metadata.parserCriticalCellErrors?.some((e) => e.field === 'inspectionDate')).toBe(true);
    expect(parsed.metadata.parserCriticalCellErrors?.some((e) => e.field === 'keyFindings')).toBe(true);
  });
});
