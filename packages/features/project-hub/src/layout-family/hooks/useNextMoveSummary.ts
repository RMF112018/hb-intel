import { useMemo } from 'react';

import type { ProjectHubNextMoveSummary } from '../types.js';

/**
 * Returns a mock next-move summary for the project operating surface.
 * Will be replaced by real work-queue-driven next-move computation in a follow-on.
 */
export function useNextMoveSummary(): ProjectHubNextMoveSummary {
  return useMemo(
    () => ({
      items: [
        { id: 'nm-1', title: 'Resolve constraint Permit 14-B before milestone', sourceModule: 'constraints', owner: 'PM', action: 'Resolve', priority: 'critical' as const },
        { id: 'nm-2', title: 'Complete forecast checklist for March', sourceModule: 'financial', owner: 'PM', action: 'Complete checklist', priority: 'high' as const },
        { id: 'nm-3', title: 'Review schedule milestone drift report', sourceModule: 'schedule', owner: 'PM', action: 'Review', priority: 'high' as const },
        { id: 'nm-4', title: 'Disposition buyout savings — Electrical scope', sourceModule: 'financial', owner: 'PM', action: 'Disposition', priority: 'standard' as const },
        { id: 'nm-5', title: 'Confirm safety corrective action closure', sourceModule: 'safety', owner: 'Safety Lead', action: 'Confirm closure', priority: 'standard' as const },
      ],
    }),
    [],
  );
}
