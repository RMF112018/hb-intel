/**
 * P3-E8-T04 Inspection program types.
 * Scoring result, trend, score summary, work queue, template.
 */

import type { CorrectiveActionSeverity } from '../records/enums.js';
import type { InspectionTrendDirection, InspectionScoreBand } from './enums.js';

// -- Scoring Result (§4.1) --------------------------------------------------

/** Return type for the normalized scoring algorithm. */
export interface IInspectionScoringResult {
  readonly applicableSectionCount: number;
  readonly rawScore: number;
  readonly maxPossibleScore: number;
  readonly normalizedScore: number;
}

// -- Score Trend (§5.1) -----------------------------------------------------

export interface IInspectionTrendDataPoint {
  readonly inspectionWeek: string;
  readonly normalizedScore: number;
  readonly inspectionDate: string;
  readonly inspectionId: string;
}

export interface IInspectionScoreTrend {
  readonly projectId: string;
  readonly computedAt: string;
  readonly windowWeeks: number;
  readonly dataPoints: readonly IInspectionTrendDataPoint[];
  readonly trendDirection: InspectionTrendDirection;
  readonly latestScore: number | null;
  readonly averageScore: number | null;
  readonly lowestScoreInWindow: number | null;
}

// -- Section Score Summary (§4.2) -------------------------------------------

export interface ISectionScoreSummary {
  readonly sectionKey: string;
  readonly sectionName: string;
  readonly isApplicable: boolean;
  readonly score: number | null;
  readonly failedItems: number;
}

// -- Standard Template (§2.2) -----------------------------------------------

export interface IStandardTemplateSection {
  readonly sectionKey: string;
  readonly sectionName: string;
  readonly defaultWeight: number;
}

// -- Corrective Action Due Date (§6) ----------------------------------------

export interface ICorrectiveActionDueDateRule {
  readonly severity: CorrectiveActionSeverity;
  readonly businessDays: number;
}

// -- Work Queue (§7) --------------------------------------------------------

export interface IInspectionWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

// -- Score Band Threshold ---------------------------------------------------

export interface IScoreBandThreshold {
  readonly band: InspectionScoreBand;
  readonly minScore: number;
}
