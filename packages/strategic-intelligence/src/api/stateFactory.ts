import type { IVersionMetadata } from '@hbc/versioned-record';
import {
  createCommitmentRegisterItem,
  createHeritageSnapshot,
  createHandoffReviewParticipant,
  createLivingStrategicIntelligenceEntry,
} from '../model/index.js';
import type {
  IStrategicIntelligenceState,
  IStrategicIntelligenceTelemetryState,
} from '../types/index.js';

export interface StrategicIntelligenceRuntimeInput {
  scorecardId: string;
}

const DEFAULT_VERSION: IVersionMetadata = {
  snapshotId: 'strategic-state-v1',
  version: 1,
  createdAt: '2026-03-12T00:00:00.000Z',
  createdBy: {
    userId: 'strategic-intelligence-system',
    displayName: 'Strategic Intelligence System',
    role: 'system',
  },
  changeSummary: 'T03 strategic intelligence state scaffold',
  tag: 'draft',
};

const DEFAULT_TELEMETRY: IStrategicIntelligenceTelemetryState = {
  timeToHandoffContextReviewMs: null,
  intelligenceContributionLatencyMs: null,
  pctHeritagePanelsViewed: null,
  heritageReuseRate: null,
  strategicIntelligenceCes: null,
  handoffReviewCompletionLatency: null,
  acknowledgmentCompletionRate: null,
  commitmentFulfillmentRate: null,
  staleIntelligenceBacklog: null,
  conflictResolutionLatency: null,
  suggestionAcceptanceRate: null,
  suggestionExplainabilityEngagementRate: null,
  redactedProjectionAccessRate: null,
};

export const createStrategicIntelligenceState = (
  input: StrategicIntelligenceRuntimeInput
): IStrategicIntelligenceState => ({
  heritageSnapshot: createHeritageSnapshot({ scorecardId: input.scorecardId }),
  commitmentRegister: [createCommitmentRegisterItem()],
  livingEntries: [createLivingStrategicIntelligenceEntry()],
  handoffReview: {
    reviewId: 'handoff-review-default',
    scorecardId: input.scorecardId,
    startedAt: '2026-03-12T00:00:00.000Z',
    startedBy: 'strategic-intelligence-system',
    participants: [createHandoffReviewParticipant()],
    completionStatus: 'not-started',
    outstandingCommitmentIds: [],
    version: DEFAULT_VERSION,
  },
  approvalQueue: [],
  telemetry: DEFAULT_TELEMETRY,
  version: DEFAULT_VERSION,
  syncStatus: 'synced',
});
