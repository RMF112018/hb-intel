import type { SeedFormat } from '../types';
import {
  SEED_LARGE_FILE_THRESHOLD_BYTES,
} from '../constants';

export interface IParseResult<TRow = Record<string, string>> {
  /** Detected column headers from the first row */
  headers: string[];
  /** All data rows as string-keyed records */
  rows: TRow[];
  /** Format that was actually detected/used */
  format: SeedFormat;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Number of data rows (excludes header row) */
  rowCount: number;
  /** Whether the file was routed to the streaming endpoint (D-01) */
  parsedOnServer: boolean;
}

/**
 * Parses Excel (.xlsx, .xls) files to row arrays using SheetJS.
 *
 * D-01: Files ≥ SEED_LARGE_FILE_THRESHOLD_BYTES are not parsed client-side.
 * Instead, a stub IParseResult is returned with parsedOnServer: true and
 * rows: []. The actual parsing happens via SeedApi.parseStreaming() which
 * returns the full row array from the server.
 *
 * Note: SheetJS is imported dynamically to enable tree-shaking in bundles
 * that do not use the xlsx format.
 */
export const XlsxParser = {
  async parse(file: File): Promise<IParseResult> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      // Large file: return metadata stub; caller must use SeedApi.parseStreaming()
      return {
        headers: [],
        rows: [],
        format: 'xlsx',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    // Dynamic import to enable tree-shaking
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellText: true, cellDates: true });

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('The Excel file contains no sheets.');
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,         // coerce all values to strings
      defval: '',         // empty cells become empty string
    }) as Record<string, unknown>[];

    if (rawRows.length === 0) {
      return {
        headers: [],
        rows: [],
        format: 'xlsx',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: false,
      };
    }

    // First row is headers
    const headers = (rawRows[0] as unknown as string[]).map((h) => String(h).trim());
    const dataRows = rawRows.slice(1).map((rawRow) => {
      const row: Record<string, string> = {};
      const cells = rawRow as unknown as string[];
      headers.forEach((header, index) => {
        row[header] = String(cells[index] ?? '').trim();
      });
      return row;
    });

    // Filter out completely empty rows
    /* v8 ignore next 3 */
    const nonEmptyRows = dataRows.filter((row) =>
      headers.some((h) => (row[h] ?? '').length > 0)
    );

    return {
      headers,
      rows: nonEmptyRows,
      format: 'xlsx',
      fileSizeBytes: file.size,
      rowCount: nonEmptyRows.length,
      parsedOnServer: false,
    };
  },

  /**
   * Reads only the header row of an Excel file without loading all data.
   * Used by HbcSeedUploader to show detected headers before full parse.
   */
  async peekHeaders(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      sheetRows: 1, // Read only the first row
    });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    const headerRow: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return (headerRow[0] ?? []).map((h) => String(h).trim());
  },
};
