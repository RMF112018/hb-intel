/**
 * Admin Intelligence constants.
 *
 * @design D-02, D-04, D-05
 */

/** Polling interval for admin alerts (ms) */
export const ADMIN_ALERTS_POLL_MS = 30_000;

/** Default probe scheduler interval — 15 minutes (ms) */
export const PROBE_SCHEDULER_DEFAULT_MS = 900_000;

/** Maximum probe retry attempts before marking error */
export const PROBE_MAX_RETRY = 3;

/** SharePoint list title for approval authority rules */
export const APPROVAL_RULE_LIST_TITLE = 'HBC_ApprovalAuthorityRules';

/** SharePoint list title for admin alerts */
export const ADMIN_ALERT_LIST_TITLE = 'HBC_AdminAlerts';

/** SharePoint list title for infrastructure probe snapshots */
export const INFRA_PROBE_LIST_TITLE = 'HBC_InfrastructureProbeSnapshots';

/** TanStack Query key for admin alerts */
export const ADMIN_ALERTS_QUERY_KEY = ['admin-alerts'] as const;

/** TanStack Query key for infrastructure probes */
export const INFRA_PROBES_QUERY_KEY = ['infra-probes'] as const;

/** TanStack Query key for approval authority rules */
export const APPROVAL_RULES_QUERY_KEY = ['approval-rules'] as const;
