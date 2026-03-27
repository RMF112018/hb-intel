import { useMemo } from 'react';

import type { ProjectHubActivitySummary } from '../types.js';

/**
 * Returns a mock activity summary for the project operating surface.
 * Will be replaced by real activity-spine aggregation in a follow-on.
 */
export function useActivitySummary(): ProjectHubActivitySummary {
  return useMemo(
    () => ({
      entries: [
        { id: 'act-1', timestamp: '2026-03-27T14:30:00Z', type: 'decision' as const, title: 'Forecast version confirmed for March', sourceModule: 'financial', actor: 'PM' },
        { id: 'act-2', timestamp: '2026-03-27T11:00:00Z', type: 'milestone' as const, title: 'Foundation Complete milestone approaching', sourceModule: 'schedule', actor: null },
        { id: 'act-3', timestamp: '2026-03-26T16:45:00Z', type: 'escalation' as const, title: 'Constraint Permit 14-B escalated to PE', sourceModule: 'constraints', actor: 'PM' },
        { id: 'act-4', timestamp: '2026-03-26T09:15:00Z', type: 'blocker' as const, title: 'New critical blocker — Electrical subcontract gate', sourceModule: 'subcontract-readiness', actor: null },
        { id: 'act-5', timestamp: '2026-03-25T15:20:00Z', type: 'publication' as const, title: 'February financial report published', sourceModule: 'reports', actor: 'PM' },
        { id: 'act-6', timestamp: '2026-03-25T10:00:00Z', type: 'state-change' as const, title: 'Safety inspection passed — Zone B', sourceModule: 'safety', actor: 'Safety Lead' },
        { id: 'act-7', timestamp: '2026-03-24T14:00:00Z', type: 'handoff' as const, title: 'Buyout savings disposition requested', sourceModule: 'financial', actor: 'PM' },
        { id: 'act-8', timestamp: '2026-03-24T09:30:00Z', type: 'decision' as const, title: 'Schedule baseline updated with PE approval', sourceModule: 'schedule', actor: 'PE' },
        { id: 'act-9', timestamp: '2026-03-23T16:00:00Z', type: 'milestone' as const, title: 'Startup checklist — 3 items remaining', sourceModule: 'startup', actor: null },
        { id: 'act-10', timestamp: '2026-03-23T11:30:00Z', type: 'state-change' as const, title: 'Permit 12-A approved', sourceModule: 'permits', actor: 'Permitting Authority' },
      ],
    }),
    [],
  );
}
