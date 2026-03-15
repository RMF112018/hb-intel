import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IBicFanOutResult, IBicRegisteredItem, IBicNextMoveState, IBicOwner } from '@hbc/bic-next-move';

vi.mock('@hbc/bic-next-move', () => ({
  executeBicFanOut: vi.fn(),
}));

import { executeBicFanOut } from '@hbc/bic-next-move';
import { bicAdapter } from '../../adapters/bicAdapter.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

const mockExecute = vi.mocked(executeBicFanOut);

function createBicOwner(overrides?: Partial<IBicOwner>): IBicOwner {
  return {
    userId: 'owner-001',
    displayName: 'Jane Smith',
    role: 'Analyst',
    ...overrides,
  };
}

function createBicItem(overrides?: Partial<IBicRegisteredItem>): IBicRegisteredItem {
  return {
    itemKey: 'item-001',
    moduleKey: 'bd-scorecard',
    moduleLabel: 'BD Scorecard',
    title: 'Review Transfer TR-001',
    href: '/bd-scorecard/transfers/item-001',
    state: {
      currentOwner: createBicOwner(),
      expectedAction: 'Approve transfer',
      dueDate: null,
      isOverdue: false,
      isBlocked: false,
      blockedReason: null,
      previousOwner: null,
      nextOwner: null,
      escalationOwner: null,
      transferHistory: [],
      urgencyTier: 'watch',
    },
    ...overrides,
  };
}

describe('bicAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports isEnabled as true', () => {
    expect(bicAdapter.isEnabled(createMockRuntimeContext())).toBe(true);
  });

  it('maps immediate urgency to now priority', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({
        state: {
          ...createBicItem().state,
          urgencyTier: 'immediate',
        },
      })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toHaveLength(1);
    expect(items[0].priority).toBe('now');
    expect(items[0].class).toBe('owned-action');
  });

  it('maps watch urgency to soon priority', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem()],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('soon');
  });

  it('maps upcoming urgency to watch priority', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({
        state: { ...createBicItem().state, urgencyTier: 'upcoming' },
      })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].priority).toBe('watch');
  });

  it('sets blocked state when isBlocked is true', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({
        state: {
          ...createBicItem().state,
          isBlocked: true,
          blockedReason: 'Awaiting compliance review',
        },
      })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].state).toBe('blocked');
    expect(items[0].isBlocked).toBe(true);
    expect(items[0].blockedReason).toBe('Awaiting compliance review');
    expect(items[0].lane).toBe('waiting-blocked');
  });

  it('maps overdue items', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({
        state: {
          ...createBicItem().state,
          isOverdue: true,
          dueDate: '2026-01-10T00:00:00.000Z',
        },
      })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].isOverdue).toBe(true);
    expect(items[0].dueDateIso).toBe('2026-01-10T00:00:00.000Z');
  });

  it('maps owner from currentOwner', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({
        state: {
          ...createBicItem().state,
          currentOwner: createBicOwner({ userId: 'u-42', displayName: 'Bob Jones' }),
          previousOwner: createBicOwner({ userId: 'u-41', displayName: 'Alice Wong' }),
        },
      })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].owner).toEqual({ type: 'user', id: 'u-42', label: 'Bob Jones' });
    expect(items[0].previousOwner).toEqual({ type: 'user', id: 'u-41', label: 'Alice Wong' });
  });

  it('builds correct dedupeKey format', async () => {
    mockExecute.mockResolvedValue({
      items: [createBicItem({ itemKey: 'abc-123', moduleKey: 'bd-scorecard' })],
      failedModules: [],
    });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].dedupeKey).toBe('bd-scorecard::bic-item::abc-123');
    expect(items[0].workItemId).toBe('bic-next-move::abc-123');
    expect(items[0].canonicalKey).toBe('bd-scorecard::abc-123');
  });

  it('returns empty array when no items', async () => {
    mockExecute.mockResolvedValue({ items: [], failedModules: [] });

    const items = await bicAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toEqual([]);
  });

  it('filters by moduleKeys when provided in query', async () => {
    mockExecute.mockResolvedValue({
      items: [
        createBicItem({ itemKey: 'a', moduleKey: 'bd-scorecard' }),
        createBicItem({ itemKey: 'b', moduleKey: 'other-module' }),
      ],
      failedModules: [],
    });

    const items = await bicAdapter.load(
      createMockMyWorkQuery({ moduleKeys: ['bd-scorecard'] }),
      createMockRuntimeContext(),
    );
    expect(items).toHaveLength(1);
    expect(items[0].context.moduleKey).toBe('bd-scorecard');
  });

  it('passes currentUserId to executeBicFanOut', async () => {
    mockExecute.mockResolvedValue({ items: [], failedModules: [] });

    await bicAdapter.load(
      createMockMyWorkQuery(),
      createMockRuntimeContext({ currentUserId: 'user-xyz' }),
    );

    expect(mockExecute).toHaveBeenCalledWith('user-xyz');
  });
});
