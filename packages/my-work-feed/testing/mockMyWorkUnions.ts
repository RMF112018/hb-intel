import type {
  MyWorkItemClass,
  MyWorkPriority,
  MyWorkState,
  MyWorkOwnerType,
  MyWorkSource,
  MyWorkSyncStatus,
} from '../src/types/index.js';

export const mockItemClasses: readonly MyWorkItemClass[] = [
  'owned-action',
  'inbound-handoff',
  'pending-approval',
  'attention-item',
  'queued-follow-up',
  'contextual-signal',
] as const;

export const mockPriorityLanes: readonly MyWorkPriority[] = [
  'now',
  'soon',
  'watch',
  'deferred',
] as const;

export const mockStates: readonly MyWorkState[] = [
  'new',
  'active',
  'blocked',
  'waiting',
  'deferred',
  'superseded',
  'completed',
] as const;

export const mockOwnerTypes: readonly MyWorkOwnerType[] = [
  'user',
  'role',
  'company',
  'system',
] as const;

export const mockSources: readonly MyWorkSource[] = [
  'bic-next-move',
  'workflow-handoff',
  'acknowledgment',
  'notification-intelligence',
  'session-state',
  'module',
] as const;

export const mockSyncStatuses: readonly MyWorkSyncStatus[] = [
  'live',
  'cached',
  'partial',
  'queued',
] as const;
