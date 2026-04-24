import { describe, expect, it } from 'vitest';
import type * as XLSX from 'xlsx';
import { wrapWorkbook } from './xlsxWorkbookView.js';

describe('xlsxWorkbookView error-cell handling', () => {
  it('maps SheetJS error cells to Excel error literals for parser reads', () => {
    const workbook = {
      SheetNames: ['ParserMeta'],
      Sheets: {
        ParserMeta: {
          A1: { t: 's', v: 'Field' },
          B1: { t: 's', v: 'Value' },
          A2: { t: 's', v: 'InspectionDateRaw' },
          B2: { t: 'e', v: 0x1D, w: '#NAME?' },
          A3: { t: 's', v: 'InspectionNumberRaw' },
          B3: { t: 'e', v: 0x0F, w: '#VALUE!' },
        },
      },
      Workbook: {
        Names: [
          { Name: 'ParserInspectionDateRaw', Ref: 'ParserMeta!$B$2' },
          { Name: 'ParserInspectionNumberRaw', Ref: 'ParserMeta!$B$3' },
        ],
      },
    } as unknown as XLSX.WorkBook;

    const view = wrapWorkbook(workbook);

    expect(view.cellString('ParserMeta', 'B2')).toBe('#NAME?');
    expect(view.cellString('ParserMeta', 'B3')).toBe('#VALUE!');
    expect(view.cellNumber('ParserMeta', 'B2')).toBeNull();
    expect(view.cellNumber('ParserMeta', 'B3')).toBeNull();
    expect(view.namedRangeString('ParserInspectionDateRaw')).toBe('#NAME?');
    expect(view.namedRangeString('ParserInspectionNumberRaw')).toBe('#VALUE!');
    expect(view.namedRangeNumber('ParserInspectionDateRaw')).toBeNull();
    expect(view.namedRangeNumber('ParserInspectionNumberRaw')).toBeNull();
  });
});
