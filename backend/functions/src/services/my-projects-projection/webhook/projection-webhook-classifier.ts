/**
 * My Projects projection — webhook notification classifier (pure).
 *
 * Maps a Graph notification's `subscriptionId` to its `SourceListKind` using
 * a snapshot of the subscription state table. The webhook handler reads
 * subscription state once per request (cheap — exactly two rows) and passes
 * it to this classifier so the classifier itself stays pure and trivially
 * unit-testable.
 *
 * The classifier never enqueues, never logs, and never throws on
 * structurally-valid input. Rejection reasons (`missing-subscription-id`,
 * `unknown-subscription`) are returned as typed outcomes so the handler can
 * emit the right telemetry event without re-parsing.
 */

import type { IProjectionSubscriptionEntity } from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';

export interface IParsedNotification {
  readonly subscriptionId?: string | null;
  readonly clientState?: string | null;
  readonly resource?: string | null;
  readonly changeType?: string | null;
}

export type IClassificationOutcome =
  | { readonly outcome: 'classified'; readonly sourceListKind: SourceListKind }
  | { readonly outcome: 'rejected'; readonly reason: 'missing-subscription-id' }
  | {
      readonly outcome: 'rejected';
      readonly reason: 'unknown-subscription';
      readonly subscriptionId: string;
    };

export function classifyNotificationSource(args: {
  notification: IParsedNotification;
  subscriptionState: readonly IProjectionSubscriptionEntity[];
}): IClassificationOutcome {
  const subscriptionId =
    typeof args.notification.subscriptionId === 'string'
      ? args.notification.subscriptionId.trim()
      : '';
  if (subscriptionId.length === 0) {
    return { outcome: 'rejected', reason: 'missing-subscription-id' };
  }
  const match = args.subscriptionState.find((entry) => entry.SubscriptionId === subscriptionId);
  if (!match) {
    return { outcome: 'rejected', reason: 'unknown-subscription', subscriptionId };
  }
  return { outcome: 'classified', sourceListKind: match.SourceListKind };
}

export interface IGroupedNotifications {
  readonly accepted: ReadonlyMap<SourceListKind, readonly IParsedNotification[]>;
  readonly rejected: ReadonlyArray<{
    readonly notification: IParsedNotification;
    readonly outcome: Exclude<IClassificationOutcome, { outcome: 'classified' }>;
  }>;
}

export function groupNotificationsBySourceKind(args: {
  notifications: readonly IParsedNotification[];
  subscriptionState: readonly IProjectionSubscriptionEntity[];
}): IGroupedNotifications {
  const accepted = new Map<SourceListKind, IParsedNotification[]>();
  const rejected: Array<{
    notification: IParsedNotification;
    outcome: Exclude<IClassificationOutcome, { outcome: 'classified' }>;
  }> = [];
  for (const notification of args.notifications) {
    const outcome = classifyNotificationSource({
      notification,
      subscriptionState: args.subscriptionState,
    });
    if (outcome.outcome === 'classified') {
      const bucket = accepted.get(outcome.sourceListKind) ?? [];
      bucket.push(notification);
      accepted.set(outcome.sourceListKind, bucket);
    } else {
      rejected.push({ notification, outcome });
    }
  }
  return { accepted, rejected };
}
