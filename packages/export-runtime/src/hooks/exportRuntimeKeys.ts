/**
 * SF24-T04 — Export runtime query key factory.
 *
 * Consistent cache key structure for all export runtime queries.
 * Follows the activity-timeline `activityTimelineKeys` pattern.
 *
 * Governing: SF24-T04
 */

export const exportRuntimeKeys = {
  /** Root key for all export runtime queries. */
  all: ['export-runtime'] as const,
  /** Requests for a specific module. */
  requests: (moduleKey: string) => ['export-runtime', moduleKey, 'requests'] as const,
  /** Composition drafts for a specific module. */
  composition: (moduleKey: string) => ['export-runtime', moduleKey, 'composition'] as const,
  /** Offline queue for a specific module. */
  queue: (moduleKey: string) => ['export-runtime', moduleKey, 'queue'] as const,
  /** Receipts for a specific module. */
  receipts: (moduleKey: string) => ['export-runtime', moduleKey, 'receipts'] as const,
} as const;
