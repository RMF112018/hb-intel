import type {
  IStrategicIntelligenceApprovalQueueItem,
  IStrategicIntelligenceTelemetryState,
  StrategicIntelligenceSyncStatus,
} from '../types/index.js';

export type StrategicIntelligenceSyncBadge = 'Synced' | 'Saved locally' | 'Queued to sync';

export type StrategicIntelligenceSuggestionOutcome = 'accepted' | 'dismissed' | 'deferred';

export interface IStrategicIntelligenceTelemetryDelta {
  channel: keyof IStrategicIntelligenceTelemetryState;
  delta: number;
  recordedAt: string;
}

export interface IStrategicIntelligenceSuggestionOutcomeRecord {
  suggestionId: string;
  outcome: StrategicIntelligenceSuggestionOutcome;
  recordedAt: string;
}

const approvalQueueOverrideByScorecard = new Map<string, IStrategicIntelligenceApprovalQueueItem[]>();
const lastReplayAtByScorecard = new Map<string, string>();
const telemetryDeltasByScorecard = new Map<string, IStrategicIntelligenceTelemetryDelta[]>();
const suggestionOutcomesByScorecard = new Map<string, IStrategicIntelligenceSuggestionOutcomeRecord[]>();

export const toSyncBadge = (
  syncStatus: StrategicIntelligenceSyncStatus,
  queuedMutationsCount: number
): StrategicIntelligenceSyncBadge => {
  if (queuedMutationsCount > 0 || syncStatus === 'queued-to-sync') {
    return 'Queued to sync';
  }

  if (syncStatus === 'saved-locally') {
    return 'Saved locally';
  }

  return 'Synced';
};

export const getApprovalQueueOverride = (
  scorecardId: string
): IStrategicIntelligenceApprovalQueueItem[] | null => {
  const queue = approvalQueueOverrideByScorecard.get(scorecardId);
  return queue ? structuredClone(queue) : null;
};

export const setApprovalQueueOverride = (
  scorecardId: string,
  queue: IStrategicIntelligenceApprovalQueueItem[]
): void => {
  approvalQueueOverrideByScorecard.set(scorecardId, structuredClone(queue));
};

export const clearApprovalQueueOverride = (scorecardId: string): void => {
  approvalQueueOverrideByScorecard.delete(scorecardId);
};

export const getLastReplayAt = (scorecardId: string): string | null =>
  lastReplayAtByScorecard.get(scorecardId) ?? null;

export const setLastReplayAt = (scorecardId: string, replayedAtIso: string): void => {
  lastReplayAtByScorecard.set(scorecardId, replayedAtIso);
};

export const appendTelemetryDelta = (
  scorecardId: string,
  delta: IStrategicIntelligenceTelemetryDelta
): void => {
  const current = telemetryDeltasByScorecard.get(scorecardId) ?? [];
  telemetryDeltasByScorecard.set(scorecardId, [...current, structuredClone(delta)]);
};

export const getTelemetryDeltas = (
  scorecardId: string
): IStrategicIntelligenceTelemetryDelta[] =>
  [...(telemetryDeltasByScorecard.get(scorecardId) ?? [])].map((delta) => structuredClone(delta));

export const appendSuggestionOutcome = (
  scorecardId: string,
  outcome: IStrategicIntelligenceSuggestionOutcomeRecord
): void => {
  const current = suggestionOutcomesByScorecard.get(scorecardId) ?? [];
  suggestionOutcomesByScorecard.set(scorecardId, [...current, structuredClone(outcome)]);
};

export const getSuggestionOutcomes = (
  scorecardId: string
): IStrategicIntelligenceSuggestionOutcomeRecord[] =>
  [...(suggestionOutcomesByScorecard.get(scorecardId) ?? [])].map((item) => structuredClone(item));
