/**
 * P3-E10-T08 Project Hub Consumption, Derived Intelligence Indexes, and Reporting enumerations.
 */

// -- Data Classes (§1) ------------------------------------------------------

/** Three data classes with distinct APIs per T08 §1. */
export type CloseoutDataClass =
  | 'ProjectOperational'
  | 'PublishedIntelligence'
  | 'ReadOnlyAggregation';

// -- Org Intelligence Indexes (§2) ------------------------------------------

/** Three org intelligence indexes per T08 §2. */
export type CloseoutOrgIndex =
  | 'LessonsIntelligence'
  | 'SubIntelligence'
  | 'LearningLegacy';

// -- Health Spine Dimensions (§5.2) -----------------------------------------

/** Health spine dimensions emitted by Closeout per T08 §5.2. */
export type CloseoutHealthSpineDimension =
  | 'closeoutCompletionPct'
  | 'scorecardCoverage'
  | 'lessonsReadiness'
  | 'autopsyReadiness';
