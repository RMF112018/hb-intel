import {
  KEY_FINDINGS_FALLBACK_RANGE,
  KEY_FINDINGS_FREE_TEXT_CELL,
  METADATA_ENTRY_CELLS,
  PARSER_META_FIELDS,
  PARSER_NAMED_RANGES,
  SHEET_SCORECARD,
  SUMMARY_VALUE_CELLS,
} from '../domain/templateContract.js';
import type {
  InspectionMetadata,
  InspectionMetadataSources,
  ParserCriticalCellError,
  ParserValueSource,
} from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';
import {
  isExcelErrorLiteral,
  readNamedRangeLines,
  readNamedRangeNumber,
  readNamedRangeString,
  readParserMetaFieldNumber,
  readParserMetaFieldString,
  resolveContractMarkers,
} from './contractWorkbookAccess.js';
import { normalizeInspectionDate } from './dateNormalization.js';

interface Resolved<T> {
  readonly value: T;
  readonly source: ParserValueSource;
}

type ParserCriticalField = ParserCriticalCellError['field'];
type ParserCriticalSource = ParserCriticalCellError['source'];

export function extractMetadata(view: WorkbookView): InspectionMetadata {
  const markers = resolveContractMarkers(view);
  const allowLegacyFallback = !markers.markersPresent;
  const parserCriticalCellErrors: ParserCriticalCellError[] = [];

  const dateResolution = resolveDate(view, allowLegacyFallback, parserCriticalCellErrors);
  const inspectionNumberResolution = resolveInspectionNumber(
    view,
    allowLegacyFallback,
    parserCriticalCellErrors,
  );
  const projectSiteResolution = resolveProjectSite(view, allowLegacyFallback, parserCriticalCellErrors);
  const keyFindingsResolution = resolveKeyFindings(view, allowLegacyFallback, parserCriticalCellErrors);
  const reportingWeekStartResolution = resolveReportingField(
    view,
    PARSER_META_FIELDS.reportingWeekStart,
    PARSER_NAMED_RANGES.parserReportingWeekStart,
    'reportingWeekStart',
    normalizeDateOrNull,
    parserCriticalCellErrors,
  );
  const reportingWeekEndResolution = resolveReportingField(
    view,
    PARSER_META_FIELDS.reportingWeekEnd,
    PARSER_NAMED_RANGES.parserReportingWeekEnd,
    'reportingWeekEnd',
    normalizeDateOrNull,
    parserCriticalCellErrors,
  );
  const reportingPeriodLabelResolution = resolveReportingField(
    view,
    PARSER_META_FIELDS.reportingPeriodLabel,
    PARSER_NAMED_RANGES.parserReportingPeriodLabel,
    'reportingPeriodLabel',
    (raw) => (raw === null ? null : raw.trim() || null),
    parserCriticalCellErrors,
  );

  const projectSiteText = projectSiteResolution.value;

  const sources: InspectionMetadataSources = {
    inspectionDate: dateResolution.source,
    inspectionNumber: inspectionNumberResolution.source,
    projectSite: projectSiteResolution.source,
    keyFindings: keyFindingsResolution.source,
    reportingWeekStart: reportingWeekStartResolution.source,
    reportingWeekEnd: reportingWeekEndResolution.source,
    reportingPeriodLabel: reportingPeriodLabelResolution.source,
  };

  return {
    inspectionDate: dateResolution.value,
    projectSiteText,
    inspectionNumber: inspectionNumberResolution.value,
    projectNumberHint: extractProjectNumberHint(projectSiteText),
    workbookTotalYes: firstValidNumber(
      readParserMetaFieldNumber(view, PARSER_META_FIELDS.totalYes),
      readNamedRangeNumber(view, PARSER_NAMED_RANGES.totalYes),
      allowLegacyFallback ? view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalYes) : null,
    ),
    workbookTotalNo: firstValidNumber(
      readParserMetaFieldNumber(view, PARSER_META_FIELDS.totalNo),
      readNamedRangeNumber(view, PARSER_NAMED_RANGES.totalNo),
      allowLegacyFallback ? view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNo) : null,
    ),
    workbookTotalNa: firstValidNumber(
      readParserMetaFieldNumber(view, PARSER_META_FIELDS.totalNa),
      readNamedRangeNumber(view, PARSER_NAMED_RANGES.totalNa),
      allowLegacyFallback ? view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNa) : null,
    ),
    workbookSafetyScorePct: firstValidNumber(
      readParserMetaFieldNumber(view, PARSER_META_FIELDS.safetyScore),
      readNamedRangeNumber(view, PARSER_NAMED_RANGES.safetyScore),
      allowLegacyFallback ? view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.safetyScore) : null,
    ),
    keyFindingsFreeText: keyFindingsResolution.value,
    reportingWeekStart: reportingWeekStartResolution.value,
    reportingWeekEnd: reportingWeekEndResolution.value,
    reportingPeriodLabel: reportingPeriodLabelResolution.value,
    sources,
    parserCriticalCellErrors,
  };
}

