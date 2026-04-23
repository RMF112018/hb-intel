import {
  KEY_FINDINGS_FALLBACK_RANGE,
  KEY_FINDINGS_FREE_TEXT_CELL,
  METADATA_ENTRY_CELLS,
  PARSER_META_FIELDS,
  PARSER_NAMED_RANGES,
  SHEET_SCORECARD,
  SUMMARY_VALUE_CELLS,
} from '../domain/templateContract.js';
import type { InspectionMetadata } from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';
import {
  readNamedRangeLines,
  readNamedRangeNumber,
  readNamedRangeString,
  readParserMetaFieldNumber,
  readParserMetaFieldString,
  resolveContractMarkers,
} from './contractWorkbookAccess.js';
import { normalizeInspectionDate } from './dateNormalization.js';

export function extractMetadata(view: WorkbookView): InspectionMetadata {
  const markers = resolveContractMarkers(view);
  const allowLegacyFallback = !markers.markersPresent;

  const normalizedDate =
    normalizeInspectionDate(
      readParserMetaFieldString(view, PARSER_META_FIELDS.inspectionDateRaw) ??
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserInspectionDateRaw) ??
      readNamedRangeString(view, PARSER_NAMED_RANGES.inspectionDate) ??
      (allowLegacyFallback
        ? view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date) ??
          view.cellNumber(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date)
        : null),
    ) ?? '';

  const projectSiteText = firstValidString(
    sanitizeProjectSite(readParserMetaFieldString(view, PARSER_META_FIELDS.projectSiteRaw)),
    sanitizeProjectSite(readNamedRangeString(view, PARSER_NAMED_RANGES.parserProjectSiteRaw)),
    sanitizeProjectSite(readNamedRangeString(view, PARSER_NAMED_RANGES.projectSite)),
    allowLegacyFallback
      ? sanitizeProjectSite(view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.projectSite))
      : null,
  ) ?? '';

  const inspectionNumber = firstValidString(
    normalizeInspectionNumber(readParserMetaFieldString(view, PARSER_META_FIELDS.inspectionNumberRaw)),
    normalizeInspectionNumber(readNamedRangeString(view, PARSER_NAMED_RANGES.parserInspectionNumberRaw)),
    normalizeInspectionNumber(readNamedRangeString(view, PARSER_NAMED_RANGES.inspectionNumber)),
    allowLegacyFallback
      ? normalizeInspectionNumber(view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.inspectionNumber))
      : null,
  ) ?? '';

  return {
    inspectionDate: normalizedDate,
    projectSiteText,
    inspectionNumber,
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
    keyFindingsFreeText: resolveKeyFindingsText(view, allowLegacyFallback),
  };
}

/** Pull the canonical `####-##` or `####-####` project number from free-form site text. */
export function extractProjectNumberHint(projectSiteText: string): string | null {
  if (!projectSiteText) return null;
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : null;
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

function resolveKeyFindingsText(view: WorkbookView, allowLegacyFallback: boolean): string {
  const parserMeta = readParserMetaFieldString(view, PARSER_META_FIELDS.keyFindingsNormalized);
  const parserMetaAsNumber = readParserMetaFieldNumber(view, PARSER_META_FIELDS.keyFindingsNormalized);
  if (
    parserMeta &&
    !(parserMetaAsNumber !== null && parserMeta === String(parserMetaAsNumber))
  ) {
    return normalizeMultiline(parserMeta);
  }

  const namedLines = readNamedRangeLines(view, PARSER_NAMED_RANGES.keyFindingsLines);
  if (namedLines.length > 0) {
    return normalizeMultiline(namedLines.join('\n'));
  }

  const fallbackRangeLines = readLegacyRangeLines(view, KEY_FINDINGS_FALLBACK_RANGE);
  if (allowLegacyFallback && fallbackRangeLines.length > 0) {
    return normalizeMultiline(fallbackRangeLines.join('\n'));
  }

  const legacyCell = allowLegacyFallback
    ? view.cellString(SHEET_SCORECARD, KEY_FINDINGS_FREE_TEXT_CELL) ?? ''
    : '';
  return normalizeMultiline(legacyCell);
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

function firstValidString(...values: Array<string | null>): string | null {
  for (const value of values) {
    if (value !== null && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
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
