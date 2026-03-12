import type {
  IIntelligenceConflict,
  IStrategicIntelligenceEntry,
  IStrategicIntelligenceFreezeResult,
  IStrategicIntelligenceGovernanceEvent,
  IStrategicIntelligenceMutation,
  IStrategicIntelligenceReplayResult,
  IStrategicIntelligenceState,
} from '../types/index.js';
import { StrategicIntelligenceApi } from './StrategicIntelligenceApi.js';
import {
  appendEntryVersionModel,
  applyConflictResolutionModel,
  freezeHeritageSnapshotModel,
} from '../model/lifecycle/versioning.js';
import { consumeReplayResult, normalizeMutationQueue } from '../model/storage/queue.js';
import {
  buildIndexingPayload,
  buildSuggestionMatchFactors,
} from '../model/governance/indexing.js';

const clone = <T>(value: T): T => structuredClone(value);

export class StrategicIntelligenceLifecycleApi {
  constructor(private readonly api: StrategicIntelligenceApi = new StrategicIntelligenceApi()) {}

  getApi(): StrategicIntelligenceApi {
    return this.api;
  }

  freezeHeritageSnapshot(scorecardId: string, actorUserId: string): IStrategicIntelligenceFreezeResult {
    const state = this.api.getState(scorecardId);
    const frozenAt = new Date().toISOString();
    const frozenSnapshot = freezeHeritageSnapshotModel(state.heritageSnapshot, frozenAt, actorUserId);

    const nextState: IStrategicIntelligenceState = {
      ...state,
      heritageSnapshot: frozenSnapshot,
      syncStatus: 'saved-locally',
    };

    this.api.persistReviewUpdate(scorecardId, state.handoffReview ?? {
      reviewId: `${scorecardId}-review`,
      scorecardId,
      startedAt: frozenAt,
      startedBy: actorUserId,
      participants: [],
      completionStatus: 'in-progress',
      outstandingCommitmentIds: state.commitmentRegister.map((item) => item.commitmentId),
      version: state.version,
    });

    this.api.persistConflictUpdate(scorecardId, {
      conflictId: `${scorecardId}-freeze-marker`,
      type: 'supersession',
      relatedEntryIds: [],
      resolutionStatus: 'resolved',
      resolutionNote: 'Heritage snapshot frozen; immutable view established.',
      resolvedAt: frozenAt,
      resolvedBy: actorUserId,
    });

    return {
      scorecardId,
      frozenAt,
      snapshot: clone(nextState.heritageSnapshot),
    };
  }

  appendLivingIntelligenceEntryVersion(
    scorecardId: string,
    entry: IStrategicIntelligenceEntry
  ): IStrategicIntelligenceEntry[] {
    const state = this.api.getState(scorecardId);
    const appended = appendEntryVersionModel(
      state.livingEntries,
      entry,
      new Date().toISOString(),
      entry.version.createdBy
    );

    const newest = appended[appended.length - 1];
    const mutation: IStrategicIntelligenceMutation = {
      mutationId: `${scorecardId}-append-${Date.now()}`,
      scorecardId,
      mutationType: 'append-entry',
      payload: { entry: newest },
      queuedAt: new Date().toISOString(),
      replaySafe: true,
      localStatus: 'queued-to-sync',
      provenance: {
        recordedAt: new Date().toISOString(),
        actorUserId: newest.createdBy,
        actorRole: newest.version.createdBy.role,
        source: 'direct-write',
        provenanceClass: newest.trust.provenanceClass,
      },
    };

    this.api.queueLocalMutation(mutation);
    this.api.applyQueuedMutation(mutation);

    return this.api.getLivingEntries(scorecardId);
  }

