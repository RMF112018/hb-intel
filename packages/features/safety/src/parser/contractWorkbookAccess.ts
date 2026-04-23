import {
  PARSER_META_FIELDS,
  PARSER_META_SHEET,
  PARSER_NAMED_RANGES,
} from '../domain/templateContract.js';
import type { WorkbookView } from './workbookView.js';

export type ContractValueSource = 'parser-meta' | 'named-range' | 'legacy' | 'none';

export interface ContractMarkerResolution {
  readonly markersPresent: boolean;
  readonly templateVersion: string | null;
  readonly parserContractVersion: string | null;
}

interface IParserMetaRowMap {
  readonly [field: string]: number;
}

export function resolveContractMarkers(view: WorkbookView): ContractMarkerResolution {
  const markersPresent =
    view.hasSheet(PARSER_META_SHEET) ||
    view.hasNamedRange(PARSER_NAMED_RANGES.parserTemplateVersion) ||
    view.hasNamedRange(PARSER_NAMED_RANGES.parserContractVersion);

  const templateVersion =
    readParserMetaFieldString(view, PARSER_META_FIELDS.templateVersion) ??
    normalizeString(view.namedRangeString(PARSER_NAMED_RANGES.parserTemplateVersion));

  const parserContractVersion =
    readParserMetaFieldString(view, PARSER_META_FIELDS.parserContractVersion) ??
    normalizeString(view.namedRangeString(PARSER_NAMED_RANGES.parserContractVersion));

  return {
    markersPresent,
    templateVersion,
    parserContractVersion,
  };
}

export function readParserMetaFieldString(view: WorkbookView, fieldName: string): string | null {
  const row = findParserMetaRow(view, fieldName);
  if (!row) return null;

  const stringValue = normalizeString(view.cellString(PARSER_META_SHEET, `B${row}`));
  if (stringValue !== null) return stringValue;

  const numberValue = view.cellNumber(PARSER_META_SHEET, `B${row}`);
  if (numberValue === null) return null;
  return String(numberValue);
}

export function readParserMetaFieldNumber(view: WorkbookView, fieldName: string): number | null {
  const row = findParserMetaRow(view, fieldName);
  if (!row) return null;

  const numeric = view.cellNumber(PARSER_META_SHEET, `B${row}`);
  if (numeric !== null) return numeric;

  const str = normalizeString(view.cellString(PARSER_META_SHEET, `B${row}`));
  if (str === null) return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export function readNamedRangeString(view: WorkbookView, name: string): string | null {
  return normalizeString(view.namedRangeString(name));
}

export function readNamedRangeNumber(view: WorkbookView, name: string): number | null {
  const n = view.namedRangeNumber(name);
  if (n !== null) return n;
  const str = normalizeString(view.namedRangeString(name));
  if (str === null) return null;
  const parsed = Number(str);
  return Number.isFinite(parsed) ? parsed : null;
}

export function readNamedRangeLines(view: WorkbookView, name: string): ReadonlyArray<string> {
  return view.namedRangeStrings(name)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function findParserMetaRow(view: WorkbookView, fieldName: string): number | null {
  if (!view.hasSheet(PARSER_META_SHEET)) return null;
  const rows = buildParserMetaRowMap(view);
  return rows[fieldName] ?? null;
}

let cachedRowsByView = new WeakMap<WorkbookView, IParserMetaRowMap>();

function buildParserMetaRowMap(view: WorkbookView): IParserMetaRowMap {
  const cached = cachedRowsByView.get(view);
  if (cached) return cached;

  const out: Record<string, number> = {};
  for (let row = 1; row <= 256; row += 1) {
    const label = normalizeString(view.cellString(PARSER_META_SHEET, `A${row}`));
    if (!label) continue;
    if (!out[label]) out[label] = row;
  }

  cachedRowsByView.set(view, out);
  return out;
}

function normalizeString(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
