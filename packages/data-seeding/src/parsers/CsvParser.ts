import type { IParseResult } from './XlsxParser';
import { SEED_LARGE_FILE_THRESHOLD_BYTES } from '../constants';

/**
 * Parses CSV files to row arrays using native FileReader.
 *
 * D-01: Files ≥ SEED_LARGE_FILE_THRESHOLD_BYTES return a server-routing stub.
 *
 * Handles:
 * - Quoted fields with embedded commas
 * - Windows (CRLF) and Unix (LF) line endings
 * - Empty trailing rows
 * - UTF-8 BOM stripping
 */
export const CsvParser = {
  async parse(file: File): Promise<IParseResult> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      return {
        headers: [],
        rows: [],
        format: 'csv',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const text = await file.text();
    const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [], format: 'csv', fileSizeBytes: file.size, rowCount: 0, parsedOnServer: false };
    }

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const cells = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        /* v8 ignore next */
        row[header] = (cells[index] ?? '').trim();
      });
      return row;
    });

    return {
      headers,
      rows,
      format: 'csv',
      fileSizeBytes: file.size,
      rowCount: rows.length,
      parsedOnServer: false,
    };
  },
};

/**
 * Parses a single CSV line, handling quoted fields.
 * Handles the RFC 4180 quoted-field convention.
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      // Escaped quote inside a quoted field
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}
