/**
 * SheetJS-backed WorkbookView for real uploaded .xlsx files.
 *
 * Runs client-side inside the SPFx webpart; no backend parsing in R1.
 */

import * as XLSX from 'xlsx';
import { TemplateInvalidError } from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';
import { normalizeInspectionDate } from './dateNormalization.js';

export async function readWorkbookFromFile(file: File | Blob): Promise<WorkbookView> {
  const buffer = await file.arrayBuffer();
  return readWorkbookFromArrayBuffer(buffer);
}

export function readWorkbookFromArrayBuffer(buffer: ArrayBuffer): WorkbookView {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true, cellFormula: false });
  } catch (err) {
    throw new TemplateInvalidError(
      `Unable to open workbook: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }
  return wrapWorkbook(workbook);
}

export function wrapWorkbook(workbook: XLSX.WorkBook): WorkbookView {
  const sheetNames = workbook.SheetNames;
  const sheetSet = new Set(sheetNames);
  const namedRanges = new Map<string, ReadonlyArray<{ sheetName: string; a1: string }>>();
  for (const entry of workbook.Workbook?.Names ?? []) {
    if (!entry.Name || !entry.Ref) continue;
    const cells = resolveNamedRangeCells(entry.Ref);
    if (cells.length > 0) {
      namedRanges.set(entry.Name, cells);
    }
  }

  const readNamedRangeRaw = (name: string): ReadonlyArray<string | number> => {
    const cells = namedRanges.get(name) ?? [];
    const values: Array<string | number> = [];
    for (const cell of cells) {
      const sheet = workbook.Sheets[cell.sheetName];
      if (!sheet) continue;
      const raw = sheet[cell.a1];
      if (!raw || raw.v === null || raw.v === undefined || raw.v === '') continue;
      if (raw.t === 'e') {
        values.push(toExcelErrorString(raw));
        continue;
      }
      if (raw.v instanceof Date) {
        values.push(normalizeInspectionDate(raw.v) ?? raw.v.toISOString().slice(0, 10));
      } else if (typeof raw.v === 'string' || typeof raw.v === 'number') {
        values.push(raw.v);
      } else {
        values.push(String(raw.v));
      }
    }
    return values;
  };

  return {
    hasSheet: (name) => sheetSet.has(name),
    sheetNames: () => sheetNames,
    cellString: (name, a1) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) return null;
      const cell = sheet[a1];
      if (!cell) return null;
      if (cell.v === null || cell.v === undefined) return null;
      if (cell.t === 'e') {
        return toExcelErrorString(cell);
      }
      if (cell.v instanceof Date) {
        return normalizeInspectionDate(cell.v) ?? cell.v.toISOString().slice(0, 10);
      }
      return typeof cell.v === 'string' ? cell.v : String(cell.v);
    },
    cellNumber: (name, a1) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) return null;
      const cell = sheet[a1];
      if (!cell) return null;
      if (cell.v === null || cell.v === undefined || cell.v === '') return null;
      if (cell.t === 'e') return null;
      const n = typeof cell.v === 'number' ? cell.v : Number(cell.v);
      return Number.isFinite(n) ? n : null;
    },
    hasNamedRange: (name) => namedRanges.has(name),
    namedRangeString: (name) => {
      const first = readNamedRangeRaw(name)[0];
      if (first === null || first === undefined) return null;
      return typeof first === 'string' ? first : String(first);
    },
    namedRangeNumber: (name) => {
      const first = readNamedRangeRaw(name)[0];
      if (first === null || first === undefined) return null;
      const n = typeof first === 'number' ? first : Number(first);
      return Number.isFinite(n) ? n : null;
    },
    namedRangeStrings: (name) =>
      readNamedRangeRaw(name).map((value) =>
        typeof value === 'string' ? value : String(value),
      ),
  };
}

/** Compute SHA-256 of an ArrayBuffer using Web Crypto. */
export async function computeChecksum(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function resolveNamedRangeCells(ref: string): ReadonlyArray<{ sheetName: string; a1: string }> {
  const idx = ref.lastIndexOf('!');
  if (idx <= 0) return [];
  const rawSheetName = ref.slice(0, idx).trim();
  const rawA1 = ref.slice(idx + 1).trim();
  const sheetName = rawSheetName.replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'");
  const normalizedA1 = rawA1.replace(/\$/g, '');

  let range: XLSX.Range;
  try {
    range = XLSX.utils.decode_range(normalizedA1);
  } catch {
    return [];
  }

  const out: Array<{ sheetName: string; a1: string }> = [];
  for (let r = range.s.r; r <= range.e.r; r += 1) {
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      out.push({ sheetName, a1: XLSX.utils.encode_cell({ c, r }) });
    }
  }
  return out;
}

function toExcelErrorString(cell: XLSX.CellObject): string {
  if (typeof cell.w === 'string' && cell.w.trim().length > 0) {
    return cell.w.trim();
  }
  if (typeof cell.v === 'number') {
    // SheetJS numeric error codes from the XLSX spec.
    const codeMap: Record<number, string> = {
      0x00: '#NULL!',
      0x07: '#DIV/0!',
      0x0F: '#VALUE!',
      0x17: '#REF!',
      0x1D: '#NAME?',
      0x24: '#NUM!',
      0x2A: '#N/A',
      0x2B: '#GETTING_DATA',
    };
    return codeMap[cell.v] ?? `#ERROR_${cell.v}`;
  }
  if (typeof cell.v === 'string' && cell.v.trim().length > 0) {
    return cell.v.trim();
  }
  return '#ERROR';
}
