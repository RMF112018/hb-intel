import type {
  ICommitmentRegisterItem,
  IHandoffReviewState,
  IIntelligenceConflict,
  IRedactedProjection,
  IStrategicIntelligenceEntry,
  IStrategicIntelligenceGovernanceEvent,
  IStrategicIntelligenceMutation,
  IStrategicIntelligenceState,
  StrategicIntelligenceSyncStatus,
} from '../types/index.js';
import {
  createStrategicIntelligenceState,
  type StrategicIntelligenceRuntimeInput,
} from './stateFactory.js';
import { buildIndexingPayload, toRedactedProjection } from '../model/governance/indexing.js';
import { queueMutation } from '../model/storage/queue.js';

const clone = <T>(value: T): T => structuredClone(value);

const eventVersion = (state: IStrategicIntelligenceState): IStrategicIntelligenceGovernanceEvent['version'] => ({
  ...state.version,
  snapshotId: `${state.version.snapshotId}-event-${state.version.version + 1}`,
  version: state.version.version + 1,
  createdAt: new Date().toISOString(),
  changeSummary: 'Strategic intelligence governance event appended',
  tag: 'submitted',
});

export class StrategicIntelligenceApi {
  private readonly stateByScorecardId = new Map<string, IStrategicIntelligenceState>();
  private mutationQueue: IStrategicIntelligenceMutation[] = [];
  private readonly governanceEventsByScorecardId = new Map<string, IStrategicIntelligenceGovernanceEvent[]>();

  constructor(seedState?: IStrategicIntelligenceState[]) {
    for (const item of seedState ?? []) {
      this.stateByScorecardId.set(item.heritageSnapshot.scorecardId, clone(item));
    }
  }

  private ensureState(input: StrategicIntelligenceRuntimeInput): IStrategicIntelligenceState {
    const existing = this.stateByScorecardId.get(input.scorecardId);
    if (existing) {
      return existing;
    }

    const created = createStrategicIntelligenceState(input);
    this.stateByScorecardId.set(input.scorecardId, created);
    return created;
  }

  private setSyncStatus(scorecardId: string, syncStatus: StrategicIntelligenceSyncStatus): void {
    const state = this.ensureState({ scorecardId });
    state.syncStatus = syncStatus;
    this.stateByScorecardId.set(scorecardId, state);
  }

  private appendGovernanceEventInternal(event: IStrategicIntelligenceGovernanceEvent): void {
    const existing = this.governanceEventsByScorecardId.get(event.scorecardId) ?? [];
    this.governanceEventsByScorecardId.set(event.scorecardId, [...existing, clone(event)]);
  }

  getState(scorecardId: string): IStrategicIntelligenceState {
    return clone(this.ensureState({ scorecardId }));
  }

  getHeritageSnapshot(scorecardId: string): IStrategicIntelligenceState['heritageSnapshot'] {
    return clone(this.ensureState({ scorecardId }).heritageSnapshot);
  }

  getLivingEntries(scorecardId: string): IStrategicIntelligenceEntry[] {
    return clone(this.ensureState({ scorecardId }).livingEntries);
  }

  getCommitmentRegister(scorecardId: string): ICommitmentRegisterItem[] {
    return clone(this.ensureState({ scorecardId }).commitmentRegister);
  }

  getHandoffReview(scorecardId: string): IHandoffReviewState | null {
    return clone(this.ensureState({ scorecardId }).handoffReview);
  }

  getApprovalQueue(scorecardId: string): IStrategicIntelligenceState['approvalQueue'] {
    return clone(this.ensureState({ scorecardId }).approvalQueue);
  }

  getRedactedProjections(scorecardId: string): IRedactedProjection[] {
    const state = this.ensureState({ scorecardId });
    const payload = buildIndexingPayload(scorecardId, state.livingEntries);
    return clone(payload.redactedProjections);
  }

  getGovernanceEvents(scorecardId: string): IStrategicIntelligenceGovernanceEvent[] {
    return clone(this.governanceEventsByScorecardId.get(scorecardId) ?? []);
  }

  getQueuedMutations(scorecardId?: string): IStrategicIntelligenceMutation[] {
    if (!scorecardId) {
      return clone(this.mutationQueue);
    }

    return clone(this.mutationQueue.filter((mutation) => mutation.scorecardId === scorecardId));
  }

  queueLocalMutation(mutation: IStrategicIntelligenceMutation): { queueKey: string; queuedCount: number } {
    const queued = queueMutation(this.mutationQueue, mutation);
    this.mutationQueue = queued.queue;
    this.setSyncStatus(mutation.scorecardId, mutation.localStatus);
    return {
      queueKey: queued.queueKey,
      queuedCount: queued.queuedCount,
    };
  }

  appendGovernanceEvent(event: IStrategicIntelligenceGovernanceEvent): { totalEvents: number } {
    this.appendGovernanceEventInternal(event);
    this.setSyncStatus(event.scorecardId, 'saved-locally');
    return {
      totalEvents: (this.governanceEventsByScorecardId.get(event.scorecardId) ?? []).length,
    };
  }

