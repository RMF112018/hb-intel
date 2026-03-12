import type { IVersionMetadata } from '@hbc/versioned-record';
import type {
  IHeritageSnapshot,
  IIntelligenceConflict,
  IStrategicIntelligenceEntry,
} from '../../types/index.js';

const clone = <T>(value: T): T => structuredClone(value);

export const appendVersion = (
  previous: IVersionMetadata,
  changeSummary: string,
  createdAt: string,
  createdBy: IVersionMetadata['createdBy'],
  tag: IVersionMetadata['tag'] = previous.tag
): IVersionMetadata => ({
  snapshotId: `${previous.snapshotId}-v${previous.version + 1}`,
  version: previous.version + 1,
  createdAt,
  createdBy,
  changeSummary,
  tag,
});

export const freezeHeritageSnapshotModel = (
  snapshot: IHeritageSnapshot,
  frozenAt: string,
  actorUserId: string
): IHeritageSnapshot => ({
  ...clone(snapshot),
  immutable: true,
  version: appendVersion(
    snapshot.version,
    `Heritage snapshot frozen by ${actorUserId}`,
    frozenAt,
    snapshot.version.createdBy,
    'handoff'
  ),
});

export const appendEntryVersionModel = (
  existingEntries: IStrategicIntelligenceEntry[],
  appendedEntry: IStrategicIntelligenceEntry,
  createdAt: string,
  actor: IVersionMetadata['createdBy']
): IStrategicIntelligenceEntry[] => {
  const latestVersion = existingEntries
    .filter((entry) => entry.entryId === appendedEntry.entryId)
    .reduce(
      (latest, entry) => (entry.version.version > latest.version ? entry.version : latest),
      appendedEntry.version
    );

  const normalizedEntry: IStrategicIntelligenceEntry = {
    ...clone(appendedEntry),
    version: appendVersion(
      latestVersion,
      `Living intelligence appended by ${actor.userId}`,
      createdAt,
      actor,
      appendedEntry.lifecycleState === 'approved' ? 'approved' : 'submitted'
    ),
  };

  return [...existingEntries, normalizedEntry];
};

export const applyConflictResolutionModel = (
  entry: IStrategicIntelligenceEntry,
  conflictId: string,
  resolutionNote: string,
  resolvedAt: string,
  resolvedBy: string,
  actor: IVersionMetadata['createdBy']
): IStrategicIntelligenceEntry => {
  const updatedConflicts: IIntelligenceConflict[] = entry.conflicts.map((conflict) =>
    conflict.conflictId === conflictId
      ? {
          ...conflict,
          resolutionStatus: 'resolved',
          resolutionNote,
          resolvedAt,
          resolvedBy,
        }
      : conflict
  );

  return {
    ...clone(entry),
    conflicts: updatedConflicts,
    version: appendVersion(
      entry.version,
      `Conflict ${conflictId} resolved by ${resolvedBy}`,
      resolvedAt,
      actor,
      'approved'
    ),
  };
};
