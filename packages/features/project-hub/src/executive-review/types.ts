/**
 * Stage 8.4 executive-review TypeScript contracts.
 * Push-to-team action, work item, closure loop, provenance.
 */

import type {
  ClosureLoopState,
  PushActivityEvent,
  PushOriginRole,
  PushPayloadMode,
  PushPriority,
  PushVisibility,
  PushWorkItemStatus,
} from './enums.js';

export interface IPushToTeamAction {
  readonly pushActionId: string;
  readonly projectId: string;
  readonly pusherId: string;
  readonly originAnnotationId: string | null;
  readonly originReviewRunId: string | null;
  readonly pushTimestamp: string;
  readonly payloadMode: PushPayloadMode;
  readonly priority: PushPriority;
  readonly curatedSummary: string;
  readonly fullContextIncluded: boolean;
  readonly assigneeUserId: string;
  readonly assigneeRole: string;
  readonly visibility: PushVisibility;
}

export interface IPushWorkItem {
  readonly workItemId: string;
  readonly pushActionId: string;
  readonly projectId: string;
  readonly workItemClass: 'queued-follow-up';
  readonly workItemSource: 'module';
  readonly originatingModule: 'executive-review';
  readonly status: PushWorkItemStatus;
  readonly assignedToUserId: string;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
}

export interface IClosureLoopRecord {
  readonly closureLoopId: string;
  readonly pushWorkItemId: string;
  readonly originAnnotationId: string | null;
  readonly state: ClosureLoopState;
  readonly teamRespondedAt: string | null;
  readonly teamRespondedByUserId: string | null;
  readonly closureRequestedAt: string | null;
  readonly perConfirmedAt: string | null;
  readonly perConfirmedByUserId: string | null;
  readonly autoCloseBlocked: boolean;
}

export interface IPushActivitySpineEvent {
  readonly eventId: string;
  readonly pushWorkItemId: string;
  readonly eventType: PushActivityEvent;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly metadata: string;
}

export interface IPushProvenanceContract {
  readonly originRole: PushOriginRole;
  readonly originAnnotationId: string | null;
  readonly originReviewRunId: string | null;
  readonly pushTimestamp: string;
  readonly isSeparateArtifact: boolean;
  readonly isReviewArtifactConverted: boolean;
}

export interface IPushAutoClosePreventionRule {
  readonly ruleId: string;
  readonly description: string;
  readonly autoCloseAllowed: boolean;
  readonly requiresPerConfirmation: boolean;
}
