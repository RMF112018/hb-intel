/** SF25-T04 — Query key factory. */
export const publishWorkflowKeys = {
  all: ['publish-workflow'] as const,
  request: (moduleKey: string, recordId: string) => ['publish-workflow', moduleKey, recordId] as const,
  readiness: (moduleKey: string, recordId: string) => ['publish-workflow', moduleKey, recordId, 'readiness'] as const,
  queue: (moduleKey: string, recordId: string) => ['publish-workflow', moduleKey, recordId, 'queue'] as const,
} as const;
