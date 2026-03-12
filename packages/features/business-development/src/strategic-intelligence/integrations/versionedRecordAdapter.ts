import type { IVersionMetadata } from '@hbc/versioned-record';
import type { IStrategicIntelligenceState } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceVersionedProjection {
  snapshot: IVersionMetadata;
  heritageSnapshotVersion: IVersionMetadata;
  livingEntryVersions: IVersionMetadata[];
  replaySafe: boolean;
}

export const projectStrategicIntelligenceVersionedSnapshot = (
  state: IStrategicIntelligenceState
): IStrategicIntelligenceVersionedProjection => ({
  snapshot: state.version,
  heritageSnapshotVersion: state.heritageSnapshot.version,
  livingEntryVersions: state.livingEntries.map((entry) => entry.version),
  replaySafe: true,
});
