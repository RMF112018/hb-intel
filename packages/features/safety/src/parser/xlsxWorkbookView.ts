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

  return {
    hasSheet: (name) => sheetSet.has(name),
    sheetNames: () => sheetNames,
    cellString: (name, a1) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) return null;
      const cell = sheet[a1];
      if (!cell) return null;
      if (cell.v === null || cell.v === undefined) return null;
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
      const n = typeof cell.v === 'number' ? cell.v : Number(cell.v);
      return Number.isFinite(n) ? n : null;
    },
  };
}

/** Compute SHA-256 of an ArrayBuffer using Web Crypto. */
export async function computeChecksum(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
