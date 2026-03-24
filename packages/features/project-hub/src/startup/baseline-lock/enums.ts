/**
 * P3-E11-T10 Stage 8 Project Startup Baseline Lock and Closeout Continuity enumerations.
 * Lock actor, API methods, spine events.
 */

// -- Baseline Lock Actor (T02 §7.2) -----------------------------------------

/** Actor who triggers baseline lock per T02 §7.2. */
export type BaselineLockActor =
  | 'PE'
  | 'SYSTEM';

// -- Baseline API Method (T02 §7.3) -----------------------------------------

/** HTTP methods for baseline API contract enforcement per T02 §7.3. */
export type BaselineAPIMethod =
  | 'GET'
  | 'PATCH'
  | 'PUT'
  | 'DELETE';

// -- Authorized Caller Role (T02 §7.3) --------------------------------------

/** Roles authorized to read the baseline API per T02 §7.3. */
export type BaselineReadRole =
  | 'PX'
  | 'CloseoutService';

// -- Stage 8 Activity Spine Events (T10 §2 Stage 8) -------------------------

/** Activity Spine event emitted by Stage 8. Fires from state machine at BASELINE_LOCKED. */
export type Stage8ActivityEvent =
  | 'StartupBaselineLocked';
