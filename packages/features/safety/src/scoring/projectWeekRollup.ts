import type { FindingSeverity, SafetyFinding, SafetyInspectionEvent } from '../domain/types.js';

export interface ProjectWeekRollup {
  readonly inspectionCount: number;
  readonly averageInspectionScore: number | null;
  readonly highestRiskFindingLevel: FindingSeverity | null;
}

/**
 * Minimal finding shape used by the rollup. Accepts any object carrying
 * `severity` — the pipeline synthesises in-flight finding sketches from
 * draft findings without allocating full `SafetyFinding` records.
 */
export type RollupFinding = Pick<SafetyFinding, 'severity'>;

export function computeProjectWeekRollup(
  inspections: ReadonlyArray<SafetyInspectionEvent>,
  findings: ReadonlyArray<RollupFinding>,
): ProjectWeekRollup {
  const accepted = inspections.filter(
    (i) => i.ingestionStatus === 'accepted' || i.ingestionStatus === 'duplicate-suspected',
  );

  const inspectionCount = accepted.length;
  const averageInspectionScore =
    inspectionCount === 0
      ? null
      : accepted.reduce((sum, i) => sum + i.inspectionScore, 0) / inspectionCount;

  const rank: Record<FindingSeverity, number> = { info: 1, medium: 2, high: 3 };
  let highest: FindingSeverity | null = null;
  for (const f of findings) {
    if (highest === null || rank[f.severity] > rank[highest]) {
      highest = f.severity;
    }
  }

  return { inspectionCount, averageInspectionScore, highestRiskFindingLevel: highest };
}
