/**
 * Corrective-action and finding summarization for Safety Field Excellence.
 *
 * Limitation: Wave 01 schema does not add per-finding due/resolved-date
 * fields, so the corrective-action score cannot model closure timeliness
 * today. The score reduces with open and high-severity findings, and
 * confidence is reported as `low` until a future schema iteration adds
 * date-based aging signals. Do not fabricate closure performance.
 */

import type { FindingSeverity, SafetyFinding } from '../domain/types.js';

export interface FindingSummary {
  readonly highestRiskFindingLevel: FindingSeverity | null;
  readonly highSeverityFindingCount: number;
  readonly mediumSeverityFindingCount: number;
  readonly openFindingCount: number;
  readonly highSeverityOpenCount: number;
  readonly mediumSeverityOpenCount: number;
  readonly agedOpenFindingCount: number;
  readonly repeatFindingCount: number;
  readonly sourceFindingIds: ReadonlyArray<string>;
}

const SEVERITY_RANK: Record<FindingSeverity, number> = { info: 1, medium: 2, high: 3 };

export function summarizeFindings(
  windowFindings: ReadonlyArray<SafetyFinding>,
  rollingFindings: ReadonlyArray<SafetyFinding>,
  projectNumber: string,
): FindingSummary {
  let highest: FindingSeverity | null = null;
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;
  let openCount = 0;
  let highSeverityOpenCount = 0;
  let mediumSeverityOpenCount = 0;
  const sourceFindingIds: string[] = [];

  for (const finding of windowFindings) {
    if (highest === null || SEVERITY_RANK[finding.severity] > SEVERITY_RANK[highest]) {
      highest = finding.severity;
    }
    if (finding.severity === 'high') highSeverityCount += 1;
    if (finding.severity === 'medium') mediumSeverityCount += 1;
    if (finding.isOpen) {
      openCount += 1;
      if (finding.severity === 'high') highSeverityOpenCount += 1;
      if (finding.severity === 'medium') mediumSeverityOpenCount += 1;
    }
    sourceFindingIds.push(finding.id);
  }

  const repeatFindingCount = countRepeatFindings(windowFindings, rollingFindings, projectNumber);

  // Aged open findings require due/resolved-date schema that does not exist
  // today. Always 0 until a future schema iteration adds it.
  const agedOpenFindingCount = 0;

  return {
    highestRiskFindingLevel: highest,
    highSeverityFindingCount: highSeverityCount,
    mediumSeverityFindingCount: mediumSeverityCount,
    openFindingCount: openCount,
    highSeverityOpenCount,
    mediumSeverityOpenCount,
    agedOpenFindingCount,
    repeatFindingCount,
    sourceFindingIds,
  };
}

/**
 * Repeat finding heuristic: same `(projectNumber, sectionNumber,
 * checklistRowNumber)` appearing in the window AND somewhere in the
 * rolling history (excluding the window itself, which the caller is
 * responsible for separating).
 */
function countRepeatFindings(
  windowFindings: ReadonlyArray<SafetyFinding>,
  rollingFindings: ReadonlyArray<SafetyFinding>,
  projectNumber: string,
): number {
  if (windowFindings.length === 0 || rollingFindings.length === 0) return 0;

  const rollingKeys = new Set<string>();
  for (const finding of rollingFindings) {
    rollingKeys.add(repeatKey(projectNumber, finding.sectionNumber, finding.checklistRowNumber));
  }

  let repeats = 0;
  for (const finding of windowFindings) {
    const key = repeatKey(projectNumber, finding.sectionNumber, finding.checklistRowNumber);
    if (rollingKeys.has(key)) repeats += 1;
  }
  return repeats;
}

function repeatKey(projectNumber: string, sectionNumber: number, rowNumber: number): string {
  return `${projectNumber}|${sectionNumber}|${rowNumber}`;
}

export interface CorrectiveActionResult {
  readonly score: number;
  readonly confidence: 'high' | 'medium' | 'low';
}

const HIGH_OPEN_PENALTY = 25;
const HIGH_OPEN_PENALTY_CAP = 60;
const MEDIUM_OPEN_PENALTY = 10;
const MEDIUM_OPEN_PENALTY_CAP = 30;
const REPEAT_PENALTY = 8;
const REPEAT_PENALTY_CAP = 24;

export function computeCorrectiveActionScore(summary: FindingSummary): CorrectiveActionResult {
  const highOpenPenalty = Math.min(
    summary.highSeverityOpenCount * HIGH_OPEN_PENALTY,
    HIGH_OPEN_PENALTY_CAP,
  );
  const mediumOpenPenalty = Math.min(
    summary.mediumSeverityOpenCount * MEDIUM_OPEN_PENALTY,
    MEDIUM_OPEN_PENALTY_CAP,
  );
  const repeatPenalty = Math.min(summary.repeatFindingCount * REPEAT_PENALTY, REPEAT_PENALTY_CAP);

  const raw = 100 - highOpenPenalty - mediumOpenPenalty - repeatPenalty;
  const score = Math.max(0, raw);

  // Today, due/resolved date data does not exist. Confidence is always
  // `low` until aging signals are added in a future schema iteration.
  return { score, confidence: 'low' };
}
