/**
 * Notification Intelligence source adapter.
 *
 * Maps `INotificationEvent[]` from `NotificationApi.getCenter()` into `IMyWorkItem[]`.
 * Weight 0.5 — signals and attention items, not primary actions.
 *
 * The `dedupeKey` format matches BIC/handoff adapters, enabling the pipeline
 * to merge notification signals with action items from higher-weight sources.
 */

import { NotificationApi } from '@hbc/notification-intelligence';
import type { INotificationEvent, NotificationTier } from '@hbc/notification-intelligence';
import type {
  IMyWorkSourceAdapter,
  IMyWorkItem,
  MyWorkPriority,
} from '../types/index.js';
import {
  buildWorkItemId,
  buildDedupeKey,
  buildDefaultTimestamps,
  buildSourceMeta,
} from './_mappers.js';

const TIER_TO_PRIORITY: Record<NotificationTier, MyWorkPriority> = {
  immediate: 'now',
  watch: 'soon',
  digest: 'watch',
};

function mapNotificationItem(event: INotificationEvent): IMyWorkItem {
  return {
    workItemId: buildWorkItemId('notification-intelligence', event.id),
    canonicalKey: `${event.sourceModule}::${event.sourceRecordId}`,
    dedupeKey: buildDedupeKey(event.sourceModule, event.sourceRecordType, event.sourceRecordId),
    class: 'attention-item',
    priority: TIER_TO_PRIORITY[event.effectiveTier] ?? 'watch',
    state: event.readAt ? 'active' : 'new',
    lane: event.readAt ? 'watch' : 'do-now',
    title: event.title,
    summary: event.body,
    expectedAction: undefined,
    dueDateIso: null,
    isOverdue: false,
    isUnread: event.readAt === null,
    isBlocked: false,
    blockedReason: null,
    changeSummary: null,
    whyThisMatters: null,
    supersededByWorkItemId: null,
    owner: { type: 'user', id: event.recipientUserId, label: '' },
    previousOwner: null,
    context: {
      moduleKey: event.sourceModule,
      recordId: event.sourceRecordId,
      recordType: event.sourceRecordType,
      href: event.actionUrl,
    },
    sourceMeta: [buildSourceMeta('notification-intelligence', event.id, event.createdAt)],
    permissionState: { canOpen: true, canAct: false, cannotActReason: 'Notification items are view-only' },
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: null,
      nextStepLabel: null,
      blockedDependencyLabel: null,
      impactedRecordLabel: null,
    },
    rankingReason: {
      primaryReason: 'Notification requiring attention',
      contributingReasons: [],
    },
    availableActions: [
      { key: 'view', label: event.actionLabel || 'View' },
      { key: 'dismiss', label: 'Dismiss' },
    ],
    offlineCapable: false,
    timestamps: buildDefaultTimestamps(event.createdAt),
    delegatedBy: null,
    delegatedTo: null,
    locationLabel: null,
    userNote: null,
  };
}

export const notificationAdapter: IMyWorkSourceAdapter = {
  source: 'notification-intelligence',

  isEnabled: () => true,

  load: async () => {
    const [immediateResult, watchResult] = await Promise.all([
      NotificationApi.getCenter({ tier: 'immediate', unreadOnly: true }),
      NotificationApi.getCenter({ tier: 'watch', unreadOnly: true }),
    ]);

    const allEvents = [...immediateResult.items, ...watchResult.items];
    return allEvents.map(mapNotificationItem);
  },
};
