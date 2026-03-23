import type { IPublishBlocker } from '../src/schedule/types/index.js';

/**
 * Pre-built publication blocker scenarios.
 */
export const mockPublicationBlockers = {
  unresolvedHard: {
    blockerCode: 'UNRESOLVED_CRITICAL_BLOCKER',
    blockerDescription: 'Critical path activity has unresolved conflict',
    severity: 'Hard',
    resolvedAt: null,
  } as IPublishBlocker,

  resolvedHard: {
    blockerCode: 'STALE_SOURCE',
    blockerDescription: 'Source data is more than 30 days old',
    severity: 'Hard',
    resolvedAt: '2026-03-20T10:00:00Z',
  } as IPublishBlocker,

  unresolvedSoft: {
    blockerCode: 'LOW_CONFIDENCE',
    blockerDescription: 'Confidence score below threshold',
    severity: 'Soft',
    resolvedAt: null,
  } as IPublishBlocker,

  resolvedSoft: {
    blockerCode: 'MISSING_CAUSATION',
    blockerDescription: 'Some commitments lack causation codes',
    severity: 'Soft',
    resolvedAt: '2026-03-19T14:00:00Z',
  } as IPublishBlocker,
};

/**
 * Schedule summary threshold scenarios for §19.2 testing.
 */
export const scheduleSummaryVarianceScenarios = {
  onTrack: -5,
  onTrackZero: 0,
  atRisk: 5,
  atRiskBoundary: 7,
  delayed: 15,
  delayedBoundary: 21,
  critical: 30,
} as const;
