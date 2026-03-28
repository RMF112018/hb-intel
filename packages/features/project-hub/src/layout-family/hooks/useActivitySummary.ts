import { useMemo } from 'react';

import type { ProjectHubActivitySummary, ProjectHubActivityEntry } from '../types.js';
import { useProjectActivity } from '../../activity/useProjectActivity.js';
import { registerActivityAdapters } from '../../activity/registerActivityAdapters.js';

// Ensure adapters are registered before any hook call.
registerActivityAdapters();

/**
 * Maps IProjectActivityEvent category → ProjectHubActivityEntry type.
 */
function mapCategoryToEntryType(category: string): ProjectHubActivityEntry['type'] {
  switch (category) {
    case 'status-change': return 'state-change';
    case 'milestone': return 'milestone';
    case 'approval': return 'decision';
    case 'handoff': return 'handoff';
    case 'alert': return 'escalation';
    case 'record-change': return 'publication';
    case 'system': return 'state-change';
    default: return 'state-change';
  }
}

/**
 * Returns the activity summary for the project operating surface,
 * powered by the canonical Activity spine via aggregateActivityFeed().
 *
 * Falls back to an empty feed when no adapters are registered or data
 * is unavailable — honoring the runtime-honesty doctrine.
 */
export function useActivitySummary(projectId?: string): ProjectHubActivitySummary {
  const effectiveProjectId = projectId ?? 'unknown';

  const { feed } = useProjectActivity({
    projectId: effectiveProjectId,
    limit: 10,
  });

  return useMemo(() => {
    if (!feed || feed.events.length === 0) {
      return { entries: [] };
    }

    const entries: ProjectHubActivityEntry[] = feed.events.map((event) => ({
      id: event.eventId,
      timestamp: event.occurredAt,
      type: mapCategoryToEntryType(event.category),
      title: event.summary,
      sourceModule: event.sourceModule,
      actor: event.changedByName !== 'system' ? event.changedByName : null,
    }));

    return { entries };
  }, [feed]);
}
