export type AutopsyOutcome = 'won' | 'lost' | 'no-bid';

export type AutopsyStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'archived'
  | 'overdue';

export type ConfidenceTier = 'high' | 'moderate' | 'low' | 'unreliable';

export type AutopsyEvidenceType =
  | 'interview-note'
  | 'cost-artifact'
  | 'schedule-artifact'
  | 'field-observation'
  | 'client-signal'
  | 'other';

export type EvidenceReliabilityHint = 'primary' | 'secondary' | 'inferred';

export type EvidenceSensitivity =
  | 'internal'
  | 'restricted-role'
  | 'restricted-project'
  | 'confidential';

export type RootCauseDomain =
  | 'strategy'
  | 'pricing'
  | 'scope'
  | 'execution'
  | 'coordination'
  | 'market'
  | 'client';

export type SensitivityVisibility =
  | 'role-scoped'
  | 'project-scoped'
  | 'cross-module-redacted'
  | 'confidential';

export type ReviewStage = 'author-review' | 'cross-functional-review' | 'approver-review';

export type ReviewDecisionOutcome = 'approved' | 'changes-requested' | 'rejected';

export type DisagreementResolutionStatus = 'open' | 'resolved' | 'escalated';

export type AutopsyQueueStatus = 'synced' | 'saved-locally' | 'queued-to-sync';

export interface IAutopsyEvidence {
  evidenceId: string;
  type: AutopsyEvidenceType;
  sourceRef: string;
  capturedBy: string;
  capturedAt: string;
  reliabilityHint?: EvidenceReliabilityHint;
  sensitivity: EvidenceSensitivity;
}

export interface IAutopsyConfidence {
  tier: ConfidenceTier;
  score: number;
  reasons: string[];
  evidenceCoverage: number;
}

export interface IRootCauseTag {
  tagId: string;
  domain: RootCauseDomain;
  label: string;
  normalizedCode: string;
}

export interface ISensitivityPolicy {
  visibility: SensitivityVisibility;
  redactionRequired: boolean;
}

export interface IReviewDecision {
  stage: ReviewStage;
  decision: ReviewDecisionOutcome;
  reviewer: string;
  decidedAt: string;
  notes?: string;
}

export interface IDisagreementRecord {
  disagreementId: string;
  criterion: string;
  participants: string[];
  summary: string;
  escalationRequired: boolean;
  resolutionStatus: DisagreementResolutionStatus;
}

export interface IOverrideGovernance {
  overrideReason: string;
  overriddenBy: string;
  overriddenAt: string;
  approvalRequired: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface IPublicationGate {
  publishable: boolean;
  blockers: string[];
  minimumConfidenceTier: ConfidenceTier;
  requiredEvidenceCount: number;
}

export interface ISupersessionLink {
  supersedesAutopsyId?: string;
  supersededByAutopsyId?: string;
  reason?: string;
}

export interface IAutopsyTelemetryState {
  autopsyCompletionLatency: number | null;
  repeatErrorReductionRate: number | null;
  intelligenceSeedingConversionRate: number | null;
  benchmarkAccuracyLift: number | null;
  corroborationRate: number | null;
  staleIntelligenceRate: number | null;
  revalidationLatency: number | null;
  reinsertionAdoptionRate: number | null;
  autopsyCes: number | null;
}

export interface IPostBidAutopsy {
  autopsyId: string;
  pursuitId: string;
  scorecardId: string;
  outcome: AutopsyOutcome;
  status: AutopsyStatus;
  confidence: IAutopsyConfidence;
  evidence: IAutopsyEvidence[];
  rootCauseTags: IRootCauseTag[];
  sensitivity: ISensitivityPolicy;
  reviewDecisions: IReviewDecision[];
  disagreements: IDisagreementRecord[];
  publicationGate: IPublicationGate;
  supersession: ISupersessionLink;
  overrideGovernance: IOverrideGovernance | null;
  telemetry: IAutopsyTelemetryState;
}

export interface IAutopsyCommitMetadata {
  committedAt: string | null;
  committedBy: string | null;
  source: 'offline-queue' | 'direct-write' | 'replay' | 'unknown';
}

export interface IAutopsyCompletenessState {
  evidenceCount: number;
  requiredEvidenceCount: number;
  evidenceComplete: boolean;
  confidenceTier: ConfidenceTier;
  confidenceScore: number;
  confidenceComplete: boolean;
}

export interface IAutopsyPublicationBlockerSummary {
  publishable: boolean;
  blockers: string[];
  minimumConfidenceTier: ConfidenceTier;
}

export interface IAutopsyQueueState {
  status: AutopsyQueueStatus;
  pendingMutationCount: number;
  lastSyncedAt: string | null;
  syncQueueKey: string;
}

export interface IUsePostBidAutopsyInput {
  autopsyId: string;
}

export interface IUsePostBidAutopsyResult {
  state: IPostBidAutopsy | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
  completeness: IAutopsyCompletenessState;
  publicationBlockers: IAutopsyPublicationBlockerSummary;
}

export interface IUseAutopsyReviewGovernanceInput {
  autopsyId: string;
}

export interface IAutopsyReviewGovernanceState {
  reviewDecisions: IReviewDecision[];
  disagreements: IDisagreementRecord[];
  overrideGovernance: IOverrideGovernance | null;
  sensitivity: ISensitivityPolicy;
}

export interface IUseAutopsyReviewGovernanceResult {
  state: IAutopsyReviewGovernanceState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
  completeness: IAutopsyCompletenessState;
  publicationBlockers: IAutopsyPublicationBlockerSummary;
}

export interface IUseAutopsyPublicationGateInput {
  autopsyId: string;
}

export interface IAutopsyPublicationGateState {
  publicationGate: IPublicationGate;
  sensitivity: ISensitivityPolicy;
  reviewDecisions: IReviewDecision[];
}

export interface IUseAutopsyPublicationGateResult {
  state: IAutopsyPublicationGateState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
  completeness: IAutopsyCompletenessState;
  publicationBlockers: IAutopsyPublicationBlockerSummary;
}

export interface IUseAutopsySyncQueueInput {
  autopsyId: string;
}

export interface IAutopsySyncQueueState {
  autopsyId: string;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
}

export interface IUseAutopsySyncQueueResult {
  state: IAutopsySyncQueueState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
  completeness: IAutopsyCompletenessState;
  publicationBlockers: IAutopsyPublicationBlockerSummary;
}

export interface IPostBidAutopsyApiSurface {
  readonly surfaceId: string;
  readonly ownership: 'primitive';
  readonly responsibilities: readonly string[];
}

export interface IPostBidAutopsyHookSurface {
  readonly surfaceId: string;
  readonly ownership: 'primitive';
  readonly queryKey: readonly string[];
}

export interface IPostBidAutopsyComponentContract {
  readonly componentId: string;
  readonly ownership: 'primitive';
  readonly role: 'headless' | 'contract';
}