  persistAcknowledgment(
    scorecardId: string,
    participantId: string,
    acknowledgedAt: string | null,
    acknowledgmentNote?: string
  ): IHandoffReviewState | null {
    const state = this.ensureState({ scorecardId });
    if (!state.handoffReview) {
      return null;
    }

    state.handoffReview = {
      ...state.handoffReview,
      participants: state.handoffReview.participants.map((participant) =>
        participant.participantId === participantId
          ? {
              ...participant,
              acknowledgedAt,
              acknowledgmentNote,
            }
          : participant
      ),
    };

    this.setSyncStatus(scorecardId, 'saved-locally');

    const event: IStrategicIntelligenceGovernanceEvent = {
      eventId: `${scorecardId}-ack-${Date.now()}`,
      scorecardId,
      eventType: 'acknowledgment-recorded',
      note: `Acknowledgment persisted for participant ${participantId}`,
      immutable: true,
      createdAt: new Date().toISOString(),
      createdBy: participantId,
      relatedEntryIds: [],
      version: eventVersion(state),
    };

    this.appendGovernanceEventInternal(event);
    return clone(state.handoffReview);
  }

  persistCommitmentUpdate(scorecardId: string, commitment: ICommitmentRegisterItem): ICommitmentRegisterItem[] {
    const state = this.ensureState({ scorecardId });
    const existing = state.commitmentRegister.find(
      (item) => item.commitmentId === commitment.commitmentId
    );

    if (existing) {
      state.commitmentRegister = state.commitmentRegister.map((item) =>
        item.commitmentId === commitment.commitmentId ? commitment : item
      );
    } else {
      state.commitmentRegister = [...state.commitmentRegister, commitment];
    }

    this.setSyncStatus(scorecardId, 'saved-locally');

    const event: IStrategicIntelligenceGovernanceEvent = {
      eventId: `${scorecardId}-commitment-${Date.now()}`,
      scorecardId,
      eventType: 'commitment-updated',
      note: `Commitment ${commitment.commitmentId} persisted`,
      immutable: true,
      createdAt: new Date().toISOString(),
      createdBy: commitment.responsibleRole,
      relatedEntryIds: [],
      version: eventVersion(state),
    };

    this.appendGovernanceEventInternal(event);
    return clone(state.commitmentRegister);
  }

  persistConflictUpdate(scorecardId: string, conflict: IIntelligenceConflict): IStrategicIntelligenceEntry[] {
    const state = this.ensureState({ scorecardId });

    state.livingEntries = state.livingEntries.map((entry) => {
      if (!conflict.relatedEntryIds.includes(entry.entryId)) {
        return entry;
      }

      const existingConflict = entry.conflicts.find((item) => item.conflictId === conflict.conflictId);
      if (existingConflict) {
        return {
          ...entry,
          conflicts: entry.conflicts.map((item) =>
            item.conflictId === conflict.conflictId ? conflict : item
          ),
        };
      }

      return {
        ...entry,
        conflicts: [...entry.conflicts, conflict],
      };
    });

    this.setSyncStatus(scorecardId, 'saved-locally');
    return clone(state.livingEntries);
  }

  persistReviewUpdate(scorecardId: string, handoffReview: IHandoffReviewState): IHandoffReviewState {
    const state = this.ensureState({ scorecardId });
    state.handoffReview = clone(handoffReview);
    this.setSyncStatus(scorecardId, 'saved-locally');
    return clone(handoffReview);
  }

  applyQueuedMutation(mutation: IStrategicIntelligenceMutation): void {
    const state = this.ensureState({ scorecardId: mutation.scorecardId });
    const payload = mutation.payload;

    if (mutation.mutationType === 'append-entry' && payload.entry) {
      state.livingEntries = [...state.livingEntries, clone(payload.entry as IStrategicIntelligenceEntry)];
      return;
    }

    if (mutation.mutationType === 'commitment-update' && payload.commitment) {
      this.persistCommitmentUpdate(mutation.scorecardId, payload.commitment as ICommitmentRegisterItem);
      return;
    }

    if (mutation.mutationType === 'acknowledgment-update' && payload.participantId) {
      this.persistAcknowledgment(
        mutation.scorecardId,
        String(payload.participantId),
        typeof payload.acknowledgedAt === 'string' || payload.acknowledgedAt === null
          ? (payload.acknowledgedAt as string | null)
          : null,
        typeof payload.acknowledgmentNote === 'string' ? payload.acknowledgmentNote : undefined
      );
      return;
    }

    if (mutation.mutationType === 'conflict-event' && payload.conflict) {
      this.persistConflictUpdate(mutation.scorecardId, payload.conflict as IIntelligenceConflict);
      return;
    }

    if (mutation.mutationType === 'handoff-review-update' && payload.handoffReview) {
      this.persistReviewUpdate(mutation.scorecardId, payload.handoffReview as IHandoffReviewState);
      return;
    }
  }

  clearQueuedMutations(replayedMutationIds: string[]): void {
    const replayed = new Set(replayedMutationIds);
    this.mutationQueue = this.mutationQueue.filter((mutation) => !replayed.has(mutation.mutationId));
  }

  markSynced(scorecardId: string): void {
    this.setSyncStatus(scorecardId, 'synced');
  }

  getIndexingPayload(scorecardId: string) {
    const state = this.ensureState({ scorecardId });
    return buildIndexingPayload(scorecardId, state.livingEntries);
  }

  redactedProjectionForEntry(entry: IStrategicIntelligenceEntry): IRedactedProjection {
    return toRedactedProjection(entry);
  }
}
