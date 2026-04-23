import { describe, expect, it } from 'vitest';
import {
  PARSER_META_FIELDS,
  PARSER_NAMED_RANGES,
} from '../domain/templateContract.js';
import { extractMetadata } from './extractMetadata.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';

describe('extractMetadata parse-first precedence', () => {
  it('prefers ParserMeta over named ranges and visible cells when values are valid', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-01-01',
      inspectionNumber: '1',
      projectSiteText: '2026-001 Visible Project',
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
          A4: PARSER_META_FIELDS.inspectionDateRaw,
          B4: '2026-02-15',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: 7,
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '2026-777 ParserMeta Project',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: 'First finding\nSecond finding',
        },
        MetaNamed: {
          A1: '2026-03-01',
          A2: '99',
          A3: '2026-999 NamedRange Project',
        },
      },
      namedRanges: {
        [PARSER_NAMED_RANGES.inspectionDate]: { sheetName: 'MetaNamed', ref: 'A1' },
        [PARSER_NAMED_RANGES.inspectionNumber]: { sheetName: 'MetaNamed', ref: 'A2' },
        [PARSER_NAMED_RANGES.projectSite]: { sheetName: 'MetaNamed', ref: 'A3' },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.inspectionDate).toBe('2026-02-15');
    expect(metadata.inspectionNumber).toBe('7');
    expect(metadata.projectSiteText).toBe('2026-777 ParserMeta Project');
    expect(metadata.keyFindingsFreeText).toBe('First finding\nSecond finding');
  });

  it('prefers named ranges over visible cells when ParserMeta is absent', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-01-01',
      inspectionNumber: '1',
      projectSiteText: '2026-001 Visible Project',
      extraSheets: {
        MetaNamed: {
          A1: '2026-04-20',
          A2: '13',
          A3: '2026-313 NamedRange Project',
          A4: 'Line A',
          A5: 'Line B',
        },
      },
      namedRanges: {
        [PARSER_NAMED_RANGES.inspectionDate]: { sheetName: 'MetaNamed', ref: 'A1' },
        [PARSER_NAMED_RANGES.inspectionNumber]: { sheetName: 'MetaNamed', ref: 'A2' },
        [PARSER_NAMED_RANGES.projectSite]: { sheetName: 'MetaNamed', ref: 'A3' },
        [PARSER_NAMED_RANGES.keyFindingsLines]: { sheetName: 'MetaNamed', ref: 'A4:A5' },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.inspectionDate).toBe('2026-04-20');
    expect(metadata.inspectionNumber).toBe('13');
    expect(metadata.projectSiteText).toBe('2026-313 NamedRange Project');
    expect(metadata.keyFindingsFreeText).toBe('Line A\nLine B');
  });

  it('falls back to visible-cell legacy seam only when richer sources are absent', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-05-06',
      inspectionNumber: '17',
      projectSiteText: '2026-517 Legacy Project',
      notes: {},
    });

    const metadata = extractMetadata(view);

    expect(metadata.inspectionDate).toBe('2026-05-06');
    expect(metadata.inspectionNumber).toBe('17');
    expect(metadata.projectSiteText).toBe('2026-517 Legacy Project');
  });

  it('skips invalid ParserMeta field values and falls through to named-range values', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-01-01',
      inspectionNumber: '1',
      projectSiteText: '2026-001 Visible Project',
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
          A4: PARSER_META_FIELDS.projectSiteRaw,
          B4: 0,
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: 29,
        },
        MetaNamed: {
          A1: '2026-400 NamedRange Project',
          A2: 'Line 1',
          A3: 'Line 2',
        },
      },
      namedRanges: {
        [PARSER_NAMED_RANGES.projectSite]: { sheetName: 'MetaNamed', ref: 'A1' },
        [PARSER_NAMED_RANGES.keyFindingsLines]: { sheetName: 'MetaNamed', ref: 'A2:A3' },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.projectSiteText).toBe('2026-400 NamedRange Project');
    expect(metadata.keyFindingsFreeText).toBe('Line 1\nLine 2');
  });
});
