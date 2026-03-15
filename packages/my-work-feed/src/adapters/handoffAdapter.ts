/**
 * Workflow Handoff source adapter.
 *
 * Maps `IHandoffPackage[]` from `HandoffApi.inbox()` into `IMyWorkItem[]`.
 * Weight 0.8 — active inbound work requiring acknowledgment.
 *
 * NOTE: `@hbc/workflow-handoff` is Layer 7; `my-work-feed` targets Layer 6.
 * This import is a narrow lateral exception (HandoffApi + types only).
 * See package-relationship-map.md for the documented exception pattern.
 */

import { HandoffApi } from '@hbc/workflow-handoff';
import type { IHandoffPackage } from '@hbc/workflow-handoff';
import type {
  IMyWorkSourceAdapter,
  IMyWorkItem,
  MyWorkPriority,
  IMyWorkOwner,
} from '../types/index.js';
import {
  buildWorkItemId,
  buildDedupeKey,
  buildDefaultTimestamps,
  buildSourceMeta,
} from './_mappers.js';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function computeAgeBasedPriority(sentAt: string | null): MyWorkPriority {
  if (!sentAt) return 'watch';
  const ageMs = Date.now() - new Date(sentAt).getTime();
  if (ageMs > FORTY_EIGHT_HOURS_MS) return 'now';
  if (ageMs > TWENTY_FOUR_HOURS_MS) return 'soon';
  return 'watch';
}

function mapHandoffOwner(owner: { userId: string; displayName: string; role: string }): IMyWorkOwner {
  return {
    type: 'user',
    id: owner.userId,
    label: owner.displayName,
  };
}

function mapHandoffItem(pkg: IHandoffPackage<unknown, unknown>): IMyWorkItem {
  const now = new Date().toISOString();
  const noteCount = pkg.contextNotes?.length ?? 0;

  return {
    workItemId: buildWorkItemId('workflow-handoff', pkg.handoffId),
    canonicalKey: `${pkg.sourceModule}::${pkg.sourceRecordId}`,
    dedupeKey: buildDedupeKey(pkg.sourceModule, pkg.sourceRecordType, pkg.sourceRecordId),
    class: 'inbound-handoff',
    priority: computeAgeBasedPriority(pkg.sentAt),
    state: pkg.status === 'sent' ? 'new' : 'active',
    lane: 'do-now',
    title: `Handoff from ${pkg.sender.displayName}`,
    summary: `${pkg.sourceModule} — ${noteCount} context note${noteCount === 1 ? '' : 's'}`,
    expectedAction: 'Review and acknowledge or reject',
    dueDateIso: null,
    isOverdue: false,
    isUnread: pkg.status === 'sent',
    isBlocked: false,
    blockedReason: null,
    changeSummary: null,
    whyThisMatters: null,
    supersededByWorkItemId: null,
    owner: mapHandoffOwner(pkg.recipient),
    previousOwner: mapHandoffOwner(pkg.sender),
    context: {
      moduleKey: pkg.sourceModule,
      recordId: pkg.sourceRecordId,
      recordType: pkg.sourceRecordType,
    },
    sourceMeta: [buildSourceMeta('workflow-handoff', pkg.handoffId, now)],
    permissionState: { canOpen: true, canAct: true },
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: pkg.status === 'sent' ? 'Sent' : 'Received',
      nextStepLabel: 'Acknowledged',
      blockedDependencyLabel: null,
      impactedRecordLabel: null,
    },
    rankingReason: {
      primaryReason: 'Inbound handoff requiring acknowledgment',
      contributingReasons: [],
    },
    availableActions: [
      { key: 'acknowledge', label: 'Acknowledge' },
      { key: 'reject', label: 'Reject', variant: 'danger' },
    ],
    offlineCapable: false,
    timestamps: buildDefaultTimestamps(pkg.createdAt, pkg.sentAt ?? pkg.createdAt),
    delegatedBy: null,
    delegatedTo: null,
    locationLabel: null,
    userNote: null,
  };
}

export const handoffAdapter: IMyWorkSourceAdapter = {
  source: 'workflow-handoff',

  isEnabled: () => true,

  load: async () => {
    const packages = await HandoffApi.inbox();
    return packages.map(mapHandoffItem);
  },
};
