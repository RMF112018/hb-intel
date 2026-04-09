/**
 * People & Culture notification runtime.
 *
 * Phase-14 pc/ Prompt-05 (Permissions, Intake, Notifications, and Work
 * Management).
 *
 * Pure derivation from item state into
 * `PeopleCultureNotificationEvent[]`. The builder inspects every item's
 * lifecycle timestamps and emits one event per transition the item has
 * actually crossed (submitted → approved → scheduled → published → …).
 * The featured subject of an item (`item.personRef`) is explicitly
 * **not** a recipient — the Decision-Lock Appendix forbids auto
 * notifying featured people by default.
 *
 * Recipient rules (per Decision-Lock Appendix):
 *
 *   - `submitted`         → operator cohort (editor + approver)
 *   - `approved`          → submitter + content owner
 *   - `scheduled`         → submitter + content owner
 *   - `published`         → submitter + content owner
 *   - `rejected`          → submitter + content owner
 *   - `revisionRequested` → submitter + content owner
 *   - `expired`           → operator cohort (editor + approver)
 *
 * For each trigger we emit one event per recipient kind with an
 * optional concrete `recipient` person reference (the submitter /
 * approver / editor we know about). When the concrete person is
 * unknown the event still emits with `recipient: undefined` so the
 * notifications section can render a cohort-wide entry.
 *
 * The builder is deterministic: output order is
 * `(emittedAt, itemId, trigger, recipientKind)`. Ids are stable
 * (`nf:<itemId>:<trigger>:<recipientKind>`) so re-running the builder
 * against the same state does not duplicate events.
 */

import type {
  PeopleCultureItem,
  PeopleCultureNotificationEvent,
  PeopleCultureNotificationRecipientKind,
  PeopleCultureNotificationTrigger,
  PeopleCultureRole,
} from '../webparts/peopleCultureSplitContracts.js';
import type { PersonReference } from '../webparts/communicationsContracts.js';

const OPERATOR_KINDS: readonly PeopleCultureNotificationRecipientKind[] = [
  'editor',
  'approver',
];
const OWNER_KINDS: readonly PeopleCultureNotificationRecipientKind[] = [
  'submitter',
  'contentOwner',
];

const TRIGGER_RECIPIENT_PLAN: Record<
  PeopleCultureNotificationTrigger,
  readonly PeopleCultureNotificationRecipientKind[]
> = {
  submitted: OPERATOR_KINDS,
  approved: OWNER_KINDS,
  scheduled: OWNER_KINDS,
  published: OWNER_KINDS,
  rejected: OWNER_KINDS,
  revisionRequested: OWNER_KINDS,
  expired: OPERATOR_KINDS,
};

function contextForTrigger(
  trigger: PeopleCultureNotificationTrigger,
  item: PeopleCultureItem,
): string | undefined {
  switch (trigger) {
    case 'submitted':
      return `Submitted ${item.submittedAt ? `at ${item.submittedAt}` : ''}`.trim();
    case 'approved':
      return `Approved ${item.approvedAt ? `at ${item.approvedAt}` : ''}`.trim();
    case 'scheduled':
      return item.scheduledStart
        ? `Scheduled for ${item.scheduledStart}`
        : 'Scheduled for publication';
    case 'published':
      return `Published ${item.publishedAt ? `at ${item.publishedAt}` : ''}`.trim();
    case 'rejected':
      return 'Rejected and returned to draft';
    case 'revisionRequested':
      return 'Revision requested';
    case 'expired':
      return item.expiresAt ? `Expired at ${item.expiresAt}` : 'Expired';
    default:
      return undefined;
  }
}

