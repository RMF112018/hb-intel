/** SF27-T04 — Query key factory. */
export const bulkActionKeys = {
  all: ['bulk-actions'] as const,
  selection: (moduleKey: string) => ['bulk-actions', moduleKey, 'selection'] as const,
  eligibility: (moduleKey: string, actionId: string) => ['bulk-actions', moduleKey, actionId, 'eligibility'] as const,
  execution: (moduleKey: string, actionId: string) => ['bulk-actions', moduleKey, actionId, 'execution'] as const,
  results: (moduleKey: string, actionId: string) => ['bulk-actions', moduleKey, actionId, 'results'] as const,
} as const;