  recomputeStaleStateFlags(scorecardId: string, reviewClockIso = new Date().toISOString()): IStrategicIntelligenceEntry[] {
    const state = this.api.getState(scorecardId);
    const updatedEntries = state.livingEntries.map((entry) => {
      const reviewBy = entry.trust.reviewBy;
      const shouldBeStale = reviewBy !== null && new Date(reviewBy).getTime() < new Date(reviewClockIso).getTime();

      if (shouldBeStale === entry.trust.isStale) {
        return entry;
      }

      const staleVersion = appendEntryVersionModel(
        state.livingEntries,
        {
          ...entry,
          trust: {
            ...entry.trust,
            isStale: shouldBeStale,
            staleReason: shouldBeStale ? 'review-date-expired' : undefined,
            lastValidatedAt: shouldBeStale ? entry.trust.lastValidatedAt : reviewClockIso,
          },
        },
        reviewClockIso,
        entry.version.createdBy
      );

      return staleVersion[staleVersion.length - 1];
    });

    for (const entry of updatedEntries) {
      const mutation: IStrategicIntelligenceMutation = {
        mutationId: `${scorecardId}-stale-${entry.entryId}-${Date.now()}`,
        scorecardId,
        mutationType: 'append-entry',
        payload: { entry },
        queuedAt: reviewClockIso,
        replaySafe: true,
        localStatus: 'saved-locally',
        provenance: {
          recordedAt: reviewClockIso,
          actorUserId: entry.version.createdBy.userId,
          actorRole: entry.version.createdBy.role,
          source: 'direct-write',
          provenanceClass: entry.trust.provenanceClass,
        },
      };

      this.api.queueLocalMutation(mutation);
      this.api.applyQueuedMutation(mutation);
    }

    return this.api.getLivingEntries(scorecardId);
  }

  applySupersessionOrContradictionResolution(
    scorecardId: string,
    conflictId: string,
    resolutionNote: string,
    resolvedBy: string
  ): { updatedEntries: IStrategicIntelligenceEntry[]; governanceEvent: IStrategicIntelligenceGovernanceEvent } {
    const state = this.api.getState(scorecardId);
    const resolvedAt = new Date().toISOString();

    const updatedEntries = state.livingEntries.map((entry) => {
      if (!entry.conflicts.some((conflict) => conflict.conflictId === conflictId)) {
        return entry;
      }

      return applyConflictResolutionModel(
        entry,
        conflictId,
        resolutionNote,
        resolvedAt,
        resolvedBy,
        entry.version.createdBy
      );
    });

    for (const entry of updatedEntries) {
      if (!entry.conflicts.some((conflict) => conflict.conflictId === conflictId)) {
        continue;
      }

      this.api.persistConflictUpdate(
        scorecardId,
        entry.conflicts.find((conflict) => conflict.conflictId === conflictId) as IIntelligenceConflict
      );
    }

    const governanceEvent: IStrategicIntelligenceGovernanceEvent = {
      eventId: `${scorecardId}-governance-${Date.now()}`,
      scorecardId,
      eventType: 'conflict-resolution-note',
      note: resolutionNote,
      immutable: true,
      createdAt: resolvedAt,
      createdBy: resolvedBy,
      relatedEntryIds: updatedEntries.map((entry) => entry.entryId),
      version: state.version,
    };

    this.api.appendGovernanceEvent(governanceEvent);

    return {
      updatedEntries: this.api.getLivingEntries(scorecardId),
      governanceEvent,
    };
  }

  replayQueuedMutations(scorecardId: string): IStrategicIntelligenceReplayResult {
    const queue = normalizeMutationQueue(this.api.getQueuedMutations(scorecardId));

    let conflictsCreated = 0;
    let governanceEventsAppended = 0;

    for (const mutation of queue) {
      this.api.applyQueuedMutation({
        ...mutation,
        provenance: {
          ...mutation.provenance,
          source: 'replay',
          recordedAt: new Date().toISOString(),
        },
      });

      if (mutation.mutationType === 'conflict-event') {
        conflictsCreated += 1;
      }

      if (mutation.mutationType === 'commitment-update' || mutation.mutationType === 'acknowledgment-update') {
        governanceEventsAppended += 1;
      }
    }

    this.api.clearQueuedMutations(queue.map((mutation) => mutation.mutationId));
    this.api.markSynced(scorecardId);

    return consumeReplayResult(
      queue.map((mutation) => mutation.mutationId),
      conflictsCreated,
      governanceEventsAppended,
      'synced'
    );
  }

  emitProvenanceSafeProjectionPayload(scorecardId: string) {
    const state = this.api.getState(scorecardId);
    const indexingPayload = buildIndexingPayload(scorecardId, state.livingEntries);

    return {
      indexingPayload,
      suggestionFactors: state.livingEntries.map((entry) => ({
        entryId: entry.entryId,
        factors: buildSuggestionMatchFactors(entry),
      })),
    };
  }
}