/** Pull the canonical `####-##` or `####-####` project number from free-form site text. */
export function extractProjectNumberHint(projectSiteText: string): string | null {
  if (!projectSiteText) return null;
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : null;
}

function resolveDate(
  view: WorkbookView,
  allowLegacyFallback: boolean,
  errors: ParserCriticalCellError[],
): Resolved<string> {
  const parserMetaRaw = sanitizeParserCriticalString(
    readParserMetaFieldString(view, PARSER_META_FIELDS.inspectionDateRaw),
    'inspectionDate',
    'parser-meta',
    errors,
  );
  const parserMeta = normalizeDateOrNull(parserMetaRaw);
  if (parserMeta !== null) return { value: parserMeta, source: 'parser-meta' };

  const namedRaw = normalizeDateOrNull(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserInspectionDateRaw),
      'inspectionDate',
      'named-range',
      errors,
    ),
  );
  if (namedRaw !== null) return { value: namedRaw, source: 'named-range' };

  const namedLegacy = normalizeDateOrNull(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.inspectionDate),
      'inspectionDate',
      'named-range',
      errors,
    ),
  );
  if (namedLegacy !== null) return { value: namedLegacy, source: 'named-range' };

  if (allowLegacyFallback) {
    const cellString = view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date);
    const cellNumber = view.cellNumber(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date);
    const legacy = normalizeInspectionDate(cellString ?? cellNumber);
    if (legacy !== null) return { value: legacy, source: 'legacy' };
  }

  return { value: '', source: 'none' };
}

function resolveInspectionNumber(
  view: WorkbookView,
  allowLegacyFallback: boolean,
  errors: ParserCriticalCellError[],
): Resolved<string> {
  const parserMeta = normalizeInspectionNumber(
    sanitizeParserCriticalString(
      readParserMetaFieldString(view, PARSER_META_FIELDS.inspectionNumberRaw),
      'inspectionNumber',
      'parser-meta',
      errors,
    ),
  );
  if (parserMeta !== null) return { value: parserMeta, source: 'parser-meta' };

  const namedRaw = normalizeInspectionNumber(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserInspectionNumberRaw),
      'inspectionNumber',
      'named-range',
      errors,
    ),
  );
  if (namedRaw !== null) return { value: namedRaw, source: 'named-range' };

  const namedLegacy = normalizeInspectionNumber(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.inspectionNumber),
      'inspectionNumber',
      'named-range',
      errors,
    ),
  );
  if (namedLegacy !== null) return { value: namedLegacy, source: 'named-range' };

  if (allowLegacyFallback) {
    const legacy = normalizeInspectionNumber(
      view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.inspectionNumber),
    );
    if (legacy !== null) return { value: legacy, source: 'legacy' };
  }

  return { value: '', source: 'none' };
}

function resolveProjectSite(
  view: WorkbookView,
  allowLegacyFallback: boolean,
  errors: ParserCriticalCellError[],
): Resolved<string> {
  const parserMeta = sanitizeProjectSite(
    sanitizeParserCriticalString(
      readParserMetaFieldString(view, PARSER_META_FIELDS.projectSiteRaw),
      'projectSite',
      'parser-meta',
      errors,
    ),
  );
  if (parserMeta !== null) return { value: parserMeta, source: 'parser-meta' };

  const namedRaw = sanitizeProjectSite(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserProjectSiteRaw),
      'projectSite',
      'named-range',
      errors,
    ),
  );
  if (namedRaw !== null) return { value: namedRaw, source: 'named-range' };

  const namedLegacy = sanitizeProjectSite(
    sanitizeParserCriticalString(
      readNamedRangeString(view, PARSER_NAMED_RANGES.projectSite),
      'projectSite',
      'named-range',
      errors,
    ),
  );
  if (namedLegacy !== null) return { value: namedLegacy, source: 'named-range' };

  if (allowLegacyFallback) {
    const legacy = sanitizeProjectSite(view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.projectSite));
    if (legacy !== null) return { value: legacy, source: 'legacy' };
  }

  return { value: '', source: 'none' };
}

