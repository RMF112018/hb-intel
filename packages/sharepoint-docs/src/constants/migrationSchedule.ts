/**
 * Migration scheduling constants (D-02, D-11).
 */

/** Local hour (0–23) when the migration window opens each night. */
export const MIGRATION_WINDOW_START_HOUR = 22;  // 10 PM

/** Local hour (0–23) when the migration window closes each morning. */
export const MIGRATION_WINDOW_END_HOUR = 2;     // 2 AM

/** Hours before the migration window that the pre-notification is sent. */
export const PRE_NOTIFICATION_LEAD_HOURS = 8;   // sent ~2 PM for 10 PM window

/** Minutes to wait before first automatic retry after failure. */
export const RETRY_DELAY_FIRST_MINUTES = 30;

/** Hours to wait before second automatic retry after failure. */
export const RETRY_DELAY_SECOND_HOURS = 2;

/** After this many failures, escalate to the department Director. */
export const ESCALATION_FAILURE_THRESHOLD = 3;

/** Hours after which an unresolved conflict auto-resolves to "project site wins" (D-06). */
export const CONFLICT_AUTO_RESOLVE_HOURS = 48;

/** Hours before a queued offline entry expires (D-03). */
export const OFFLINE_QUEUE_TTL_HOURS = 48;
