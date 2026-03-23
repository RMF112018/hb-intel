/**
 * SF28-T04 — Activity timeline query key factory.
 *
 * Pure functions — no React dependency. Used by all timeline hooks
 * for TanStack Query cache key generation.
 */

const PREFIX = 'activity-timeline' as const;

export const activityTimelineKeys = {
  /** Timeline query key: ['activity-timeline', mode, projectId] */
  timeline: (mode: string, projectId: string) =>
    [PREFIX, mode, projectId] as const,

  /** Filter state key: ['activity-timeline', 'filters', scopeKey] */
  filters: (scopeKey: string) =>
    [PREFIX, 'filters', scopeKey] as const,

  /** Source health key: ['activity-timeline', 'source-health', scopeKey] */
  sourceHealth: (scopeKey: string) =>
    [PREFIX, 'source-health', scopeKey] as const,
} as const;
