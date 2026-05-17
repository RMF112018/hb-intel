import { describe, expect, it } from 'vitest';
import {
  classifyNotificationSource,
  groupNotificationsBySourceKind,
  type IParsedNotification,
} from '../my-projects-projection/webhook/projection-webhook-classifier.js';
import type { IProjectionSubscriptionEntity } from '../my-projects-projection/projection-state-entities.js';

const SUBSCRIPTIONS: IProjectionSubscriptionEntity[] = [
  {
    partitionKey: 'MyProjectsProjection',
    rowKey: 'Subscription:Projects',
    SourceListKind: 'Projects',
    SourceSiteId: 'site',
    SourceListId: 'list-projects',
    SubscriptionId: 'sub-projects',
    Status: 'healthy',
  },
  {
    partitionKey: 'MyProjectsProjection',
    rowKey: 'Subscription:LegacyRegistry',
    SourceListKind: 'LegacyRegistry',
    SourceSiteId: 'site',
    SourceListId: 'list-legacy',
    SubscriptionId: 'sub-legacy',
    Status: 'healthy',
  },
];

describe('classifyNotificationSource', () => {
  it('classifies a known subscription ID to its SourceListKind', () => {
    expect(
      classifyNotificationSource({
        notification: { subscriptionId: 'sub-projects' },
        subscriptionState: SUBSCRIPTIONS,
      }),
    ).toEqual({ outcome: 'classified', sourceListKind: 'Projects' });
    expect(
      classifyNotificationSource({
        notification: { subscriptionId: 'sub-legacy' },
        subscriptionState: SUBSCRIPTIONS,
      }),
    ).toEqual({ outcome: 'classified', sourceListKind: 'LegacyRegistry' });
  });

  it('returns rejected/missing-subscription-id when subscriptionId is missing or empty', () => {
    expect(
      classifyNotificationSource({
        notification: {},
        subscriptionState: SUBSCRIPTIONS,
      }),
    ).toEqual({ outcome: 'rejected', reason: 'missing-subscription-id' });
    expect(
      classifyNotificationSource({
        notification: { subscriptionId: '   ' },
        subscriptionState: SUBSCRIPTIONS,
      }),
    ).toEqual({ outcome: 'rejected', reason: 'missing-subscription-id' });
  });

  it('returns rejected/unknown-subscription for an ID not in state', () => {
    expect(
      classifyNotificationSource({
        notification: { subscriptionId: 'sub-not-known' },
        subscriptionState: SUBSCRIPTIONS,
      }),
    ).toEqual({
      outcome: 'rejected',
      reason: 'unknown-subscription',
      subscriptionId: 'sub-not-known',
    });
  });
});

describe('groupNotificationsBySourceKind', () => {
  it('buckets accepted notifications by SourceListKind preserving input order within each kind', () => {
    const notifications: IParsedNotification[] = [
      { subscriptionId: 'sub-projects', clientState: 'x' },
      { subscriptionId: 'sub-legacy', clientState: 'x' },
      { subscriptionId: 'sub-projects', clientState: 'y' },
    ];
    const grouped = groupNotificationsBySourceKind({
      notifications,
      subscriptionState: SUBSCRIPTIONS,
    });
    expect(grouped.accepted.get('Projects')).toHaveLength(2);
    expect(grouped.accepted.get('Projects')?.[0]?.clientState).toBe('x');
    expect(grouped.accepted.get('Projects')?.[1]?.clientState).toBe('y');
    expect(grouped.accepted.get('LegacyRegistry')).toHaveLength(1);
    expect(grouped.rejected).toHaveLength(0);
  });

  it('separates rejected notifications by reason', () => {
    const notifications: IParsedNotification[] = [
      { subscriptionId: '' },
      { subscriptionId: 'sub-not-known' },
      { subscriptionId: 'sub-projects' },
    ];
    const grouped = groupNotificationsBySourceKind({
      notifications,
      subscriptionState: SUBSCRIPTIONS,
    });
    expect(grouped.accepted.get('Projects')).toHaveLength(1);
    expect(grouped.rejected).toHaveLength(2);
    const reasons = grouped.rejected.map((entry) => entry.outcome.reason).sort();
    expect(reasons).toEqual(['missing-subscription-id', 'unknown-subscription']);
  });

  it('returns an empty accepted map when all notifications are rejected', () => {
    const grouped = groupNotificationsBySourceKind({
      notifications: [{ subscriptionId: 'nope' }, { subscriptionId: '' }],
      subscriptionState: SUBSCRIPTIONS,
    });
    expect(grouped.accepted.size).toBe(0);
    expect(grouped.rejected).toHaveLength(2);
  });
});
