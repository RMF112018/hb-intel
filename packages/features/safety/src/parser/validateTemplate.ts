import {
  ANCHOR_CELLS,
  EXPECTED_RESPONSE_HEADER_LABELS,
  REQUIRED_SHEETS,
  RESPONSE_HEADERS,
  SECTIONS,
  SHEET_SCORECARD,
  SHEET_SCORING_WEIGHTS,
  TEMPLATE_VERSION,
} from '../domain/templateContract.js';
import { TemplateInvalidError } from '../domain/types.js';
import type { WorkbookView } from './workbookView.js';

export interface ValidateTemplateResult {
  readonly templateVersion: string;
  readonly warnings: ReadonlyArray<string>;
}

export function validateTemplate(view: WorkbookView): ValidateTemplateResult {
  const warnings: string[] = [];

  for (const required of REQUIRED_SHEETS) {
    if (!view.hasSheet(required)) {
      throw new TemplateInvalidError(`Required sheet "${required}" is missing.`);
    }
  }

  const title = view.cellString(SHEET_SCORECARD, ANCHOR_CELLS.title);
  if (!title || !/Construction Site Safety/i.test(title)) {
    warnings.push(`ScoreCard!${ANCHOR_CELLS.title} title label did not match expected text.`);
  }

  const anchorChecks: Array<[keyof typeof ANCHOR_CELLS, RegExp]> = [
    ['dateLabel', /^date$/i],
    ['inspectionNumberLabel', /insp/i],
    ['projectSiteLabel', /project|site/i],
    ['totalYesLabel', /total\s*yes/i],
    ['totalNoLabel', /total\s*no/i],
    ['totalNaLabel', /total\s*n\/?a/i],
    ['safetyScoreLabel', /safety\s*score/i],
  ];
  for (const [key, rex] of anchorChecks) {
    const cell = ANCHOR_CELLS[key];
    const value = view.cellString(SHEET_SCORECARD, cell);
    if (!value || !rex.test(value)) {
      throw new TemplateInvalidError(
        `ScoreCard!${cell} anchor label mismatch (expected ${rex}, got ${JSON.stringify(value)}).`,
      );
    }
  }

  for (const headerKey of Object.keys(RESPONSE_HEADERS) as Array<keyof typeof RESPONSE_HEADERS>) {
    const cell = RESPONSE_HEADERS[headerKey];
    const expected = EXPECTED_RESPONSE_HEADER_LABELS[headerKey];
    const value = view.cellString(SHEET_SCORECARD, cell);
    if (!value || value.trim().toLowerCase() !== expected.toLowerCase()) {
      throw new TemplateInvalidError(
        `Response matrix header mismatch at ${cell}: expected "${expected}", got ${JSON.stringify(value)}.`,
      );
    }
  }

  for (const section of SECTIONS) {
    const headerValue = view.cellString(SHEET_SCORECARD, `A${section.headerRow}`);
    if (!headerValue || !headerValue.toLowerCase().includes(section.sectionName.toLowerCase())) {
      warnings.push(
        `Section header ${section.sectionNumber} at A${section.headerRow} drift detected (got ${JSON.stringify(headerValue)}).`,
      );
    }
  }

  // Scoring weights shape A1:D14 — header row + 12 sections + total row is optional.
  for (let row = 2; row <= 13; row += 1) {
    const num = view.cellNumber(SHEET_SCORING_WEIGHTS, `A${row}`);
    if (num === null) {
      throw new TemplateInvalidError(`ScoringWeights!A${row} missing section number.`);
    }
  }

  return { templateVersion: TEMPLATE_VERSION, warnings };
}
