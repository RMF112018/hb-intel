/**
 * @hbc/my-work-feed — Core Domain Model
 * SF29-T02 — Decisions L-01 through L-10
 *
 * Canonical field names follow the spec:
 * @see docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md §Interface Contract
 * @see docs/architecture/plans/shared-features/SF29-T02-TypeScript-Contracts.md
 */

// ─── Primitive Union Types ────────────────────────────────────────────────────

export type MyWorkItemClass =
  | 'owned-action'
  | 'inbound-handoff'
  | 'pending-approval'
  | 'attention-item'
  | 'queued-follow-up'
  | 'contextual-signal';

export type MyWorkPriority = 'now' | 'soon' | 'watch' | 'deferred';

export type MyWorkLane =
  | 'do-now'
  | 'waiting-blocked'
  | 'watch'
  /**
   * @provisional
   * Retained for compatibility with current `assignLane()` implementations that detect
   * delegated items via `delegatedTo`/`delegatedBy`. This member is NOT part of the
   * target-state four-lane model (P2-A2 §3.3 / P2-A3 §10.1). First-release surfaces
   * must not render `delegated-team` as a standing primary lane. Removal or replacement
   * is required before team-visibility surfaces ship (P2-A1 scope).
   */
  | 'delegated-team'
  | 'deferred';

export type MyWorkState =
  | 'new'
  | 'active'
  | 'blocked'
  | 'waiting'
  | 'deferred'
  | 'superseded'
  | 'completed';

export type MyWorkOwnerType = 'user' | 'role' | 'company' | 'system';

export type MyWorkSource =
  | 'bic-next-move'
  | 'workflow-handoff'
  | 'acknowledgment'
  | 'notification-intelligence'
  | 'session-state'
  | 'module';

export type MyWorkSyncStatus = 'live' | 'cached' | 'partial' | 'queued';

// ─── Sub-Interfaces ──────────────────────────────────────────────────────────

export interface IMyWorkOwner {
  type: MyWorkOwnerType;
  id: string;
  label: string;
}

export interface IMyWorkContext {
  moduleKey: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  recordId?: string;
  recordType?: string;
  workflowStepKey?: string;
  versionId?: string;
  href?: string;
}

export interface IMyWorkSourceMeta {
  source: MyWorkSource;
  sourceEventType?: string;
  sourceUrgency?: string;
  sourceItemId: string;
  sourceUpdatedAtIso: string;
  explanation?: string;
}

export interface IMyWorkPermissionState {
  canOpen: boolean;
  canAct: boolean;
  canDelegate?: boolean;
  canBulkAct?: boolean;
  cannotActReason?: string | null;
}

export interface IMyWorkLifecyclePreview {
  previousStepLabel: string | null;
  currentStepLabel: string | null;
  nextStepLabel: string | null;
  blockedDependencyLabel: string | null;
  impactedRecordLabel: string | null;
}

export interface IMyWorkRankingReason {
  primaryReason: string;
  contributingReasons: string[];
  score?: number;
}

export interface IMyWorkAttentionPolicy {
  batchGroupKey?: string | null;
  escalationAtIso?: string | null;
  suppressedDuplicateCount?: number;
  quietHoursDeferred?: boolean;
}

export interface IMyWorkHealthState {
  freshness: MyWorkSyncStatus;
  hiddenSupersededCount?: number;
  degradedSourceCount?: number;
  warningMessage?: string | null;
}

export interface IMyWorkActionDefinition {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  requiresConfirmation?: boolean;
  offlineCapable?: boolean;
}

export interface IMyWorkTimestampState {
  createdAtIso: string;
  updatedAtIso: string;
  markedReadAtIso?: string | null;
  markedDeferredAtIso?: string | null;
  deferredUntilIso?: string | null;
}

// ─── T02 Additional Sub-Interfaces ───────────────────────────────────────────

export interface IMyWorkDedupeMetadata {
  dedupeKey: string;
  mergedSourceMeta: IMyWorkSourceMeta[];
  mergeReason: string;
}

export interface IMyWorkSupersessionMetadata {
  supersededByWorkItemId: string;
  supersessionReason: string;
  originalRankingReason: IMyWorkRankingReason;
}

// ─── Primary Domain Model ────────────────────────────────────────────────────

export interface IMyWorkItem {
  workItemId: string;
  canonicalKey: string;
  dedupeKey: string;
  class: MyWorkItemClass;
  priority: MyWorkPriority;
  state: MyWorkState;
  lane: MyWorkLane;
  title: string;
  summary: string;
  expectedAction?: string;
  dueDateIso?: string | null;
  isOverdue: boolean;
  isUnread: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
  changeSummary?: string | null;
  whyThisMatters?: string | null;
  supersededByWorkItemId?: string | null;
  owner: IMyWorkOwner;
  previousOwner?: IMyWorkOwner | null;
  context: IMyWorkContext;
  sourceMeta: IMyWorkSourceMeta[];
  permissionState: IMyWorkPermissionState;
  lifecycle: IMyWorkLifecyclePreview;
  rankingReason: IMyWorkRankingReason;
  attentionPolicy?: IMyWorkAttentionPolicy;
  availableActions: IMyWorkActionDefinition[];
  offlineCapable: boolean;
  healthState?: IMyWorkHealthState;
  delegatedBy?: IMyWorkOwner | null;
  delegatedTo?: IMyWorkOwner | null;
  locationLabel?: string | null;
  userNote?: string | null;
  timestamps: IMyWorkTimestampState;
  dedupe?: IMyWorkDedupeMetadata;
  supersession?: IMyWorkSupersessionMetadata;
}
