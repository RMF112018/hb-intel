import type { IVersionMetadata } from '@hbc/versioned-record';
import type { IScoreGhostOverlayState } from '@hbc/score-benchmark';

export interface IScoreBenchmarkVersionedProjection {
  snapshot: IVersionMetadata;
  auditTrailIds: string[];
  replaySafe: boolean;
}

export const projectScoreBenchmarkVersionedSnapshot = (
  overlay: IScoreGhostOverlayState
): IScoreBenchmarkVersionedProjection => ({
  snapshot: overlay.version,
  auditTrailIds: overlay.filterGovernanceEvents.map((event) => `${event.eventType}:${event.recordedAt}`),
  replaySafe: true,
});
