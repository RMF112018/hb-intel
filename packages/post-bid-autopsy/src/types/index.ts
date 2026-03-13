export interface IBicOwner {
  userId: string;
  displayName: string;
  role: string;
  groupContext?: string;
}

export type AutopsyVersionTag =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'handoff'
  | 'superseded';

export interface IVersionMetadata {
  snapshotId: string;
  version: number;
  createdAt: string;
  createdBy: IBicOwner;
  changeSummary: string;
  tag: AutopsyVersionTag;
  storageRef?: string;
}

export interface IVersionSnapshot<T> extends IVersionMetadata {
  snapshot: T;
}

export type StrategicIntelligenceSensitivity =
  | 'public-internal'
  | 'restricted-role'
  | 'restricted-project'
  | 'confidential';

export interface IAutopsyRecalibrationSignal {
  signalId: string;
  criterionId?: string;
  predictiveDrift: number;
  triggeredBy: 'sf22-outcome' | 'scheduled-monitor' | 'admin-request';
  correlationKeys: string[];
  triggeredAt: string;
}

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

export type AutopsyTerminalPursuitStatus = 'Won' | 'Lost' | 'No-Bid';

export type AutopsyTransitionFailureReason =
  | 'autopsy-not-found'
  | 'invalid-transition'
  | 'open-disagreements'
  | 'publication-gate-failed'
  | 'override-approval-required'
  | 'override-metadata-required'
  | 'sensitivity-policy-blocked';

export type AutopsyStorageMutationType =
  | 'trigger-create'
  | 'save-draft'
  | 'transition'
  | 'mark-overdue'
  | 'revalidate';

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

export interface IAutopsyAssignmentState {
  primaryAuthor: IBicOwner;
  coAuthors: IBicOwner[];
  chiefEstimator: IBicOwner;
}

export interface IAutopsySectionTemplate {
  sectionKey: string;
  title: string;
  owner: IBicOwner;
  nextOwner?: IBicOwner | null;
  blockedReason?: string | null;
}

export interface IAutopsySectionBicRecord {
  bicRecordId: string;
  autopsyId: string;
  sectionKey: string;
  title: string;
  currentOwner: IBicOwner;
  nextOwner: IBicOwner | null;
  escalationOwner: IBicOwner;
  expectedAction: string;
  dueDate: string;
  blockedReason: string | null;
  createdAt: string;
}

export interface IAutopsySlaState {
  startedAt: string;
  dueAt: string;
  businessDays: number;
}

export interface IAutopsyLifecycleAuditEntry {
  auditId: string;
  autopsyId: string;
  fromStatus: AutopsyStatus | null;
  toStatus: AutopsyStatus;
  occurredAt: string;
  actor: IBicOwner;
  reason: string;
  changeSummary: string;
}

export interface IAutopsyEscalationEvent {
  escalationId: string;
  autopsyId: string;
  eventType: 'overdue' | 'disagreement-deadlock';
  target: IBicOwner;
  createdAt: string;
  reason: string;
  sectionKeys: string[];
}

export interface IAutopsyNotificationPayload {
  notificationId: string;
  autopsyId: string;
  recipientUserId: string;
  type: 'autopsy-created' | 'autopsy-overdue' | 'disagreement-escalated' | 'revalidation-required';
  createdAt: string;
  title: string;
  message: string;
}

export interface IAutopsyRecordSnapshot {
  autopsy: IPostBidAutopsy;
  assignments: IAutopsyAssignmentState;
  sectionBicRecords: IAutopsySectionBicRecord[];
  sla: IAutopsySlaState;
  auditTrail: IAutopsyLifecycleAuditEntry[];
  escalationEvents: IAutopsyEscalationEvent[];
  notifications: IAutopsyNotificationPayload[];
  syncStatus: AutopsyQueueStatus;
}

