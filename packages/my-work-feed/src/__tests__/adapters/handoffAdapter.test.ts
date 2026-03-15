import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IHandoffPackage, HandoffStatus } from '@hbc/workflow-handoff';

vi.mock('@hbc/workflow-handoff', () => ({
  HandoffApi: {
    inbox: vi.fn(),
  },
}));

import { HandoffApi } from '@hbc/workflow-handoff';
import { handoffAdapter } from '../../adapters/handoffAdapter.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

const mockInbox = vi.mocked(HandoffApi.inbox);

function createHandoffPackage(
  overrides?: Partial<IHandoffPackage<unknown, unknown>>,
): IHandoffPackage<unknown, unknown> {
  return {
    handoffId: 'hoff-001',
    sourceModule: 'bd-scorecard',
    sourceRecordType: 'transfer',
    sourceRecordId: 'rec-001',
    destinationModule: 'compliance',
    destinationRecordType: 'review',
    sourceSnapshot: {},
    destinationSeedData: {},
    documents: [],
    contextNotes: [
      {
        noteId: 'n1',
        category: 'General',
        body: 'Please review',
        author: { userId: 'sender-001', displayName: 'Alice Wong', role: 'Analyst' },
        createdAt: '2026-01-15T10:00:00.000Z',
      },
    ],
    sender: { userId: 'sender-001', displayName: 'Alice Wong', role: 'Analyst' },
    recipient: { userId: 'recipient-001', displayName: 'Bob Jones', role: 'Reviewer' },
    status: 'sent' as HandoffStatus,
    sentAt: new Date().toISOString(),
    acknowledgedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    createdDestinationRecordId: null,
    createdAt: '2026-01-15T08:00:00.000Z',
    ...overrides,
  };
}

describe('handoffAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports isEnabled as true', () => {
    expect(handoffAdapter.isEnabled(createMockRuntimeContext())).toBe(true);
  });

  it('maps status=sent to state=new and isUnread=true', async () => {
    mockInbox.mockResolvedValue([createHandoffPackage({ status: 'sent' })]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toHaveLength(1);
    expect(items[0].state).toBe('new');
    expect(items[0].isUnread).toBe(true);
    expect(items[0].class).toBe('inbound-handoff');
  });

  it('maps status=received to state=active and isUnread=false', async () => {
    mockInbox.mockResolvedValue([createHandoffPackage({ status: 'received' })]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].state).toBe('active');
    expect(items[0].isUnread).toBe(false);
  });

  it('computes now priority for handoffs older than 48h', async () => {
    const oldDate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
    mockInbox.mockResolvedValue([createHandoffPackage({ sentAt: oldDate })]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('now');
  });

  it('computes soon priority for handoffs older than 24h', async () => {
    const midDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    mockInbox.mockResolvedValue([createHandoffPackage({ sentAt: midDate })]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('soon');
  });

  it('computes watch priority for recent handoffs', async () => {
    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    mockInbox.mockResolvedValue([createHandoffPackage({ sentAt: recentDate })]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('watch');
  });

  it('includes acknowledge and reject available actions', async () => {
    mockInbox.mockResolvedValue([createHandoffPackage()]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].availableActions).toEqual([
      { key: 'acknowledge', label: 'Acknowledge' },
      { key: 'reject', label: 'Reject', variant: 'danger' },
    ]);
  });

  it('maps sender and recipient to previousOwner and owner', async () => {
    mockInbox.mockResolvedValue([createHandoffPackage()]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].owner).toEqual({ type: 'user', id: 'recipient-001', label: 'Bob Jones' });
    expect(items[0].previousOwner).toEqual({ type: 'user', id: 'sender-001', label: 'Alice Wong' });
    expect(items[0].title).toBe('Handoff from Alice Wong');
  });

  it('builds correct dedupeKey format', async () => {
    mockInbox.mockResolvedValue([createHandoffPackage()]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].dedupeKey).toBe('bd-scorecard::transfer::rec-001');
    expect(items[0].workItemId).toBe('workflow-handoff::hoff-001');
  });

  it('returns empty array when inbox is empty', async () => {
    mockInbox.mockResolvedValue([]);

    const items = await handoffAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toEqual([]);
  });
});
