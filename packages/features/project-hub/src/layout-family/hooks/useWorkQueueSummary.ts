import { useMemo } from 'react';

import type { ProjectHubWorkQueueSummary } from '../types.js';

/**
 * Returns the work queue summary for the project operating surface.
 *
 * Currently uses deterministic project-scoped mock data. Will be replaced
 * by real @hbc/my-work-feed data when the feed API supports project filtering.
 *
 * @param projectId - Canonical project ID for scoping work items
 */
export function useWorkQueueSummary(projectId?: string): ProjectHubWorkQueueSummary {
  return useMemo(
    () => ({
      totalItems: 8,
      urgentItems: 3,
      overdueItems: 1,
      items: [
        { id: `wq-${projectId}-1`, title: 'Forecast checklist incomplete', sourceModule: 'financial', owner: 'PM', urgency: 'urgent' as const, dueDate: '2026-03-28', aging: 2 },
        { id: `wq-${projectId}-2`, title: 'Schedule milestone at risk — Foundation Complete', sourceModule: 'schedule', owner: 'Superintendent', urgency: 'urgent' as const, dueDate: '2026-03-30', aging: null },
        { id: `wq-${projectId}-3`, title: 'Constraint resolution overdue — Permit 14-B', sourceModule: 'constraints', owner: 'PM', urgency: 'urgent' as const, dueDate: '2026-03-25', aging: 5 },
        { id: `wq-${projectId}-4`, title: 'Buyout savings undispositioned — Electrical', sourceModule: 'financial', owner: 'PM', urgency: 'standard' as const, dueDate: null, aging: null },
        { id: `wq-${projectId}-5`, title: 'Safety corrective action open', sourceModule: 'safety', owner: 'Safety Lead', urgency: 'standard' as const, dueDate: '2026-04-05', aging: null },
        { id: `wq-${projectId}-6`, title: 'Subcontract readiness gate blocked', sourceModule: 'subcontract-readiness', owner: 'PM', urgency: 'standard' as const, dueDate: null, aging: null },
        { id: `wq-${projectId}-7`, title: 'Report candidate needs designation', sourceModule: 'reports', owner: 'PM', urgency: 'low' as const, dueDate: null, aging: null },
        { id: `wq-${projectId}-8`, title: 'Startup checklist items remaining', sourceModule: 'startup', owner: 'PM', urgency: 'low' as const, dueDate: null, aging: null },
      ],
    }),
    [projectId],
  );
}
