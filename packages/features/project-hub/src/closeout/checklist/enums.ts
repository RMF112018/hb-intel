/**
 * P3-E10-T03 Closeout Execution Checklist enumerations.
 * Template library, governed sections, milestone gates, spine events.
 */

// -- Checklist Sections (§3) ------------------------------------------------

/** The 7 governed checklist sections per T03 §3. */
export type CloseoutChecklistSectionKey =
  | 'Tasks'
  | 'DocumentTracking'
  | 'Inspections'
  | 'Turnover'
  | 'PostTurnover'
  | 'CompleteProjectCloseoutDocuments'
  | 'PBCJurisdiction';

// -- Milestone Gate Keys (§3 section gate rules) ----------------------------

/** Milestone gate keys triggered by checklist item completion per T03 §3. */
export type CloseoutMilestoneKey =
  | 'TASKS_COMPLETE'
  | 'DOCUMENTS_COMPLETE'
  | 'CO_OBTAINED'
  | 'TURNOVER_COMPLETE'
  | 'LIENS_RELEASED'
  | 'SCORECARDS_COMPLETE'
  | 'LESSONS_APPROVED'
  | 'FILES_RETURNED'
  | 'ARCHIVE_READY';

// -- Activity Spine Event Keys (§3, §5) ------------------------------------

/** Activity Spine event keys emitted by checklist items and instantiation per T03 §3, §5. */
export type CloseoutSpineEventKey =
  | 'subst-compl'
  | 'co-obtained'
  | 'last-work-date'
  | 'liens-released'
  | 'lessons-approved'
  | 'files-returned'
  | 'closeout.checklist-created';

// -- Template Authority (§1.1) ----------------------------------------------

/** Template library authority roles per T03 §1.1. */
export type CloseoutTemplateAuthority =
  | 'MOEAdmin'
  | 'PE'
  | 'PM'
  | 'SUPT';