function resolveKeyFindings(
  view: WorkbookView,
  allowLegacyFallback: boolean,
  errors: ParserCriticalCellError[],
): Resolved<string> {
  const parserMeta = sanitizeParserCriticalString(
    readParserMetaFieldString(view, PARSER_META_FIELDS.keyFindingsNormalized),
    'keyFindings',
    'parser-meta',
    errors,
  );
  const parserMetaAsNumber = readParserMetaFieldNumber(view, PARSER_META_FIELDS.keyFindingsNormalized);
  if (
    parserMeta &&
    !(parserMetaAsNumber !== null && parserMeta === String(parserMetaAsNumber))
  ) {
    return { value: normalizeMultiline(parserMeta), source: 'parser-meta' };
  }

  const rawNamedLines = view.namedRangeStrings(PARSER_NAMED_RANGES.keyFindingsLines)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (rawNamedLines.some((line) => isExcelErrorLiteral(line))) {
    errors.push({
      field: 'keyFindings',
      source: 'named-range',
      value: rawNamedLines.find((line) => isExcelErrorLiteral(line)) ?? '#ERROR',
    });
  }
  const namedLines = readNamedRangeLines(view, PARSER_NAMED_RANGES.keyFindingsLines);
  if (namedLines.length > 0) {
    return { value: normalizeMultiline(namedLines.join('\n')), source: 'named-range' };
  }

  if (allowLegacyFallback) {
    const fallbackRangeLines = readLegacyRangeLines(view, KEY_FINDINGS_FALLBACK_RANGE);
    if (fallbackRangeLines.length > 0) {
      return { value: normalizeMultiline(fallbackRangeLines.join('\n')), source: 'legacy' };
    }

    const legacyCell = view.cellString(SHEET_SCORECARD, KEY_FINDINGS_FREE_TEXT_CELL) ?? '';
    const normalized = normalizeMultiline(legacyCell);
    if (normalized.length > 0) return { value: normalized, source: 'legacy' };
  }

  return { value: '', source: 'none' };
}

function resolveReportingField(
  view: WorkbookView,
  parserMetaField: string,
  namedRange: string,
  field: ParserCriticalField,
  normalize: (raw: string | null) => string | null,
  errors: ParserCriticalCellError[],
): Resolved<string | null> {
  const parserMeta = normalize(
    sanitizeParserCriticalString(
      readParserMetaFieldString(view, parserMetaField),
      field,
      'parser-meta',
      errors,
    ),
  );
  if (parserMeta !== null) return { value: parserMeta, source: 'parser-meta' };

  const named = normalize(
    sanitizeParserCriticalString(
      readNamedRangeString(view, namedRange),
      field,
      'named-range',
      errors,
    ),
  );
  if (named !== null) return { value: named, source: 'named-range' };

  return { value: null, source: 'none' };
}

function normalizeDateOrNull(raw: string | null): string | null {
  const normalized = normalizeInspectionDate(raw ?? null);
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeInspectionNumber(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const whole = Number(trimmed);
  if (Number.isFinite(whole) && Number.isInteger(whole) && whole > 0) {
    return String(whole);
  }
  return trimmed;
}

function sanitizeProjectSite(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '0') return null;
  return trimmed;
}

function readLegacyRangeLines(view: WorkbookView, range: string): ReadonlyArray<string> {
  const [start, end] = range.split(':');
  if (!start || !end) return [];
  const startMatch = /^([A-Z]+)(\d+)$/i.exec(start);
  const endMatch = /^([A-Z]+)(\d+)$/i.exec(end);
  if (!startMatch || !endMatch) return [];
  if (startMatch[1].toUpperCase() !== endMatch[1].toUpperCase()) return [];

  const column = startMatch[1].toUpperCase();
  const from = Number(startMatch[2]);
  const to = Number(endMatch[2]);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) return [];

  const lines: string[] = [];
  for (let row = from; row <= to; row += 1) {
    const value = (view.cellString(SHEET_SCORECARD, `${column}${row}`) ?? '').trim();
    if (value.length > 0) lines.push(value);
  }
  return lines;
}

function firstValidNumber(...values: Array<number | null>): number | null {
  for (const value of values) {
    if (value !== null && Number.isFinite(value)) return value;
  }
  return null;
}

function normalizeMultiline(raw: string): string {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

function sanitizeParserCriticalString(
  raw: string | null,
  field: ParserCriticalField,
  source: ParserCriticalSource,
  errors: ParserCriticalCellError[],
): string | null {
  if (raw === null) return null;
  if (isExcelErrorLiteral(raw)) {
    errors.push({ field, source, value: raw.trim() });
    return null;
  }
  return raw;
}
