/**
 * P3-E10-T04 Closeout Lifecycle State Machine enumerations.
 * Lifecycle states, milestone statuses, evidence types, milestone keys.
 */

// -- Lifecycle States (§2.1) ------------------------------------------------

/** Project-level closeout lifecycle states per T04 §2.1. */
export type CloseoutLifecycleState =
  | 'NOT_STARTED'
  | 'ACTIVATED'
  | 'IN_PROGRESS'
  | 'INSPECTIONS_CLEARED'
  | 'TURNOVER_COMPLETE'
  | 'OWNER_ACCEPTANCE'
  | 'FINAL_COMPLETION'
  | 'ARCHIVE_READY'
  | 'ARCHIVED';

// -- Milestone Status (§4.1) ------------------------------------------------

/** Milestone status per T04 §4.1. */
export type CloseoutMilestoneStatus =
  | 'PENDING'
  | 'EVIDENCE_PENDING'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'BYPASSED';

// -- Milestone Evidence Type (§4.1) -----------------------------------------

/** Evidence type for milestone records per T04 §4.1. */
export type CloseoutMilestoneEvidenceType =
  | 'System'
  | 'ChecklistItem'
  | 'ChecklistSection'
  | 'DocumentAttachment'
  | 'CrossModuleSignal'
  | 'SubsurfaceApproved';

// -- Full Milestone Key (§4.2 — 13 milestones) ------------------------------

/** Complete set of 13 milestone keys per T04 §4.2. */
export type CloseoutFullMilestoneKey =
  | 'CHECKLIST_ACTIVATED'
  | 'TASKS_COMPLETE'
  | 'DOCUMENTS_COMPLETE'
  | 'CO_OBTAINED'
  | 'TURNOVER_COMPLETE'
  | 'OWNER_ACCEPTANCE'
  | 'LIENS_RELEASED'
  | 'FILES_RETURNED'
  | 'FINAL_COMPLETION'
  | 'SCORECARDS_COMPLETE'
  | 'LESSONS_APPROVED'
  | 'AUTOPSY_COMPLETE'
  | 'ARCHIVE_READY';

// -- Lifecycle Layer (§1) ---------------------------------------------------

/** Hybrid lifecycle model layers per T04 §1. */
export type CloseoutLifecycleLayer =
  | 'ProjectLevel'
  | 'ItemLevel';

// -- State Transition Trigger Type (§2.2) -----------------------------------

/** Trigger type for state transitions per T04 §2.2. */
export type CloseoutTransitionTriggerType =
  | 'System'
  | 'PMAction'
  | 'PEAction';
