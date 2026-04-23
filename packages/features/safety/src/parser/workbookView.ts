/**
 * Abstract workbook view used by the parser.
 *
 * Keeps xlsx (SheetJS) out of validation/parsing logic so unit tests
 * can drive the parser with a synthetic cell map.
 */

export interface WorkbookView {
  hasSheet(sheetName: string): boolean;
  sheetNames(): ReadonlyArray<string>;
  cellString(sheetName: string, a1: string): string | null;
  cellNumber(sheetName: string, a1: string): number | null;
  hasNamedRange(name: string): boolean;
  namedRangeString(name: string): string | null;
  namedRangeNumber(name: string): number | null;
  namedRangeStrings(name: string): ReadonlyArray<string>;
}

export interface SyntheticNamedRange {
  readonly sheetName: string;
  readonly ref: string;
}

export function createSyntheticWorkbookView(
  sheets: Record<string, Record<string, string | number | null>>,
  namedRanges: Record<string, SyntheticNamedRange> = {},
): WorkbookView {
  const getSheet = (name: string): Record<string, string | number | null> | null =>
    sheets[name] ?? null;

  const resolveNamedRangeCells = (name: string): ReadonlyArray<{ sheetName: string; a1: string }> => {
    const def = namedRanges[name];
    if (!def) return [];
    return expandRange(def.sheetName, def.ref);
  };

  const readNamedRangeRaw = (name: string): ReadonlyArray<string | number> => {
    const values: Array<string | number> = [];
    for (const cell of resolveNamedRangeCells(name)) {
      const sheet = getSheet(cell.sheetName);
      if (!sheet) continue;
      const value = sheet[cell.a1];
      if (value === null || value === undefined || value === '') continue;
      if (typeof value === 'string' || typeof value === 'number') {
        values.push(value);
      }
    }
    return values;
  };

  return {
    hasSheet: (name) => Object.prototype.hasOwnProperty.call(sheets, name),
    sheetNames: () => Object.keys(sheets),
    cellString: (name, a1) => {
      const sheet = getSheet(name);
      if (!sheet) return null;
      const value = sheet[a1];
      if (value === null || value === undefined) return null;
      return typeof value === 'string' ? value : String(value);
    },
    cellNumber: (name, a1) => {
      const sheet = getSheet(name);
      if (!sheet) return null;
      const value = sheet[a1];
      if (value === null || value === undefined || value === '') return null;
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? n : null;
    },
    hasNamedRange: (name) => Object.prototype.hasOwnProperty.call(namedRanges, name),
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

function expandRange(
  sheetName: string,
  ref: string,
): ReadonlyArray<{ sheetName: string; a1: string }> {
  const normalized = ref.replace(/\$/g, '');
  const [startA1, endA1] = normalized.split(':');
  if (!startA1) return [];
  const start = decodeA1(startA1);
  if (!start) return [];
  const end = decodeA1(endA1 ?? startA1);
  if (!end) return [];
  const cells: Array<{ sheetName: string; a1: string }> = [];
  for (let row = start.row; row <= end.row; row += 1) {
    for (let col = start.col; col <= end.col; col += 1) {
      cells.push({ sheetName, a1: encodeA1(col, row) });
    }
  }
  return cells;
}

function decodeA1(a1: string): { col: number; row: number } | null {
  const match = /^([A-Z]+)(\d+)$/i.exec(a1.trim());
  if (!match) return null;
  const colLabel = match[1].toUpperCase();
  const row = Number(match[2]);
  if (!Number.isFinite(row) || row <= 0) return null;
  let col = 0;
  for (const ch of colLabel) {
    col = col * 26 + (ch.charCodeAt(0) - 64);
  }
  return { col: col - 1, row: row - 1 };
}

function encodeA1(col: number, row: number): string {
  let x = col + 1;
  let label = '';
  while (x > 0) {
    const rem = (x - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    x = Math.floor((x - 1) / 26);
  }
  return `${label}${row + 1}`;
}
