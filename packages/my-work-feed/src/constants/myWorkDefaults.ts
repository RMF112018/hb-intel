export const MY_WORK_QUERY_KEY_PREFIX = 'my-work' as const;
export const MY_WORK_PRIORITY_LANES = ['now', 'soon', 'watch', 'deferred'] as const;
export const MY_WORK_REPLAYABLE_ACTIONS = ['mark-read', 'defer', 'undefer', 'pin-today', 'pin-week', 'waiting-on'] as const;
export const MY_WORK_SYNC_STATUSES = ['live', 'cached', 'partial', 'queued'] as const;

export const MY_WORK_SOURCE_PRIORITY = [
  'bic-next-move',
  'workflow-handoff',
  'acknowledgment',
  'notification-intelligence',
  'session-state',
  'module',
] as const;
