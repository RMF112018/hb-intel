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
    expect(metadata.sources.inspectionDate).toBe('parser-meta');
    expect(metadata.sources.inspectionNumber).toBe('parser-meta');
    expect(metadata.sources.projectSite).toBe('parser-meta');
    expect(metadata.sources.keyFindings).toBe('parser-meta');
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
    expect(metadata.sources.inspectionDate).toBe('named-range');
    expect(metadata.sources.inspectionNumber).toBe('named-range');
    expect(metadata.sources.projectSite).toBe('named-range');
    expect(metadata.sources.keyFindings).toBe('named-range');
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
    expect(metadata.sources.inspectionDate).toBe('legacy');
    expect(metadata.sources.inspectionNumber).toBe('legacy');
    expect(metadata.sources.projectSite).toBe('legacy');
  });

  it('does not use visible-cell legacy fallback when parser markers are present', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-05-06',
      inspectionNumber: '17',
      projectSiteText: '2026-517 Visible Project',
      extraSheets: {
        ParserMeta: {
          A1: 'Field',
          B1: 'Value',
          A2: PARSER_META_FIELDS.templateVersion,
          B2: 'SafetyChecklist_v1',
          A3: PARSER_META_FIELDS.parserContractVersion,
          B3: 'parse-first-2026-04',
        },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.inspectionDate).toBe('');
    expect(metadata.inspectionNumber).toBe('');
    expect(metadata.projectSiteText).toBe('');
    expect(metadata.sources.inspectionDate).toBe('none');
    expect(metadata.sources.inspectionNumber).toBe('none');
    expect(metadata.sources.projectSite).toBe('none');
  });

  it('exposes reporting-period markers with source when parserMeta populates them', () => {
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
          B4: '2026-04-22',
          A5: PARSER_META_FIELDS.inspectionNumberRaw,
          B5: 3,
          A6: PARSER_META_FIELDS.reportingWeekStart,
          B6: '2026-04-20',
          A7: PARSER_META_FIELDS.reportingWeekEnd,
          B7: '2026-04-24',
          A8: PARSER_META_FIELDS.reportingPeriodLabel,
          B8: 'Apr 20 - Apr 24, 2026',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: 'One finding',
        },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.reportingWeekStart).toBe('2026-04-20');
    expect(metadata.reportingWeekEnd).toBe('2026-04-24');
    expect(metadata.reportingPeriodLabel).toBe('Apr 20 - Apr 24, 2026');
    expect(metadata.sources.reportingWeekStart).toBe('parser-meta');
    expect(metadata.sources.reportingWeekEnd).toBe('parser-meta');
    expect(metadata.sources.reportingPeriodLabel).toBe('parser-meta');
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

  it('treats parser error literals as invalid parser-critical values and records critical errors', () => {
    const view = buildCleanAllYesWorkbook({
      inspectionDate: '2026-05-06',
      inspectionNumber: '17',
      projectSiteText: '2026-517 Visible Project',
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
          B5: '#NAME?',
          A6: PARSER_META_FIELDS.projectSiteRaw,
          B6: '#REF!',
          A14: PARSER_META_FIELDS.keyFindingsNormalized,
          B14: '#NAME?',
        },
        MetaNamed: {
          A1: '2026-04-22',
          A2: '3',
          A3: '2026-300 Named Project',
          A4: '#NAME?',
          A5: 'Finding from named line',
        },
      },
      namedRanges: {
        [PARSER_NAMED_RANGES.parserInspectionDateRaw]: { sheetName: 'MetaNamed', ref: 'A1' },
        [PARSER_NAMED_RANGES.parserInspectionNumberRaw]: { sheetName: 'MetaNamed', ref: 'A2' },
        [PARSER_NAMED_RANGES.parserProjectSiteRaw]: { sheetName: 'MetaNamed', ref: 'A3' },
        [PARSER_NAMED_RANGES.keyFindingsLines]: { sheetName: 'MetaNamed', ref: 'A4:A5' },
      },
    });

    const metadata = extractMetadata(view);

    expect(metadata.inspectionDate).toBe('2026-04-22');
    expect(metadata.inspectionNumber).toBe('3');
    expect(metadata.projectSiteText).toBe('2026-300 Named Project');
    expect(metadata.keyFindingsFreeText).toBe('Finding from named line');
    expect(metadata.sources.inspectionDate).toBe('named-range');
    expect(metadata.sources.inspectionNumber).toBe('named-range');
    expect(metadata.sources.projectSite).toBe('named-range');
    expect(metadata.sources.keyFindings).toBe('named-range');
    expect(metadata.parserCriticalCellErrors?.length).toBeGreaterThanOrEqual(4);
    expect(metadata.parserCriticalCellErrors?.some((e) => e.field === 'keyFindings')).toBe(true);
  });
});
