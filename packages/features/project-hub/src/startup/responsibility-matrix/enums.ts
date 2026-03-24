/**
 * P3-E11-T10 Stage 6 Project Startup Responsibility Matrix enumerations.
 * Two-sheet model, role columns, assignment values, task categories.
 */

// -- Matrix Sheet (T05 §2) --------------------------------------------------

/** The 2 matrix sheets per T05 §2. */
export type MatrixSheet =
  | 'PM'
  | 'Field';

// -- PM Role Codes (T05 §6) -------------------------------------------------

/** The 7 PM sheet assignment role columns per T05 §6. */
export type PMRoleCode =
  | 'PX'
  | 'SrPM'
  | 'PM2'
  | 'PM1'
  | 'PA'
  | 'QAQC'
  | 'ProjAcct';

// -- Field Role Codes (T05 §7) ----------------------------------------------

/** The 5 Field sheet assignment role columns per T05 §7. */
export type FieldRoleCode =
  | 'LeadSuper'
  | 'MEPSuper'
  | 'IntSuper'
  | 'AsstSuper'
  | 'QAQC_Field';

// -- Assignment Value (T05 §8) ----------------------------------------------

/** Responsibility assignment value per T05 §8. */
export type AssignmentValue =
  | 'Primary'
  | 'Support'
  | 'SignOff'
  | 'Review';

// -- PM Task Categories (T05 §8) --------------------------------------------

/** The 7 PM sheet task categories per T05 §8. */
export type PMTaskCategory =
  | 'PX'
  | 'SPM'
  | 'PM2'
  | 'PM1'
  | 'PA'
  | 'QAQC'
  | 'ProjAcct';

// -- Field Task Categories (T05 §10) ----------------------------------------

/** The 4 Field sheet task categories per T05 §10. */
export type FieldTaskCategory =
  | 'LeadSuper'
  | 'MEPSuper'
  | 'InteriorEnvelope'
  | 'QAQC_Field';

// -- Stage 6 Activity Spine Events (T10 §2 Stage 6) -------------------------

/** Activity Spine events emitted by Stage 6. */
export type Stage6ActivityEvent =
  | 'ResponsibilityAssignmentUpdated'
  | 'ResponsibilityAssignmentAcknowledged';

// -- Stage 6 Health Spine Metrics (T10 §2 Stage 6) --------------------------

/** Health Spine metrics published by Stage 6. */
export type Stage6HealthMetric =
  | 'responsibilityMatrixReadiness';

// -- Stage 6 Work Queue Items (T10 §2 Stage 6) ------------------------------

/** Work Queue items raised by Stage 6. */
export type Stage6WorkQueueItem =
  | 'MatrixUnassignedCategory'
  | 'MatrixAcknowledgmentPending';
