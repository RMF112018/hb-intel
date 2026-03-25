/**
 * P3-E9-T07 reports review-boundaries enumerations.
 * PER actions, lane depth, visibility roles, deep link views.
 */

// -- PER Report Actions -------------------------------------------------------

/** Actions a PER may or may not perform within the Reports module. */
export type PerReportAction =
  | 'VIEW_RUNS'
  | 'VIEW_DRAFT_STATUS'
  | 'ACCESS_RELEASED_ARTIFACTS'
  | 'PLACE_ANNOTATIONS'
  | 'GENERATE_REVIEWER_RUN'
  | 'RELEASE_IF_PERMITTED'
  | 'BROWSE_RUN_HISTORY'
  | 'CONFIRM_DRAFT'
  | 'EDIT_NARRATIVE'
  | 'MODIFY_RUN_LEDGER'
  | 'ACCESS_UNCONFIRMED_DRAFT'
  | 'ADVANCE_REVIEW_CHAIN'
  | 'APPROVE_PX_REVIEW'
  | 'REFRESH_DRAFT'
  | 'INITIATE_STANDARD_RUN'
  | 'MULTI_RUN_COMPARE';

// -- PER Action Permission ----------------------------------------------------

/** Whether a PER action is allowed or prohibited. */
export type PerActionPermission = 'ALLOWED' | 'PROHIBITED';

// -- Reports Lane Capability --------------------------------------------------

/** Capabilities available within the Reports module surface. */
export type ReportsLaneCapability =
  | 'REPORT_LIST'
  | 'GENERATE_RUN'
  | 'VIEW_RUN'
  | 'EDIT_DRAFT'
  | 'REFRESH_DRAFT'
  | 'RUN_HISTORY'
  | 'EXPORT_PDF'
  | 'APPROVAL_ACTION'
  | 'RELEASE_ACTION'
  | 'MULTI_RUN_COMPARE'
  | 'ANNOTATION_THREADS';

// -- Reports Lane Depth -------------------------------------------------------

/** Depth of capability support per surface lane. */
export type ReportsLaneDepth = 'PWA_FULL' | 'SPFX_BROAD' | 'SPFX_LAUNCH_TO_PWA';

// -- Reports Visibility Role --------------------------------------------------

/** Roles governing visibility within the Reports module. */
export type ReportsVisibilityRole =
  | 'PM'
  | 'PE'
  | 'PER'
  | 'SUPERINTENDENT'
  | 'FIELD'
  | 'MOE_ADMIN';

// -- Reports Deep Link View ---------------------------------------------------

/** Deep link view targets for SPFx-to-PWA launch scenarios. */
export type ReportsDeepLinkView =
  | 'FULL_HISTORY'
  | 'ADVANCED_DRAFT_EDITING'
  | 'COMPARE_RUNS'
  | 'REVIEW_THREADS';