function recipientForKind(
  kind: PeopleCultureNotificationRecipientKind,
  item: PeopleCultureItem,
): PersonReference | undefined {
  switch (kind) {
    case 'submitter':
      return item.submittedBy;
    case 'contentOwner':
      // Prompt-03 claim/reassignment encodes approval ownership as a
      // tag. For v1 we surface that identity as the content owner
      // when present; real schemas will promote it later.
      {
        const tag = (item.tags ?? []).find((t) => t.startsWith('approval-owner:'));
        if (tag) {
          const name = tag.replace(/^approval-owner:/, '').trim();
          if (name) return { id: `owner:${name}`, displayName: name };
        }
      }
      return item.approvedBy;
    case 'approver':
      return item.approvedBy;
    case 'editor':
    default:
      return undefined;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function emitEvent(
  out: PeopleCultureNotificationEvent[],
  trigger: PeopleCultureNotificationTrigger,
  item: PeopleCultureItem,
  emittedAt: string,
): void {
  // Never target the featured subject.
  const forbiddenIds = new Set<string>();
  if (item.personRef?.id) forbiddenIds.add(item.personRef.id);

  for (const recipientKind of TRIGGER_RECIPIENT_PLAN[trigger]) {
    const recipient = recipientForKind(recipientKind, item);
    if (recipient && forbiddenIds.has(recipient.id)) {
      // The Decision-Lock Appendix forbids auto-notifying the
      // featured subject of an item. Skip this recipient even if
      // it happens to match the owner/submitter.
      continue;
    }
    out.push({
      id: `nf:${item.id}:${trigger}:${recipientKind}`,
      trigger,
      itemId: item.id,
      itemTitle: item.title,
      itemFamily: item.family,
      recipientKind,
      recipient,
      emittedAt,
      context: contextForTrigger(trigger, item),
    });
  }
}

export interface BuildNotificationsOptions {
  /**
   * Override for emit timestamps. Defaults to `new Date().toISOString()`.
   * Use in tests to get deterministic ids.
   */
  emittedAt?: string;
  /**
   * Stable set of previously-emitted event ids so re-running the
   * builder does not duplicate an event the caller has already
   * persisted. Shape matches the builder output id scheme.
   */
  dedupeAgainst?: ReadonlyArray<PeopleCultureNotificationEvent>;
}

/**
 * Build the notification event list for the companion.
 *
 * For each item, emit events for every lifecycle transition the item
 * has actually crossed, in priority order:
 *
 *   1. `submitted`         when `submittedAt` is set
 *   2. `rejected`          when lifecycle is `draft` and `submittedAt` is set but `approvedAt` is not — treated as a revision round trip
 *   3. `approved`          when `approvedAt` is set
 *   4. `scheduled`         when lifecycle is `scheduled`
 *   5. `published`         when lifecycle is `live` or `expiringSoon`
 *   6. `expired`           when lifecycle is `expired`
 *   7. `revisionRequested` when `tags` contains `revision-requested` (v1 escape hatch; real schema later)
 *
 * The builder is pure. No persistence. Callers that want to surface
 * incremental deltas (e.g., "show only events since last read") can
 * diff the ids against their last snapshot.
 */
export function buildPeopleCultureNotifications(
  items: ReadonlyArray<PeopleCultureItem>,
  options: BuildNotificationsOptions = {},
): PeopleCultureNotificationEvent[] {
  const emittedAt = options.emittedAt ?? nowIso();
  const dedupe = new Set(
    (options.dedupeAgainst ?? []).map((event) => event.id),
  );
  const out: PeopleCultureNotificationEvent[] = [];

  for (const item of items) {
    const triggers: PeopleCultureNotificationTrigger[] = [];

    if (item.submittedAt) triggers.push('submitted');
    if ((item.tags ?? []).some((t) => t.toLowerCase() === 'revision-requested')) {
      triggers.push('revisionRequested');
    }
    if (item.approvedAt) triggers.push('approved');
    if (item.lifecycleState === 'scheduled') triggers.push('scheduled');
    if (item.lifecycleState === 'live' || item.lifecycleState === 'expiringSoon') {
      triggers.push('published');
    }
    if (item.lifecycleState === 'expired') triggers.push('expired');

    // The combination `lifecycleState === 'draft'` AND `submittedAt` set
    // AND no `approvedAt` is how Prompt-03 encodes a reject. Emit a
    // rejected event for that case.
    if (
      item.lifecycleState === 'draft' &&
      item.submittedAt &&
      !item.approvedAt
    ) {
      triggers.push('rejected');
    }

    for (const trigger of triggers) {
      const before = out.length;
      emitEvent(out, trigger, item, emittedAt);
      // Filter out any event whose id already appears in the dedupe
      // set.
      for (let i = out.length - 1; i >= before; i -= 1) {
        if (dedupe.has(out[i].id)) out.splice(i, 1);
      }
    }
  }

  out.sort((a, b) => {
    if (a.emittedAt !== b.emittedAt) return a.emittedAt.localeCompare(b.emittedAt);
    if (a.itemId !== b.itemId) return a.itemId.localeCompare(b.itemId);
    if (a.trigger !== b.trigger) return a.trigger.localeCompare(b.trigger);
    return a.recipientKind.localeCompare(b.recipientKind);
  });

  return out;
}

/**
 * Filter a notification event list to those visible to a given viewer.
 *
 * Rules:
 *
 *   - Viewers in the operator cohort (editor / approver / admin) see
 *     every event whose recipientKind is `editor` or `approver`.
 *   - Viewers with a concrete identity (`viewerEmail` / `viewerId`)
 *     see events whose `recipient` matches them, regardless of the
 *     cohort rule.
 *   - Admin role sees everything.
 */
export interface NotificationViewerFilter {
  role?: PeopleCultureRole;
  viewerEmail?: string;
  viewerId?: string;
}

export function filterNotificationsForViewer(
  events: ReadonlyArray<PeopleCultureNotificationEvent>,
  viewer: NotificationViewerFilter,
): PeopleCultureNotificationEvent[] {
  if (viewer.role === 'admin') return [...events];

  const isOperator =
    viewer.role === 'approver' || viewer.role === 'editor' || viewer.role === 'admin';
  const emailLc = viewer.viewerEmail?.toLowerCase();

  return events.filter((event) => {
    if (isOperator && (event.recipientKind === 'editor' || event.recipientKind === 'approver')) {
      if (viewer.role === 'editor' && event.recipientKind === 'approver') {
        // Editors don't see approver-only queues.
        return false;
      }
      return true;
    }
    // Owner/submitter events only match if the concrete recipient
    // identifies the viewer.
    if (event.recipient) {
      if (viewer.viewerId && event.recipient.id === viewer.viewerId) return true;
      if (
        emailLc &&
        event.recipient.email &&
        event.recipient.email.toLowerCase() === emailLc
      ) {
        return true;
      }
      if (
        emailLc &&
        event.recipient.id &&
        event.recipient.id.toLowerCase() === emailLc
      ) {
        return true;
      }
    }
    return false;
  });
}
