/**
 * P3-E9-T08 reports spine-publication enumerations.
 * Activity events, health metric, work queue, related items.
 */

// -- Reports Activity Event Type ----------------------------------------------

/** Type of activity event emitted by the Reports module spine. */
export type ReportsActivityEventType = 'DRAFT_REFRESHED' | 'APPROVED' | 'RELEASED' | 'STALE_WARNING';

// -- Reports Activity Category ------------------------------------------------

/** Category grouping for Reports activity events. */
export type ReportsActivityCategory = 'RECORD_CHANGE' | 'APPROVAL' | 'ALERT';

// -- Reports Activity Significance --------------------------------------------

/** Significance level for Reports activity events. */
export type ReportsActivitySignificance = 'ROUTINE' | 'NOTABLE';

// -- Reports Work Queue Item Type ---------------------------------------------

/** Type of work queue item produced by the Reports module. */
export type ReportsWorkQueueItemType =
  | 'REPORT_DRAFT_STALE'
  | 'REPORT_APPROVAL_PENDING'
  | 'REPORT_DISTRIBUTION_PENDING';

// -- Reports Health Metric Status ---------------------------------------------

/** Traffic-light status for Reports health metrics. */
export type ReportsHealthMetricStatus = 'GREEN' | 'YELLOW' | 'RED';

// -- Reports Related Item Relationship ----------------------------------------

/** Relationship type for related item entries in the Reports module. */
export type ReportsRelatedItemRelationship = 'REFERENCES' | 'GOVERNED_BY';
