import { useMemo } from 'react';

import { PROJECT_HUB_SPFX_MODULES } from '../../spfx-lane/index.js';
import type { ProjectHubModulePostureSummary } from '../types.js';

/**
 * Mock posture map — deterministic posture per module for development.
 * Will be replaced by real health-pulse computation in a follow-on.
 */
const MOCK_POSTURES: Record<string, ProjectHubModulePostureSummary['posture']> = {
  financial: 'watch',
  schedule: 'at-risk',
  constraints: 'critical',
  permits: 'healthy',
  safety: 'healthy',
  reports: 'watch',
  qc: 'no-data',
  closeout: 'healthy',
  startup: 'healthy',
  'subcontract-readiness': 'watch',
  warranty: 'read-only',
};

const MOCK_ISSUES: Record<string, number> = {
  financial: 2,
  schedule: 5,
  constraints: 8,
  permits: 0,
  safety: 1,
  reports: 3,
  qc: 0,
  closeout: 0,
  startup: 0,
  'subcontract-readiness': 2,
  warranty: 0,
};

const MOCK_ACTIONS: Record<string, number> = {
  financial: 3,
  schedule: 4,
  constraints: 6,
  permits: 1,
  safety: 2,
  reports: 2,
  qc: 0,
  closeout: 1,
  startup: 1,
  'subcontract-readiness': 3,
  warranty: 0,
};

/**
 * Returns posture summaries for all governed project-hub modules.
 * Currently returns deterministic mock data.
 */
export function useModulePostureSummaries(): readonly ProjectHubModulePostureSummary[] {
  return useMemo(
    () =>
      PROJECT_HUB_SPFX_MODULES.map((mod) => ({
        moduleSlug: mod.slug,
        label: mod.navLabel,
        posture: MOCK_POSTURES[mod.slug] ?? 'no-data',
        issueCount: MOCK_ISSUES[mod.slug] ?? 0,
        actionCount: MOCK_ACTIONS[mod.slug] ?? 0,
        owner: null,
        lastUpdated: null,
      })),
    [],
  );
}
