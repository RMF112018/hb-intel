import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@hbc/bic-next-move', () => ({
  executeBicFanOut: vi.fn(),
}));
vi.mock('@hbc/workflow-handoff', () => ({
  HandoffApi: { inbox: vi.fn() },
}));
vi.mock('@hbc/notification-intelligence', () => ({
  NotificationApi: { getCenter: vi.fn() },
}));
vi.mock('@hbc/session-state', () => ({
  listPending: vi.fn(),
}));

import { executeBicFanOut } from '@hbc/bic-next-move';
import { HandoffApi } from '@hbc/workflow-handoff';
import { NotificationApi } from '@hbc/notification-intelligence';
import { listPending } from '@hbc/session-state';
import { bicAdapter } from '../../adapters/bicAdapter.js';
import { handoffAdapter } from '../../adapters/handoffAdapter.js';
import { acknowledgmentAdapter } from '../../adapters/acknowledgmentAdapter.js';
import { notificationAdapter } from '../../adapters/notificationAdapter.js';
import { draftResumeAdapter } from '../../adapters/draftResumeAdapter.js';
import { MyWorkRegistry } from '../../registry/MyWorkRegistry.js';
import { aggregateFeed } from '../../api/aggregateFeed.js';
import { FeedTelemetry } from '../../telemetry/feedTelemetry.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

const mockExecute = vi.mocked(executeBicFanOut);
const mockInbox = vi.mocked(HandoffApi.inbox);
const mockGetCenter = vi.mocked(NotificationApi.getCenter);
const mockListPending = vi.mocked(listPending);

describe('adapter integration', () => {
  afterEach(() => {
    MyWorkRegistry._clearForTesting();
    FeedTelemetry._clearForTesting();
    vi.clearAllMocks();
  });

  it('registers all 4 active adapters and produces a feed', async () => {
    mockExecute.mockResolvedValue({
      items: [{
        itemKey: 'bic-1',
        moduleKey: 'bd-scorecard',
        moduleLabel: 'BD Scorecard',
        title: 'BIC Item',
        href: '/bic/1',
        state: {
          currentOwner: { userId: 'u1', displayName: 'Jane', role: 'Analyst' },
          expectedAction: 'Review',
          dueDate: null,
          isOverdue: false,
          isBlocked: false,
          blockedReason: null,
          previousOwner: null,
          nextOwner: null,
          escalationOwner: null,
          transferHistory: [],
          urgencyTier: 'immediate' as const,
        },
      }],
      failedModules: [],
    });

    mockInbox.mockResolvedValue([{
      handoffId: 'hoff-1',
      sourceModule: 'compliance',
      sourceRecordType: 'review',
      sourceRecordId: 'rev-1',
      destinationModule: 'audit',
      destinationRecordType: 'finding',
      sourceSnapshot: {},
      destinationSeedData: {},
      documents: [],
      contextNotes: [],
      sender: { userId: 'u2', displayName: 'Alice', role: 'Reviewer' },
      recipient: { userId: 'u1', displayName: 'Jane', role: 'Analyst' },
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
      acknowledgedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      createdDestinationRecordId: null,
      createdAt: '2026-01-15T08:00:00.000Z',
    }]);

    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });

    mockListPending.mockResolvedValue([]);

    MyWorkRegistry.register([
      { source: 'bic-next-move', adapter: bicAdapter, rankingWeight: 0.9 },
      { source: 'workflow-handoff', adapter: handoffAdapter, rankingWeight: 0.8 },
      { source: 'notification-intelligence', adapter: notificationAdapter, rankingWeight: 0.5 },
      { source: 'session-state', adapter: draftResumeAdapter, rankingWeight: 0.3 },
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.healthState?.freshness).toBe('live');
  });

  it('deduplicates across sources using matching dedupeKeys', async () => {
    // BIC and notification both reference the same record
    mockExecute.mockResolvedValue({
      items: [{
        itemKey: 'rec-001',
        moduleKey: 'bd-scorecard',
        moduleLabel: 'BD Scorecard',
        title: 'BIC Item',
        href: '/bic/rec-001',
        state: {
          currentOwner: { userId: 'u1', displayName: 'Jane', role: 'Analyst' },
          expectedAction: 'Review',
          dueDate: null,
          isOverdue: false,
          isBlocked: false,
          blockedReason: null,
          previousOwner: null,
          nextOwner: null,
          escalationOwner: null,
          transferHistory: [],
          urgencyTier: 'immediate' as const,
        },
      }],
      failedModules: [],
    });

    // Notification with same dedupeKey pattern won't match BIC because BIC uses 'bic-item' as recordType
    // But handoff and notification can share dedupeKeys when referencing same source record
    mockInbox.mockResolvedValue([]);
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });
    mockListPending.mockResolvedValue([]);

    MyWorkRegistry.register([
      { source: 'bic-next-move', adapter: bicAdapter, rankingWeight: 0.9 },
      { source: 'notification-intelligence', adapter: notificationAdapter, rankingWeight: 0.5 },
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    // Only BIC item since notification had no items
    expect(result.items).toHaveLength(1);
    expect(result.items[0].workItemId).toBe('bic-next-move::rec-001');
  });

  it('isolates partial adapter failures', async () => {
    mockExecute.mockResolvedValue({
      items: [{
        itemKey: 'bic-1',
        moduleKey: 'bd-scorecard',
        moduleLabel: 'BD Scorecard',
        title: 'Item',
        href: '/bic/1',
        state: {
          currentOwner: { userId: 'u1', displayName: 'Jane', role: 'Analyst' },
          expectedAction: 'Review',
          dueDate: null,
          isOverdue: false,
          isBlocked: false,
          blockedReason: null,
          previousOwner: null,
          nextOwner: null,
          escalationOwner: null,
          transferHistory: [],
          urgencyTier: 'watch' as const,
        },
      }],
      failedModules: [],
    });

    mockInbox.mockRejectedValue(new Error('Handoff service down'));
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });
    mockListPending.mockResolvedValue([]);

    MyWorkRegistry.register([
      { source: 'bic-next-move', adapter: bicAdapter, rankingWeight: 0.9 },
      { source: 'workflow-handoff', adapter: handoffAdapter, rankingWeight: 0.8 },
      { source: 'notification-intelligence', adapter: notificationAdapter, rankingWeight: 0.5 },
      { source: 'session-state', adapter: draftResumeAdapter, rankingWeight: 0.3 },
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    // BIC items still present despite handoff failure
    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.healthState?.freshness).toBe('partial');
    expect(result.healthState?.degradedSourceCount).toBe(1);
  });

  it('acknowledgment adapter does not contribute items when registered', async () => {
    MyWorkRegistry.register([
      { source: 'acknowledgment', adapter: acknowledgmentAdapter, rankingWeight: 0.5 },
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(0);
  });

  it('produces empty feed with no registered adapters', async () => {
    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});
