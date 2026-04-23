import {
  ANCHOR_CELLS,
  EXPECTED_RESPONSE_HEADER_LABELS,
  METADATA_ENTRY_CELLS,
  RESPONSE_HEADERS,
  RESPONSE_MARK_LITERAL,
  SECTIONS,
  SHEET_SCORECARD,
  SHEET_SCORING_WEIGHTS,
  SUMMARY_VALUE_CELLS,
} from '../domain/templateContract.js';
import {
  createSyntheticWorkbookView,
  type SyntheticNamedRange,
  type WorkbookView,
} from '../parser/workbookView.js';

export interface FixtureOptions {
  readonly noRows?: ReadonlyArray<number>;
  readonly naRows?: ReadonlyArray<number>;
  readonly incompleteRows?: ReadonlyArray<number>;
  readonly multiRows?: ReadonlyArray<number>;
  readonly notes?: Readonly<Record<number, string>>;
  readonly projectSiteText?: string;
  readonly inspectionDate?: string;
  readonly inspectionNumber?: string;
  readonly missingResponseHeader?: 'item' | 'yes' | 'no' | 'na' | 'notes' | 'score' | 'flag';
  readonly extraSheets?: Readonly<Record<string, Record<string, string | number | null>>>;
  readonly namedRanges?: Readonly<Record<string, SyntheticNamedRange>>;
}

export function buildCleanAllYesWorkbook(options: FixtureOptions = {}): WorkbookView {
  const scoreCard: Record<string, string | number | null> = {};

  scoreCard[ANCHOR_CELLS.title] = 'Construction Site Safety Walk Checklist (Field Form)';
  scoreCard[ANCHOR_CELLS.dateLabel] = 'Date';
  scoreCard[ANCHOR_CELLS.inspectionNumberLabel] = 'Insp #.';
  scoreCard[ANCHOR_CELLS.summaryLabel] = 'Summary (auto)';
  scoreCard[ANCHOR_CELLS.projectSiteLabel] = 'Project/Site';
  scoreCard[ANCHOR_CELLS.totalYesLabel] = 'Total Yes';
  scoreCard[ANCHOR_CELLS.totalNoLabel] = 'Total No';
  scoreCard[ANCHOR_CELLS.totalNaLabel] = 'Total N/A';
  scoreCard[ANCHOR_CELLS.safetyScoreLabel] = 'Safety Score %';

  scoreCard[METADATA_ENTRY_CELLS.date] = options.inspectionDate ?? '2026-04-22';
  scoreCard[METADATA_ENTRY_CELLS.projectSite] = options.projectSiteText ?? '2024-118 Riverside Medical';
  scoreCard[METADATA_ENTRY_CELLS.inspectionNumber] = options.inspectionNumber ?? '1';

  scoreCard[SUMMARY_VALUE_CELLS.totalYes] = 80;
  scoreCard[SUMMARY_VALUE_CELLS.totalNo] = 0;
  scoreCard[SUMMARY_VALUE_CELLS.totalNa] = 4;
  scoreCard[SUMMARY_VALUE_CELLS.safetyScore] = 1.0;

  for (const key of Object.keys(RESPONSE_HEADERS) as Array<keyof typeof RESPONSE_HEADERS>) {
    if (options.missingResponseHeader === key) continue;
    scoreCard[RESPONSE_HEADERS[key]] = EXPECTED_RESPONSE_HEADER_LABELS[key];
  }

  const noSet = new Set(options.noRows ?? []);
  const naSet = new Set(options.naRows ?? []);
  const incompleteSet = new Set(options.incompleteRows ?? []);
  const multiSet = new Set(options.multiRows ?? []);

  for (const section of SECTIONS) {
    scoreCard[`A${section.headerRow}`] = section.sectionName;
    for (const row of section.displayedRows) {
      scoreCard[`A${row}`] = section.itemLabels[row];
      if (multiSet.has(row)) {
        scoreCard[`B${row}`] = RESPONSE_MARK_LITERAL;
        scoreCard[`C${row}`] = RESPONSE_MARK_LITERAL;
      } else if (incompleteSet.has(row)) {
        // leave empty
      } else if (naSet.has(row)) {
        scoreCard[`D${row}`] = RESPONSE_MARK_LITERAL;
      } else if (noSet.has(row)) {
        scoreCard[`C${row}`] = RESPONSE_MARK_LITERAL;
      } else {
        scoreCard[`B${row}`] = RESPONSE_MARK_LITERAL;
      }
      const note = options.notes?.[row];
      if (note) scoreCard[`E${row}`] = note;
    }
  }

  const scoringWeights: Record<string, string | number | null> = {
    A1: 'Num',
    B1: 'Section',
    C1: 'Weight',
    D1: 'Rationale',
  };
  for (let i = 0; i < SECTIONS.length; i += 1) {
    const s = SECTIONS[i];
    const row = i + 2;
    scoringWeights[`A${row}`] = s.sectionNumber;
    scoringWeights[`B${row}`] = s.sectionName;
    scoringWeights[`C${row}`] = s.weight;
    scoringWeights[`D${row}`] = s.rationale;
  }

  return createSyntheticWorkbookView(
    {
      [SHEET_SCORECARD]: scoreCard,
      [SHEET_SCORING_WEIGHTS]: scoringWeights,
      ...(options.extraSheets ?? {}),
    },
    { ...(options.namedRanges ?? {}) },
  );
}
