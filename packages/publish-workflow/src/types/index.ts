/**
 * SF25-T02 — Publish Workflow TypeScript Contracts.
 *
 * Publish lifecycle, readiness/approval/supersession rules, receipt context
 * stamping, BIC steps, provenance, and telemetry.
 *
 * Governing: SF25-T02, SF25 Master Plan L-01 through L-06
 */

// ── Publish State ────────────────────────────────────────────────────────

export type PublishState =
  | 'draft'
  | 'ready-for-review'
  | 'approved-for-publish'
  | 'publishing'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'failed';

/** @deprecated Use `PublishState` instead. */
export type PublicationStatus =
  | 'draft'
  | 'ready-for-review'
  | 'in-review'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'failed';

// ── T01 Core Interfaces (retained) ──────────────────────────────────────

export interface IReadinessState {
  isReady: boolean;
  blockingReasons: string[];
  warningReasons: string[];
  checkedAtIso: string;
}

export interface IApprovalState {
  status: 'pending' | 'approved' | 'rejected' | 'not-required';
  approverUpn: string | null;
  approverName: string | null;
  decidedAtIso: string | null;
  reason: string | null;
}

export interface ISupersessionState {
  supersededByRecordId: string | null;
  supersededAtIso: string | null;
  reason: string | null;
}

export interface IRevocationState {
  revokedByUpn: string | null;
  revokedAtIso: string | null;
  reason: string | null;
}

export interface IPublicationReceipt {
  receiptId: string;
  publishedAtIso: string;
  artifactUrl: string | null;
  versionNumber: number;
  frozen: boolean;
}

export interface IReadinessRule {
  ruleId: string;
  label: string;
  evaluate: (record: IPublicationRecord) => { pass: boolean; message: string };
}

export interface IApprovalRule {
  ruleId: string;
  label: string;
  required: boolean;
  approverRole: string;
}

// ── T02 New Contracts ────────────────────────────────────────────────────

/** Publish target — where the artifact is distributed. */
export interface IPublishTarget {
  targetId: string;
  targetType: 'sharepoint' | 'email' | 'canvas-tile' | 'deep-link';
  label: string;
  recipientScope: string;
}

/** Publish approval rule — T02 refinement with deadline and escalation. */
export interface IPublishApprovalRule {
  ruleId: string;
  label: string;
  required: boolean;
  approverRole: string;
  deadlineHours: number | null;
  escalationUpn: string | null;
}

/** BIC ownership step for publish review/approval (L-02, T02). */
export interface IPublishBicStepConfig {
  stepId: string;
  stepLabel: string;
  blocking: boolean;
  ownerUpn: string;
  ownerName: string;
  ownerRole: string;
  expectedAction: string;
  dueDateIso: string | null;
}

/** Telemetry state for publish workflow KPIs (L-06, T02). */
export interface IPublishTelemetryState {
  publishCompletionLatency: number | null;
  approvalCycleTimeReduction: number | null;
  supersessionTraceabilityScore: number | null;
  publishGovernanceCes: number | null;
  formalIssueAdoptionRate: number | null;
}

/** Receipt context stamp — provenance for published artifacts (T02). */
export interface IPublishReceiptContextStamp {
  sourceRecordId: string;
  sourceVersionId: string | null;
  issueLabel: string | null;
  publishedByUserId: string;
  publishedAtIso: string;
  supersedesPublishId: string | null;
}

/** Publish request — top-level orchestration contract (T02). */
export interface IPublishRequest {
  publishRequestId: string;
  sourceModuleKey: string;
  sourceRecordId: string;
  sourceVersionId: string | null;
  artifactId: string | null;
  issueLabel: string | null;
  state: PublishState;
  requestedByUserId: string;
  targets: IPublishTarget[];
  readiness: IReadinessState;
  approval: IApprovalState;
  supersession: ISupersessionState;
  revocation: IRevocationState;
  receipt: IPublicationReceipt | null;
  contextStamp: IPublishReceiptContextStamp | null;
  approvalRules: IPublishApprovalRule[];
  bicSteps: IPublishBicStepConfig[];
  telemetry: IPublishTelemetryState;
  createdAtIso: string;
  updatedAtIso: string;
}

/** T01 compat alias. */
export interface IPublicationRecord {
  publicationId: string;
  moduleKey: string;
  recordId: string;
  projectId: string;
  status: PublicationStatus;
  readiness: IReadinessState;
  approval: IApprovalState;
  supersession: ISupersessionState;
  revocation: IRevocationState;
  receipt: IPublicationReceipt | null;
  createdAtIso: string;
  updatedAtIso: string;
  authorUpn: string;
}

// ── Constants ────────────────────────────────────────────────────────────

export const PUBLISH_STATES: readonly PublishState[] = [
  'draft', 'ready-for-review', 'approved-for-publish', 'publishing',
  'published', 'superseded', 'revoked', 'failed',
] as const;

export const PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'draft', 'ready-for-review', 'in-review', 'approved',
  'published', 'superseded', 'revoked', 'failed',
] as const;

// ── T02 Constants ────────────────────────────────────────────────────────

export const PUBLISH_WORKFLOW_SYNC_QUEUE_KEY = 'publish-workflow-sync-queue' as const;

export const PUBLISH_WORKFLOW_SYNC_STATUSES = ['Saved locally', 'Queued to sync'] as const;

export const PUBLISH_WORKFLOW_VISIBILITY_POLICY = 'panel-visible-all-modes' as const;
