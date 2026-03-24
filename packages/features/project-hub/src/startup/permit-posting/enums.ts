/**
 * P3-E11-T10 Stage 4 Project Startup Permit Posting Verification enumerations.
 * Permit types, verification results, spine events.
 */

// -- Permit Types (T07 §9.2) ------------------------------------------------

/** The 12 permit types mapped to Section 4 task items per T07 §9.2. */
export type StartupPermitType =
  | 'Master'
  | 'Roofing'
  | 'Plumbing'
  | 'HVAC'
  | 'Electrical'
  | 'FireAlarm'
  | 'FireSprinkler'
  | 'Elevator'
  | 'Irrigation'
  | 'LowVoltage'
  | 'SiteUtilities'
  | 'RightOfWay';

// -- Verification Result (T07 §9) -------------------------------------------

/** Permit verification result. Mirrors task result for Section 4 items. */
export type PermitVerificationResult =
  | 'Yes'
  | 'No'
  | 'NA';

// -- Lane Surface (T09 §7.2) ------------------------------------------------

/** Application surface for depth differentiation per T09 §7.2. */
export type AppSurface =
  | 'PWA'
  | 'SPFx';

// -- Stage 4 Activity Spine Events (T10 §2 Stage 4) -------------------------

/** Activity Spine event emitted by Stage 4 per T10 §2 Stage 4. */
export type Stage4ActivityEvent =
  | 'PermitPostingVerified';

// -- Stage 4 Work Queue Items (T10 §2 Stage 4) ------------------------------

/** Work Queue item raised by Stage 4 per T10 §2 Stage 4. */
export type Stage4WorkQueueItem =
  | 'PermitNotPosted';
