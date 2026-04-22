import {
  KEY_FINDINGS_FREE_TEXT_CELL,
  METADATA_ENTRY_CELLS,
  SHEET_SCORECARD,
  SUMMARY_VALUE_CELLS,
} from '../domain/templateContract.js';
import type { InspectionMetadata } from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';
import { normalizeInspectionDate } from './dateNormalization.js';

export function extractMetadata(view: WorkbookView): InspectionMetadata {
  const rawDateString = view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date);
  const rawDateNumber =
    rawDateString === null ? view.cellNumber(SHEET_SCORECARD, METADATA_ENTRY_CELLS.date) : null;
  const normalizedDate =
    normalizeInspectionDate(rawDateString ?? rawDateNumber) ?? rawDateString ?? '';

  const projectSiteText = (view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.projectSite) ?? '').trim();
  const inspectionNumber = (view.cellString(SHEET_SCORECARD, METADATA_ENTRY_CELLS.inspectionNumber) ?? '').trim();

  return {
    inspectionDate: normalizedDate,
    projectSiteText,
    inspectionNumber,
    projectNumberHint: extractProjectNumberHint(projectSiteText),
    workbookTotalYes: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalYes),
    workbookTotalNo: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNo),
    workbookTotalNa: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.totalNa),
    workbookSafetyScorePct: view.cellNumber(SHEET_SCORECARD, SUMMARY_VALUE_CELLS.safetyScore),
    keyFindingsFreeText: (view.cellString(SHEET_SCORECARD, KEY_FINDINGS_FREE_TEXT_CELL) ?? '').trim(),
  };
}

/** Pull the canonical `####-##` or `####-####` project number from free-form site text. */
export function extractProjectNumberHint(projectSiteText: string): string | null {
  if (!projectSiteText) return null;
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : null;
}
