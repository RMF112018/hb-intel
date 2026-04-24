import {
  ANCHOR_CELLS,
  EXPECTED_RESPONSE_HEADER_LABELS,
  PARSER_CONTRACT_VERSION_ACCEPTED,
  PARSER_META_FIELDS,
  PARSER_NAMED_RANGES,
  PARSER_TEMPLATE_MARKER_ACCEPTED,
  REQUIRED_SHEETS,
  RESPONSE_HEADERS,
  SECTIONS,
  SHEET_SCORECARD,
  SHEET_SCORING_WEIGHTS,
} from '../domain/templateContract.js';
import { TemplateInvalidError } from '../domain/types.js';
import {
  readNamedRangeString,
  readParserMetaFieldString,
  resolveContractMarkers,
} from './contractWorkbookAccess.js';
import { extractMetadata } from './extractMetadata.js';
import { normalizeInspectionDate } from './dateNormalization.js';
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

  const markers = resolveContractMarkers(view);
  if (markers.markersPresent) {
    if (!markers.templateVersion) {
      throw new TemplateInvalidError(
        'Parser marker validation failed: TemplateVersion marker is missing while parser markers are present.',
      );
    }
    if (!markers.parserContractVersion) {
      throw new TemplateInvalidError(
        'Parser marker validation failed: ParserContractVersion marker is missing while parser markers are present.',
      );
    }
    if (!PARSER_TEMPLATE_MARKER_ACCEPTED.includes(markers.templateVersion as (typeof PARSER_TEMPLATE_MARKER_ACCEPTED)[number])) {
      throw new TemplateInvalidError(
        `Unsupported TemplateVersion marker "${markers.templateVersion}".`,
      );
    }
    if (!PARSER_CONTRACT_VERSION_ACCEPTED.includes(markers.parserContractVersion as (typeof PARSER_CONTRACT_VERSION_ACCEPTED)[number])) {
      throw new TemplateInvalidError(
        `Unsupported ParserContractVersion marker "${markers.parserContractVersion}".`,
      );
    }
  }

  const metadata = extractMetadata(view);
  if (markers.markersPresent && (metadata.parserCriticalCellErrors?.length ?? 0) > 0) {
    const first = metadata.parserCriticalCellErrors?.[0];
    throw new TemplateInvalidError(
      `Parser-critical cell error at ${first?.field ?? 'unknown'} (${first?.source ?? 'unknown'}): ` +
      `${first?.value ?? '#ERROR'}.`,
    );
  }
  if (!normalizeInspectionDate(metadata.inspectionDate)) {
    throw new TemplateInvalidError(
      `Inspection date is invalid or unreadable (got ${JSON.stringify(metadata.inspectionDate)}).`,
    );
  }
  if (!isWholePositiveInteger(metadata.inspectionNumber)) {
    throw new TemplateInvalidError(
      `Inspection number must be a whole positive integer (got ${JSON.stringify(metadata.inspectionNumber)}).`,
    );
  }

  if (markers.markersPresent) {
    const weekStart = normalizeInspectionDate(
      readParserMetaFieldString(view, PARSER_META_FIELDS.reportingWeekStart) ??
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserReportingWeekStart),
    );
    const weekEnd = normalizeInspectionDate(
      readParserMetaFieldString(view, PARSER_META_FIELDS.reportingWeekEnd) ??
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserReportingWeekEnd),
    );
    const periodLabel =
      readParserMetaFieldString(view, PARSER_META_FIELDS.reportingPeriodLabel) ??
      readNamedRangeString(view, PARSER_NAMED_RANGES.parserReportingPeriodLabel);

    const periodFieldsProvided = Boolean(weekStart || weekEnd || periodLabel);
    if (periodFieldsProvided && (!weekStart || !weekEnd || !periodLabel)) {
      throw new TemplateInvalidError(
        'Reporting period derivation markers are incomplete: require week start, week end, and period label together.',
      );
    }
  }

  const keyFindingsSeamAvailable =
    view.hasNamedRange(PARSER_NAMED_RANGES.keyFindingsLines) ||
    readParserMetaFieldString(view, PARSER_META_FIELDS.keyFindingsNormalized) !== null ||
    readNamedRangeString(view, PARSER_NAMED_RANGES.parserKeyFindingsNormalized) !== null;
  if (markers.markersPresent && !keyFindingsSeamAvailable) {
    throw new TemplateInvalidError(
      'Key findings seam is missing: expected ParserMeta normalization or KeyFindingsLines named range.',
    );
  }

  return { templateVersion: markers.templateVersion ?? 'v1', warnings };
}

function isWholePositiveInteger(value: string): boolean {
  const n = Number(value.trim());
  return Number.isFinite(n) && Number.isInteger(n) && n > 0;
}
