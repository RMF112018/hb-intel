import { SECTIONS } from '../domain/templateContract.js';
import type {
  ComputedInspectionScore,
  ParsedInspection,
  ScoringMode,
  SectionScore,
} from '../domain/types.js';

export function computeInspectionScore(
  parsed: ParsedInspection,
  scoringMode: ScoringMode = 'template-compat-v1',
): ComputedInspectionScore {
  if (scoringMode === 'normalized-vNext') {
    // Declared but not implemented per design — Release 1 is compat-only.
    throw new Error('normalized-vNext scoring mode is not implemented in Release 1.');
  }

  const sections: SectionScore[] = [];
  let totalYes = 0;
  let totalNo = 0;
  let totalNa = 0;
  let totalIncomplete = 0;
  let totalMulti = 0;
  let weightedFinal = 0;

  const rowsByNumber = new Map(parsed.rows.map((r) => [r.rowNumber, r]));

  for (const section of SECTIONS) {
    const countedRows = section.compatCountRows;
    let yes = 0;
    let no = 0;
    let na = 0;
    let incomplete = 0;
    let multi = 0;

    for (const rowNumber of countedRows) {
      const row = rowsByNumber.get(rowNumber);
      if (!row) {
        incomplete += 1;
        continue;
      }
      switch (row.response) {
        case 'yes':
          yes += 1;
          break;
        case 'no':
          no += 1;
          break;
        case 'na':
          na += 1;
          break;
        case 'incomplete':
          incomplete += 1;
          break;
        case 'multi':
          multi += 1;
          break;
      }
    }

    // Count rows outside the compat range against the overall totals so
    // they appear in raw evidence but don't enter the score.
    for (const rowNumber of section.displayedRows) {
      if (countedRows.includes(rowNumber)) continue;
      const row = rowsByNumber.get(rowNumber);
      if (!row) continue;
      switch (row.response) {
        case 'yes':
          totalYes += 1;
          break;
        case 'no':
          totalNo += 1;
          break;
        case 'na':
          totalNa += 1;
          break;
        case 'incomplete':
          totalIncomplete += 1;
          break;
        case 'multi':
          totalMulti += 1;
          break;
      }
    }

    const scorable = yes + no;
    const scorePct = scorable === 0 ? 1 : yes / scorable;
    const weightedContribution = scorePct * section.weight;
    weightedFinal += weightedContribution;

    totalYes += yes;
    totalNo += no;
    totalNa += na;
    totalIncomplete += incomplete;
    totalMulti += multi;

    sections.push({
      sectionNumber: section.sectionNumber,
      sectionName: section.sectionName,
      yes,
      no,
      na,
      incomplete,
      multi,
      scorePct,
      weight: section.weight,
      weightedContribution,
    });
  }

  return {
    sections,
    totalYes,
    totalNo,
    totalNa,
    totalIncomplete,
    totalMulti,
    finalScorePct: weightedFinal,
    scoringMode,
  };
}
