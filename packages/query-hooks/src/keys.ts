/**
 * Centralized query key factory — Blueprint §2g.
 *
 * Every TanStack Query cache entry uses keys produced here so that
 * invalidation is type-safe and consistent across the app.
 */

export const queryKeys = {
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (opts?: Record<string, unknown>) => [...queryKeys.leads.lists(), opts] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.leads.details(), id] as const,
    search: (query: string) => [...queryKeys.leads.all, 'search', query] as const,
  },

  schedule: {
    all: ['schedule'] as const,
    activities: (projectId: string) => [...queryKeys.schedule.all, 'activities', projectId] as const,
    activity: (id: number) => [...queryKeys.schedule.all, 'activity', id] as const,
    metrics: (projectId: string) => [...queryKeys.schedule.all, 'metrics', projectId] as const,
  },

  buyout: {
    all: ['buyout'] as const,
    entries: (projectId: string) => [...queryKeys.buyout.all, 'entries', projectId] as const,
    entry: (id: number) => [...queryKeys.buyout.all, 'entry', id] as const,
    summary: (projectId: string) => [...queryKeys.buyout.all, 'summary', projectId] as const,
  },

  scorecard: {
    all: ['scorecard'] as const,
    scorecards: (projectId: string) => [...queryKeys.scorecard.all, 'list', projectId] as const,
    detail: (id: number) => [...queryKeys.scorecard.all, 'detail', id] as const,
    versions: (scorecardId: number) => [...queryKeys.scorecard.all, 'versions', scorecardId] as const,
  },

  project: {
    all: ['project'] as const,
    lists: () => [...queryKeys.project.all, 'list'] as const,
    list: (opts?: Record<string, unknown>) => [...queryKeys.project.lists(), opts] as const,
    detail: (id: string) => [...queryKeys.project.all, 'detail', id] as const,
    dashboard: () => [...queryKeys.project.all, 'dashboard'] as const,
  },
} as const;
