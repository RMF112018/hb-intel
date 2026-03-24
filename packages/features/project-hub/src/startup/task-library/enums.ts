/**
 * P3-E11-T10 Stage 2 Project Startup Task Library enumerations.
 * Governed template catalog, task instances, blockers, evidence.
 */

// -- Task Sections (T03 §2) -------------------------------------------------

/** The 4 task library sections per T03 §2. */
export type StartupTaskSectionCode =
  | 'REVIEW_OWNER_CONTRACT'
  | 'JOB_STARTUP'
  | 'ORDER_SERVICES'
  | 'PERMIT_POSTING';

// -- Task Categories (T03 §3) -----------------------------------------------

/** The 12 task categories per T03 §3. */
export type StartupTaskCategory =
  | 'CONTRACTUAL_OBLIGATION'
  | 'ADMIN_SETUP'
  | 'FINANCIAL_SETUP'
  | 'SUBCONTRACTOR_MANAGEMENT'
  | 'OWNER_COORDINATION'
  | 'LEGAL_AND_NOTICE'
  | 'SITE_SERVICES'
  | 'SCHEDULE_AND_PLANNING'
  | 'TEAM_SETUP'
  | 'SAFETY_COORDINATION'
  | 'COMMUNITY_AND_EXTERNAL'
  | 'PERMIT_POSTING';

// -- Task Severity (T03 §4) -------------------------------------------------

/** Task severity levels per T03 §4. */
export type StartupTaskSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'STANDARD';

// -- Task Gating Impact (T03 §4) --------------------------------------------

/** Task gating impact on certification per T03 §4. */
export type StartupTaskGatingImpact =
  | 'BLOCKS_CERTIFICATION'
  | 'REQUIRES_BLOCKER_IF_OPEN'
  | 'ADVISORY';

// -- Task Owner Roles (T03 §4) ----------------------------------------------

/** Task owner role codes per T03 §4. */
export type StartupTaskOwnerRole =
  | 'PM'
  | 'PA'
  | 'PROJ_ACCT'
  | 'PX'
  | 'SUPERINTENDENT'
  | 'SAFETY_MANAGER';

// -- Due Trigger (T03 §6) ---------------------------------------------------

/** Due date trigger per T03 §6. */
export type StartupTaskDueTrigger =
  | 'ON_PROJECT_CREATION'
  | 'ON_CONTRACT_EXECUTION'
  | 'ON_NTP_ISSUED'
  | 'DAYS_BEFORE_MOBILIZATION'
  | 'NONE';

// -- Task Result (T03 §2) ---------------------------------------------------

/** Task result values per T03 §2. Null while unreviewed. */
export type StartupTaskResult =
  | 'YES'
  | 'NO'
  | 'NA';

// -- Task Blocker Type (T03 §8) ---------------------------------------------

/** TaskBlocker type per T03 §8.1. */
export type TaskBlockerType =
  | 'PENDING_OWNER_ACTION'
  | 'PENDING_PERMIT'
  | 'PENDING_SUBCONTRACTOR_COI'
  | 'PENDING_INTERNAL_SETUP'
  | 'PENDING_INFORMATION'
  | 'PENDING_SYSTEM_SETUP'
  | 'DEPENDENCY_UNSATISFIED'
  | 'OTHER';

// -- Task Blocker Status (T03 §8) -------------------------------------------

/** TaskBlocker status per T03 §8.2. */
export type TaskBlockerStatus =
  | 'OPEN'
  | 'RESOLVED'
  | 'WAIVED';

// -- Evidence Types (T03 §7) ------------------------------------------------

/** Evidence type codes per T03 §7.1. */
export type StartupTaskEvidenceType =
  | 'COI_DOCUMENT'
  | 'EXECUTED_DOCUMENT'
  | 'RECORDED_DOCUMENT'
  | 'SYSTEM_SCREENSHOT'
  | 'PERMIT_COPY'
  | 'MEETING_MINUTES'
  | 'SCHEDULE_FILE'
  | 'PLAN_OR_DOCUMENT'
  | 'CORRESPONDENCE';

// -- Stage 2 Activity Spine Events (T10 §2 Stage 2) -------------------------

/** Activity Spine events emitted by Stage 2 per T10 §2 Stage 2. */
export type Stage2ActivityEvent =
  | 'StartupTaskLibraryActivated'
  | 'StartupTaskInstanceUpdated'
  | 'TaskBlockerCreated'
  | 'TaskBlockerResolved';

// -- Stage 2 Health Spine Metrics (T10 §2 Stage 2) --------------------------

/** Health Spine metrics published by Stage 2 per T10 §2 Stage 2. */
export type Stage2HealthMetric =
  | 'startupTaskCompletionRate'
  | 'startupOpenTaskBlockerCount';

// -- Stage 2 Work Queue Items (T10 §2 Stage 2) ------------------------------

/** Work Queue items raised by Stage 2 per T10 §2 Stage 2. */
export type Stage2WorkQueueItem =
  | 'CriticalTaskUnstarted'
  | 'TaskBlockerOpen';
