import {
  RESPONSE_MARK_LITERAL,
  SECTIONS,
  SHEET_SCORECARD,
  PARSER_VERSION,
} from '../domain/templateContract.js';
import type { ChecklistResponse, ChecklistRow, ParsedInspection } from '../domain/types.js';
import { resolveContractMarkers } from './contractWorkbookAccess.js';
import { extractMetadata } from './extractMetadata.js';
import type { WorkbookView } from './workbookView.js';

export function parseChecklist(view: WorkbookView): ParsedInspection {
  const markers = resolveContractMarkers(view);
  const rows: ChecklistRow[] = [];

  for (const section of SECTIONS) {
    for (const rowNumber of section.displayedRows) {
      const yes = cellMark(view, `B${rowNumber}`);
      const no = cellMark(view, `C${rowNumber}`);
      const na = cellMark(view, `D${rowNumber}`);
      const notes = (view.cellString(SHEET_SCORECARD, `E${rowNumber}`) ?? '').trim();
      const scoreCell = view.cellString(SHEET_SCORECARD, `F${rowNumber}`);
      const flagCell = (view.cellString(SHEET_SCORECARD, `G${rowNumber}`) ?? '').trim() || null;
      const response = classifyResponse(yes, no, na);
      const itemLabel =
        section.itemLabels[rowNumber] ??
        view.cellString(SHEET_SCORECARD, `A${rowNumber}`) ??
        `Row ${rowNumber}`;

      rows.push({
        sectionNumber: section.sectionNumber,
        sectionName: section.sectionName,
        rowNumber,
        itemLabel,
        response,
        notes,
        workbookScoreCell: parseScoreCell(scoreCell),
        workbookFlagCell: flagCell,
      });
    }
  }

  return {
    templateVersion: markers.templateVersion ?? 'v1',
    parserVersion: markers.parserContractVersion ?? PARSER_VERSION,
    metadata: extractMetadata(view),
    rows,
  };
}

function cellMark(view: WorkbookView, a1: string): boolean {
  const value = view.cellString(SHEET_SCORECARD, a1);
  if (!value) return false;
  return value.trim().toUpperCase() === RESPONSE_MARK_LITERAL;
}

function classifyResponse(yes: boolean, no: boolean, na: boolean): ChecklistResponse {
  const marks = [yes, no, na].filter(Boolean).length;
  if (marks === 0) return 'incomplete';
  if (marks > 1) return 'multi';
  if (yes) return 'yes';
  if (no) return 'no';
  return 'na';
}

function parseScoreCell(raw: string | null): string | number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
}
