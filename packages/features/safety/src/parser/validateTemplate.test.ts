import { describe, expect, it } from 'vitest';
import {
  PARSER_META_FIELDS,
} from '../domain/templateContract.js';
import { createSyntheticWorkbookView } from './workbookView.js';
import { validateTemplate } from './validateTemplate.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';
import { TemplateInvalidError } from '../domain/types.js';

describe('validateTemplate', () => {
  it('accepts a clean v1 workbook', () => {
    const view = buildCleanAllYesWorkbook();
    const result = validateTemplate(view);
    expect(result.templateVersion).toBe('v1');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when a required sheet is missing', () => {
    const view = createSyntheticWorkbookView({
      ScoreCard: { A1: 'Construction Site Safety Walk Checklist' },
    });
    expect(() => validateTemplate(view)).toThrow(TemplateInvalidError);
  });

  it('rejects when a response-matrix header drifts', () => {
    const view = buildCleanAllYesWorkbook({ missingResponseHeader: 'score' });
    expect(() => validateTemplate(view)).toThrow(TemplateInvalidError);
  });

  it('rejects unsupported TemplateVersion marker when parser markers are present', () => {
    const view = buildCleanAllYesWorkbook({
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_vNEXT',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '2026-04-22',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: '5',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-005 Marker Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '',
        },
      },
    });

    expect(() => validateTemplate(view)).toThrow(/Unsupported TemplateVersion marker/i);
  });

  it('rejects unsupported ParserContractVersion marker', () => {
    const view = buildCleanAllYesWorkbook({
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-99',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '2026-04-22',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: '5',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-005 Marker Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '',
        },
      },
    });

    expect(() => validateTemplate(view)).toThrow(/Unsupported ParserContractVersion marker/i);
  });

  it('rejects marker mode when ParserContractVersion is missing', () => {
    const view = buildCleanAllYesWorkbook({
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '2026-04-22',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: '5',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-005 Marker Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '',
        },
      },
    });

    expect(() => validateTemplate(view)).toThrow(/ParserContractVersion marker is missing/i);
  });

  it('accepts legacy workbook path when parser markers are absent', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-04-22',
      inspectionNumber: '5',
      projectSiteText: '2026-005 Legacy Project',
    });
    expect(() => validateTemplate(view)).not.toThrow();
  });
});
