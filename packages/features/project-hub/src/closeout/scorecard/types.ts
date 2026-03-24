/**
 * P3-E10-T06 Subcontractor Scorecard Model TypeScript contracts.
 * Sections, criteria, scoring, workflow, visibility.
 */

import type { PerformanceRating, ScorecardSectionKey, ScorecardScoreValue } from './enums.js';

// -- Score Definitions (§2.1) -----------------------------------------------

/** Score definition per T06 §2.1. */
export interface IScorecardScoreDefinition {
  readonly score: ScorecardScoreValue;
  readonly label: string;
  readonly definition: string;
}

// -- Section Definitions (§2.2) ---------------------------------------------

/** Scorecard section definition per T06 §2.2. */
export interface IScorecardSectionDefinition {
  readonly key: ScorecardSectionKey;
  readonly label: string;
  readonly weight: number;
  readonly criteriaCount: number;
  readonly perCriterionWeight: number;
}

// -- Criterion Definitions (§2.3) -------------------------------------------

/** Scorecard criterion definition per T06 §2.3. */
export interface IScorecardCriterionDefinition {
  readonly sectionKey: ScorecardSectionKey;
  readonly number: string;
  readonly criterion: string;
  readonly evidenceGuidance: string;
}

// -- Performance Rating (§3.3) ----------------------------------------------

/** Performance rating range per T06 §3.3. */
export interface IPerformanceRatingRange {
  readonly rating: PerformanceRating;
  readonly minScore: number;
  readonly maxScore: number;
}

// -- Workflow (§4) ----------------------------------------------------------

/** Scorecard workflow step per T06 §4. */
export interface IScorecardWorkflowStep {
  readonly stepNumber: number;
  readonly phase: string;
  readonly description: string;
}

// -- Visibility (§5) --------------------------------------------------------

/** Scorecard visibility rule per T06 §5.1. */
export interface IScorecardVisibilityRule {
  readonly action: string;
  readonly pmAuthority: string;
  readonly suptAuthority: string;
  readonly peAuthority: string;
  readonly perAuthority: string;
}

/** Org-wide access rule per T06 §5.3. */
export interface IOrgAccessRule {
  readonly userType: string;
  readonly access: string;
}
