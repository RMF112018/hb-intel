/**
 * P3-E10-T02 Project Closeout Module record-level enumerations.
 * Record families, identity, field architecture, publication states.
 */

// -- Publication States (§2) ------------------------------------------------

/** Six-state publication model plus Superseded and Archived per T02 §2. */
export type CloseoutPublicationState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PE_REVIEW'
  | 'REVISION_REQUIRED'
  | 'PE_APPROVED'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'ARCHIVED';

// -- Checklist Item Result (§4.2) -------------------------------------------

/** Tri-state plus Pending result for checklist items per T02 §4.2. */
export type CloseoutChecklistItemResult =
  | 'Yes'
  | 'No'
  | 'NA'
  | 'Pending';

// -- Checklist Responsible Role (§4.2) --------------------------------------

/** Responsible role for a checklist item per T02 §4.2. */
export type CloseoutChecklistResponsibleRole =
  | 'PM'
  | 'SUPT'
  | 'PE'
  | 'OWNER'
  | 'AHJ'
  | 'ARCHITECT'
  | 'ENGINEER'
  | 'MOE';

// -- Checklist Lifecycle Stage Trigger (§4.2) -------------------------------

/** Lifecycle stage trigger for checklist item activation per T02 §4.2. */
export type CloseoutChecklistLifecycleStageTrigger =
  | 'ALWAYS'
  | 'INSPECTIONS'
  | 'TURNOVER'
  | 'POST_TURNOVER'
  | 'FINAL_COMPLETION'
  | 'ARCHIVE_READY';

// -- Checklist Jurisdiction (§4.1) ------------------------------------------

/** Jurisdiction enum governing Section 7 per T02 §4.1. */
export type CloseoutChecklistJurisdiction =
  | 'PBC'
  | 'Other';

// -- Scorecard Evaluation Type (§4.3) --------------------------------------

/** Evaluation type for subcontractor scorecards per T02 §4.3. */
export type CloseoutScorecardEvaluationType =
  | 'Interim'
  | 'FinalCloseout';

// -- Re-Bid Recommendation (§4.3) ------------------------------------------

/** Re-bid recommendation for subcontractor scorecards per T02 §4.3. */
export type CloseoutReBidRecommendation =
  | 'Yes'
  | 'YesWithConditions'
  | 'No';