export interface IAutopsyVersionEnvelope {
  recordType: 'post-bid-autopsy';
  recordId: string;
  currentVersion: IVersionMetadata;
  versions: IVersionMetadata[];
  snapshots: IVersionSnapshot<IAutopsyRecordSnapshot>[];
}

export interface IAutopsyTriggerInput {
  pursuitId: string;
  scorecardId: string;
  status: AutopsyTerminalPursuitStatus;
  triggeredAt: string;
  triggeredBy: IBicOwner;
  primaryAuthor: IBicOwner;
  coAuthors?: IBicOwner[];
  chiefEstimator: IBicOwner;
  sectionTemplates: IAutopsySectionTemplate[];
}

export interface IAutopsyTriggerResult {
  created: boolean;
  autopsyId: string;
  record: IAutopsyRecordSnapshot;
  version: IAutopsyVersionEnvelope;
  notifications: IAutopsyNotificationPayload[];
}

export interface IAutopsyTransitionCommand {
  autopsyId: string;
  toStatus: AutopsyStatus;
  actor: IBicOwner;
  occurredAt: string;
  reason: string;
  changeSummary?: string;
  relatedAutopsyId?: string;
  overrideGovernance?: IOverrideGovernance | null;
}

export interface IAutopsyTransitionSuccess {
  ok: true;
  record: IAutopsyRecordSnapshot;
  version: IAutopsyVersionEnvelope;
}

export interface IAutopsyTransitionFailure {
  ok: false;
  reason: AutopsyTransitionFailureReason;
  message: string;
}

export type IAutopsyTransitionResult = IAutopsyTransitionSuccess | IAutopsyTransitionFailure;

export interface IAutopsyStorageMutation {
  mutationId: string;
  mutationType: AutopsyStorageMutationType;
  autopsyId: string;
  sequence: number;
  queuedAt: string;
  replaySafe: boolean;
  localStatus: Extract<AutopsyQueueStatus, 'saved-locally' | 'queued-to-sync'>;
  idempotencyKey: string;
  baseVersion: number;
  payload: {
    snapshot: IAutopsyRecordSnapshot;
    actor: IBicOwner;
  };
}

export interface IAutopsyStorageReceipt {
  record: IAutopsyRecordSnapshot;
  version: IAutopsyVersionEnvelope;
  queueStatus: IAutopsyQueueState;
  commitMetadata: IAutopsyCommitMetadata;
}

export interface IAutopsyReplayResult {
  replayedMutationIds: string[];
  conflictsCreated: number;
  resultingSyncStatus: AutopsyQueueStatus;
  invalidatedQueryKeys: ReadonlyArray<readonly string[]>;
}

export interface IAutopsyStalenessEvaluation {
  autopsyId: string;
  isStale: boolean;
  requiresRevalidation: boolean;
  publishedVersion: number | null;
  evaluatedAt: string;
  reason: string | null;
}

export interface IAutopsyBenchmarkPublishProjection {
  benchmarkSignalId: string;
  recalibrationSignal: IAutopsyRecalibrationSignal;
  affectedCriterionIds: string[];
}

export interface IAutopsyStrategicIntelligenceDraft {
  autopsyId: string;
  scorecardId: string;
  title: string;
  body: string;
  sensitivity: StrategicIntelligenceSensitivity;
  redacted: boolean;
  rootCauseCodes: string[];
  sourceEvidenceIds: string[];
}

export interface IAutopsyPublishResult {
  publishable: boolean;
  benchmarkProjection: IAutopsyBenchmarkPublishProjection | null;
  intelligenceDraft: IAutopsyStrategicIntelligenceDraft | null;
  redactedDraft: IAutopsyStrategicIntelligenceDraft | null;
}

export interface IAutopsyQueryInvalidationResult {
  invalidatedQueryKeys: ReadonlyArray<readonly string[]>;
}

export interface IAutopsyVersionMutationResult {
  record: IAutopsyRecordSnapshot;
  version: IAutopsyVersionEnvelope;
  tag: AutopsyVersionTag;
}
