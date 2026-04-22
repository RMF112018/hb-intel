import { HIGH_SEVERITY_WEIGHT_FLOOR, SECTIONS } from '../domain/templateContract.js';
import type {
  FindingSeverity,
  ParsedInspection,
  SafetyFinding,
} from '../domain/types.js';

export interface ExtractedFinding {
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly checklistRowNumber: number;
  readonly checklistItemLabel: string;
  readonly findingType: SafetyFinding['findingType'];
  readonly severity: FindingSeverity;
  readonly findingSummary: string;
  readonly originalNoteText: string;
  readonly requiresCorrectiveAction: boolean;
}

export function extractFindings(parsed: ParsedInspection): ExtractedFinding[] {
  const weightByNumber = new Map(SECTIONS.map((s) => [s.sectionNumber, s.weight]));
  const findings: ExtractedFinding[] = [];

  for (const row of parsed.rows) {
    const hasNote = row.notes.length > 0;
    let findingType: SafetyFinding['findingType'] | null = null;

    if (row.response === 'no') findingType = 'no-response';
    else if (row.response === 'incomplete') findingType = 'incomplete';
    else if (row.response === 'multi') findingType = 'multi';
    else if (hasNote) findingType = 'note-only';

    if (!findingType) continue;

    const weight = weightByNumber.get(row.sectionNumber) ?? 0;
    const severity = computeSeverity(findingType, weight);
    const summary = buildSummary(row.itemLabel, findingType, row.notes);

    findings.push({
      sectionNumber: row.sectionNumber,
      sectionName: row.sectionName,
      checklistRowNumber: row.rowNumber,
      checklistItemLabel: row.itemLabel,
      findingType,
      severity,
      findingSummary: summary,
      originalNoteText: row.notes,
      requiresCorrectiveAction: severity !== 'info',
    });
  }

  return findings;
}

function computeSeverity(
  findingType: SafetyFinding['findingType'],
  weight: number,
): FindingSeverity {
  if (findingType === 'no-response') {
    return weight >= HIGH_SEVERITY_WEIGHT_FLOOR ? 'high' : 'medium';
  }
  if (findingType === 'incomplete' || findingType === 'multi') return 'medium';
  return 'info';
}

function buildSummary(
  itemLabel: string,
  findingType: SafetyFinding['findingType'],
  notes: string,
): string {
  const prefix =
    findingType === 'no-response'
      ? 'Failed'
      : findingType === 'incomplete'
        ? 'Unmarked'
        : findingType === 'multi'
          ? 'Ambiguous response'
          : 'Noted';
  return notes ? `${prefix}: ${itemLabel} — ${notes}` : `${prefix}: ${itemLabel}`;
}
