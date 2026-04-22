/**
 * In-memory .xlsx fixture generator used by Wave 2 tests to exercise the
 * full ingest pipeline (upload → parse → validate → score → commit → run).
 */

import * as XLSX from 'xlsx';

export interface XlsxFixtureOptions {
  readonly projectSiteText?: string;
  readonly inspectionDate?: string;
  readonly inspectionNumber?: string;
  readonly noRows?: ReadonlyArray<number>;
}

const SECTIONS_META: ReadonlyArray<{ header: number; name: string; rows: ReadonlyArray<number> }> = [
  { header: 10, name: '1. General Site Conditions', rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { header: 22, name: '2. Emergency & Fire Preparedness', rows: [23, 24, 25, 26, 27] },
  { header: 29, name: '3. PPE & Worker Compliance', rows: [30, 31, 32, 33, 34, 35, 36, 37] },
  { header: 39, name: '4. Fall Protection & Openings', rows: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49] },
  { header: 51, name: '5. Ladders & Scaffolds', rows: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63] },
  { header: 65, name: '6. Electrical & Temporary Power', rows: [66, 67, 68, 69, 70, 71, 72, 73] },
  { header: 75, name: '7. Hot Work & Fire Risk Controls', rows: [76, 77, 78, 79, 80, 81] },
  { header: 83, name: '8. Material Handling & Storage', rows: [84, 85, 86, 87, 88, 89] },
  { header: 91, name: '9. Equipment & Mobile Plant', rows: [92, 93, 94, 95, 96, 97, 98, 99, 100] },
  { header: 102, name: '10. Excavations & Ground Disturbance', rows: [103, 104, 105, 106, 107, 108] },
  { header: 110, name: '11. Environmental & Health', rows: [111, 112, 113, 114, 115, 116, 117] },
  { header: 119, name: '12. Behavioral / Work Practices', rows: [120, 121, 122, 123, 124] },
];

export function buildXlsxBuffer(options: XlsxFixtureOptions = {}): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const scoreSheet = XLSX.utils.aoa_to_sheet([] as string[][]);

  scoreSheet['A1'] = { v: 'Construction Site Safety Walk Checklist (Field Form)', t: 's' };
  scoreSheet['A3'] = { v: 'Date', t: 's' };
  scoreSheet['B3'] = { v: options.inspectionDate ?? '2026-04-22', t: 's' };
  scoreSheet['D3'] = { v: 'Insp #.', t: 's' };
  scoreSheet['E3'] = { v: options.inspectionNumber ?? '1', t: 's' };
  scoreSheet['F3'] = { v: 'Summary (auto)', t: 's' };
  scoreSheet['A4'] = { v: 'Project/Site', t: 's' };
  scoreSheet['B4'] = { v: options.projectSiteText ?? '2024-118 Riverside', t: 's' };
  scoreSheet['F4'] = { v: 'Total Yes', t: 's' };
  scoreSheet['F5'] = { v: 'Total No', t: 's' };
  scoreSheet['F6'] = { v: 'Total N/A', t: 's' };
  scoreSheet['F7'] = { v: 'Safety Score %', t: 's' };
  scoreSheet['A9'] = { v: 'Item', t: 's' };
  scoreSheet['B9'] = { v: 'Yes', t: 's' };
  scoreSheet['C9'] = { v: 'No', t: 's' };
  scoreSheet['D9'] = { v: 'N/A', t: 's' };
  scoreSheet['E9'] = { v: 'Notes', t: 's' };
  scoreSheet['F9'] = { v: 'Score', t: 's' };
  scoreSheet['G9'] = { v: 'Inspection Flag', t: 's' };

  const noSet = new Set(options.noRows ?? []);
  for (const section of SECTIONS_META) {
    scoreSheet[`A${section.header}`] = { v: section.name, t: 's' };
    for (const row of section.rows) {
      scoreSheet[`A${row}`] = { v: `Item ${row}`, t: 's' };
      if (noSet.has(row)) {
        scoreSheet[`C${row}`] = { v: 'X', t: 's' };
      } else {
        scoreSheet[`B${row}`] = { v: 'X', t: 's' };
      }
    }
  }
  scoreSheet['!ref'] = 'A1:G142';

  const weights = XLSX.utils.aoa_to_sheet([
    ['Num', 'Section', 'Weight', 'Rationale'],
    [1, '1. General Site Conditions', 0.03, 'x'],
    [2, '2. Emergency & Fire Preparedness', 0.03, 'x'],
    [3, '3. PPE & Worker Compliance', 0.08, 'x'],
    [4, '4. Fall Protection & Openings', 0.18, 'x'],
    [5, '5. Ladders & Scaffolds', 0.14, 'x'],
    [6, '6. Electrical & Temporary Power', 0.1, 'x'],
    [7, '7. Hot Work & Fire Risk Controls', 0.07, 'x'],
    [8, '8. Material Handling & Storage', 0.04, 'x'],
    [9, '9. Equipment & Mobile Plant', 0.12, 'x'],
    [10, '10. Excavations & Ground Disturbance', 0.12, 'x'],
    [11, '11. Environmental & Health', 0.02, 'x'],
    [12, '12. Behavioral / Work Practices', 0.07, 'x'],
  ]);

  XLSX.utils.book_append_sheet(wb, scoreSheet, 'ScoreCard');
  XLSX.utils.book_append_sheet(wb, weights, 'ScoringWeights');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

export function buildXlsxFile(options?: XlsxFixtureOptions): Blob {
  return new Blob([buildXlsxBuffer(options)]);
}
