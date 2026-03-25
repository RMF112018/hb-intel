/**
 * P3-E9-T03 reports draft-model enumerations.
 * Draft lifecycle, staleness, narrative, refresh, freeze.
 */

// -- Draft Confirmation Status ------------------------------------------------

/** PM draft confirmation lifecycle states. */
export type DraftConfirmationStatus =
  | 'NOT_CONFIRMED'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'CONFIRMATION_FAILED';

// -- Staleness Level ----------------------------------------------------------

/** How stale a draft is relative to the configured threshold. */
export type StalenessLevel =
  | 'FRESH'
  | 'APPROACHING'
  | 'STALE'
  | 'CRITICALLY_STALE';

// -- Refresh Action -----------------------------------------------------------

/** How a draft refresh was initiated. */
export type RefreshAction = 'MANUAL_PM' | 'SCHEDULED_AUTO';

// -- Narrative Edit Action ----------------------------------------------------

/** Type of narrative edit performed. */
export type NarrativeEditAction = 'CREATED' | 'UPDATED' | 'CLEARED';

// -- Snapshot Freeze Status ---------------------------------------------------

/** Status of a snapshot freeze operation. */
export type SnapshotFreezeStatus = 'PENDING' | 'FROZEN' | 'FAILED';

// -- Readiness Check Result ---------------------------------------------------

/** Overall result of a draft readiness check. */
export type ReadinessCheckResult = 'READY' | 'NOT_READY' | 'BLOCKED';

// -- Structural Change Classification ----------------------------------------

/** Whether a configuration change is structural or non-structural. */
export type StructuralChangeClassification = 'STRUCTURAL' | 'NON_STRUCTURAL';

// -- Draft Staleness Work Queue Priority -------------------------------------

/** Priority level for staleness work queue items. */
export type DraftStalenessWorkQueuePriority = 'NORMAL' | 'HIGH';
