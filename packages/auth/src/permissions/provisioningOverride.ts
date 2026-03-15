/**
 * G6-T02: Granular provisioning override permissions for admin surfaces.
 *
 * These permission strings gate the admin-only provisioning management actions
 * in the PWA and SPFx admin apps. Each constant corresponds to a specific
 * admin action on a provisioning run.
 *
 * Permission grammar: `admin:provisioning:<action>` (3-segment, domain:resource:action).
 * The global wildcard `*:*` grants all of these. Individual grants are explicit.
 */

/** Retry a failed provisioning run. Restricted to transient failures only. */
export const ADMIN_PROVISIONING_RETRY = 'admin:provisioning:retry' as const;

/** Escalate a failed provisioning run to a higher-tier admin. */
export const ADMIN_PROVISIONING_ESCALATE = 'admin:provisioning:escalate' as const;

/** Archive a failed provisioning run (remove from active failure queue). */
export const ADMIN_PROVISIONING_ARCHIVE = 'admin:provisioning:archive' as const;

/** Force a provisioning run into a specific state (expert-tier admin only). */
export const ADMIN_PROVISIONING_FORCE_STATE = 'admin:provisioning:force-state' as const;

/** View full alert detail for provisioning failures (error payloads, step metadata). */
export const ADMIN_PROVISIONING_ALERT_FULL_DETAIL = 'admin:provisioning:alert:full-detail' as const;

/**
 * Convenience aggregate map for all provisioning override permissions.
 * Consumers can iterate or destructure: `PROVISIONING_OVERRIDE_PERMISSIONS.RETRY`.
 */
export const PROVISIONING_OVERRIDE_PERMISSIONS = {
  RETRY: ADMIN_PROVISIONING_RETRY,
  ESCALATE: ADMIN_PROVISIONING_ESCALATE,
  ARCHIVE: ADMIN_PROVISIONING_ARCHIVE,
  FORCE_STATE: ADMIN_PROVISIONING_FORCE_STATE,
  ALERT_FULL_DETAIL: ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
} as const;

/**
 * Coarse aggregate permission constant. This is an organizational label for
 * documentation and T02 contract alignment — it does NOT function as a wildcard
 * grant. Consumers must grant the individual permissions or use `*:*`.
 */
export const ADMIN_PROVISIONING_OVERRIDE = 'admin:provisioning:override' as const;

/**
 * All individual provisioning override permission strings as a readonly array.
 * Useful for bulk-granting in persona registries or test fixtures.
 */
export const ALL_PROVISIONING_OVERRIDE_PERMISSIONS = [
  ADMIN_PROVISIONING_RETRY,
  ADMIN_PROVISIONING_ESCALATE,
  ADMIN_PROVISIONING_ARCHIVE,
  ADMIN_PROVISIONING_FORCE_STATE,
  ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
] as const;
