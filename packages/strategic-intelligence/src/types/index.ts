import type { IVersionMetadata } from '@hbc/versioned-record';

export type ReliabilityTier = 'high' | 'moderate' | 'low' | 'review-required';

export type ProvenanceClass =
  | 'firsthand-observation'
  | 'meeting-summary'
  | 'project-outcome-learning'
  | 'inferred-observation'
  | 'ai-assisted-draft';

export type IntelligenceLifecycleState =
  | 'submitted'
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'revision-requested'
  | 'superseded';

export type SensitivityClass =
  | 'public-internal'
  | 'restricted-role'
  | 'restricted-project'
  | 'confidential';

export interface IHeritageSnapshot {
  snapshotId: string;
  scorecardId: string;
  scorecardVersion: number;
  capturedAt: string;
  capturedBy: string;
  decision: 'GO' | 'NO-GO' | 'WAIT';
  decisionRationale: string;
  clientPriorities: string[];
  competitiveContext: string;
  relationshipIntelligence: string;
  riskAssumptions: string[];
  pursuitStrategy: string;
  immutable: true;
  version: IVersionMetadata;
}

export interface ICommitmentRegisterItem {
  commitmentId: string;
  description: string;
  source: string;
  responsibleRole: string;
  fulfillmentStatus: 'open' | 'in-progress' | 'fulfilled' | 'not-applicable';
  dueBy?: string;
  reviewedAt?: string;
  bicRecordId?: string;
}

export interface IIntelligenceTrustMetadata {
  reliabilityTier: ReliabilityTier;
  provenanceClass: ProvenanceClass;
  lastValidatedAt: string | null;
  reviewBy: string | null;
  isStale: boolean;
  staleReason?: string;
  aiTrustDowngraded: boolean;
}

export interface IIntelligenceConflict {
  conflictId: string;
  type: 'contradiction' | 'supersession';
  relatedEntryIds: string[];
  resolutionStatus: 'open' | 'resolved';
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ISuggestedIntelligenceMatch {
  suggestionId: string;
  entryId: string;
  matchScore: number;
  matchedDimensions: string[];
  reason: string;
  reuseHistoryCount: number;
}

export interface IStrategicIntelligenceEntry {
  entryId: string;
  type: string;
  title: string;
  body: string;
  metadata: {
    client?: string;
    ownerOrganization?: string;
    projectType?: string;
    sector?: string;
    deliveryMethod?: string;
    geography?: string;
    competitorReferences?: string[];
    lifecyclePhase?: string;
    riskCategory?: string;
  };
  trust: IIntelligenceTrustMetadata;
  lifecycleState: IntelligenceLifecycleState;
  sensitivity: SensitivityClass;
  conflicts: IIntelligenceConflict[];
  suggestedMatches: ISuggestedIntelligenceMatch[];
  commitmentIds: string[];
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  supersededByEntryId?: string;
  version: IVersionMetadata;
}

export interface IHandoffReviewParticipant {
  participantId: string;
  displayName: string;
  role: string;
  acknowledgedAt: string | null;
  acknowledgmentNote?: string;
}

export interface IHandoffReviewState {
  reviewId: string;
  scorecardId: string;
  startedAt: string;
  startedBy: string;
  participants: IHandoffReviewParticipant[];
  completionStatus: 'not-started' | 'in-progress' | 'completed';
  outstandingCommitmentIds: string[];
  completionNotes?: string;
  version: IVersionMetadata;
}

export interface IRedactedProjection {
  entryId: string;
  title: string;
  summary: string;
  sensitivity: SensitivityClass;
  redactionReason?: string;
  trust: Pick<IIntelligenceTrustMetadata, 'reliabilityTier' | 'isStale' | 'aiTrustDowngraded'>;
}

export interface IStrategicIntelligenceApprovalQueueItem {
  queueItemId: string;
  entryId: string;
  submittedBy: string;
  submittedAt: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'revision-requested';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface IStrategicIntelligenceTelemetryState {
  timeToHandoffContextReviewMs: number | null;
  intelligenceContributionLatencyMs: number | null;
  pctHeritagePanelsViewed: number | null;
  heritageReuseRate: number | null;
  strategicIntelligenceCes: number | null;
  handoffReviewCompletionLatency: number | null;
  acknowledgmentCompletionRate: number | null;
  commitmentFulfillmentRate: number | null;
  staleIntelligenceBacklog: number | null;
  conflictResolutionLatency: number | null;
  suggestionAcceptanceRate: number | null;
  suggestionExplainabilityEngagementRate: number | null;
  redactedProjectionAccessRate: number | null;
}

export interface IStrategicIntelligenceState {
  heritageSnapshot: IHeritageSnapshot;
  commitmentRegister: ICommitmentRegisterItem[];
  livingEntries: IStrategicIntelligenceEntry[];
  handoffReview: IHandoffReviewState | null;
  approvalQueue: IStrategicIntelligenceApprovalQueueItem[];
  telemetry: IStrategicIntelligenceTelemetryState;
  version: IVersionMetadata;
  syncStatus: 'synced' | 'saved-locally' | 'queued-to-sync';
}

// Adapter/default-profile contract used by consuming modules.
export interface StrategicIntelligenceProfile {
  profileId: string;
  reliabilityDefaults: {
    staleThresholdDays: number;
    reviewWindowDays: number;
  };
  sensitivityDefaults: {
    defaultLevel: SensitivityClass;
    redactRestrictedByDefault: boolean;
  };
}
