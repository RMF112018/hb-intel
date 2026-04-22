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
}

export function createSyntheticWorkbookView(
  sheets: Record<string, Record<string, string | number | null>>,
): WorkbookView {
  return {
    hasSheet: (name) => Object.prototype.hasOwnProperty.call(sheets, name),
    sheetNames: () => Object.keys(sheets),
    cellString: (name, a1) => {
      const sheet = sheets[name];
      if (!sheet) return null;
      const value = sheet[a1];
      if (value === null || value === undefined) return null;
      return typeof value === 'string' ? value : String(value);
    },
    cellNumber: (name, a1) => {
      const sheet = sheets[name];
      if (!sheet) return null;
      const value = sheet[a1];
      if (value === null || value === undefined || value === '') return null;
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? n : null;
    },
  };
}
