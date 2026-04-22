import {
  KEY_FINDINGS_FREE_TEXT_CELL,
  METADATA_ENTRY_CELLS,
  SHEET_SCORECARD,
  SUMMARY_VALUE_CELLS,
} from '../domain/templateContract.js';
import type { InspectionMetadata } from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';

export function extractMetadata(view: WorkbookView): InspectionMetadata {
  const rawDate = view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date);
  const projectSiteText = (view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.projectSite) ?? '').trim();
  const inspectionNumber = (view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.inspectionNumber) ?? '').trim();

  return {
    inspectionDate: normalizeDate(rawDate),
    projectSiteText,
    inspectionNumber,
    workbookTotalYes: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalYes),
    workbookTotalNo: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNo),
    workbookTotalNa: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNa),
    workbookSafetyScorePct: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.safetyScore),
    keyFindingsFreeText: (view.cellString(SHEET_SCORECARD, KEY_FINDINGS_FREE_TEXT_CELL) ?? '').trim(),
  };
}

function normalizeDate(raw: string | null): string {
  if (!raw) return '';
  // ISO already
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return raw;
}
