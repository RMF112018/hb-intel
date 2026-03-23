/**
 * SF26-T04 — Query key factory.
 */
export const savedViewsKeys = {
  all: ['saved-views'] as const,
  views: (moduleKey: string, workspaceKey: string) => ['saved-views', moduleKey, workspaceKey] as const,
  compatibility: (moduleKey: string, workspaceKey: string, viewId: string) => ['saved-views', moduleKey, workspaceKey, viewId, 'compatibility'] as const,
} as const;
