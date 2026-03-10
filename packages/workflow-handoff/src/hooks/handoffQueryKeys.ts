// ─────────────────────────────────────────────────────────────────────────────
// Query key factory for TanStack Query cache management.
// Used by useHandoffInbox, useHandoffStatus, and cache invalidation patterns.
// ─────────────────────────────────────────────────────────────────────────────

export const handoffQueryKeys = {
  inbox: () => ['workflow-handoff', 'inbox'] as const,
  outbox: () => ['workflow-handoff', 'outbox'] as const,
  package: (handoffId: string) => ['workflow-handoff', 'package', handoffId] as const,
  outboundBySource: (sourceRecordId: string) =>
    ['workflow-handoff', 'outbound', sourceRecordId] as const,
};
