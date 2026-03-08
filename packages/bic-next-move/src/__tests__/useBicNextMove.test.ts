import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolveFullBicState, useBicNextMove } from '../hooks/useBicNextMove';
import { createMockBicConfig } from '@hbc/bic-next-move/testing';
import type { MockBicItem } from '@hbc/bic-next-move/testing';

// ── Base mock item ──────────────────────────────────────────────────────────
function makeMockItem(overrides?: Partial<MockBicItem>): MockBicItem {
  return {
    id: 'item-001',
    currentOwnerId: 'u-alice',
    currentOwnerName: 'Alice Chen',
    currentOwnerRole: 'BD Manager',
    previousOwnerId: null,
    previousOwnerName: null,
    nextOwnerId: 'u-bob',
    nextOwnerName: 'Bob Torres',
    escalationOwnerId: 'u-vp',
    escalationOwnerName: 'David Park',
    expectedAction: 'Complete scorecard and submit for review',
    dueDate: null,
    isBlocked: false,
    blockedReason: null,
    transferHistory: [],
    ...overrides,
  };
}

describe('resolveFullBicState', () => {

  describe('urgency tier computation (D-01)', () => {
    it('returns "upcoming" when dueDate is null', () => {
      const state = resolveFullBicState(makeMockItem({ dueDate: null }), createMockBicConfig());
      expect(state.urgencyTier).toBe('upcoming');
    });

    it('returns "upcoming" when due > 3 business days away', () => {
      const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('upcoming');
    });

    it('returns "watch" when due within 3 business days', () => {
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('watch');
    });

    it('returns "immediate" when due today', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const state = resolveFullBicState(makeMockItem({ dueDate: today.toISOString() }), createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
    });

    it('returns "immediate" when overdue', () => {
      const dueDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
      expect(state.isOverdue).toBe(true);
    });

    it('respects custom watchThresholdDays override (D-01)', () => {
      const dueDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();
      const config = createMockBicConfig({ urgencyThresholds: { watchThresholdDays: 10 } });
      const state = resolveFullBicState(makeMockItem({ dueDate }), config);
      expect(state.urgencyTier).toBe('watch'); // 8 days < 10-day threshold
    });

    it('respects custom immediateThresholdDays override (D-01)', () => {
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const config = createMockBicConfig({ urgencyThresholds: { immediateThresholdDays: 3 } });
      const state = resolveFullBicState(makeMockItem({ dueDate }), config);
      expect(state.urgencyTier).toBe('immediate'); // 2 days <= 3-day immediate threshold
    });
  });

  describe('null owner state (D-04)', () => {
    it('forces urgencyTier to "immediate" when currentOwner is null', () => {
      const item = makeMockItem({
        currentOwnerId: null,
        currentOwnerName: null,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days away
      });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.currentOwner).toBeNull();
      expect(state.urgencyTier).toBe('immediate');
    });

    it('sets urgencyTier to "immediate" even when dueDate is null and owner is null', () => {
      const item = makeMockItem({ currentOwnerId: null, currentOwnerName: null, dueDate: null });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
    });
  });

  describe('blocked state', () => {
    it('sets isBlocked and blockedReason correctly', () => {
      const item = makeMockItem({ isBlocked: true, blockedReason: 'Waiting on drawings' });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.isBlocked).toBe(true);
      expect(state.blockedReason).toBe('Waiting on drawings');
    });

    it('sets blockedReason to null when not blocked', () => {
      const item = makeMockItem({ isBlocked: false, blockedReason: 'Should be ignored' });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.blockedReason).toBeNull();
    });
  });

  describe('transfer history (D-08)', () => {
    it('returns empty array when resolveTransferHistory is absent', () => {
      const state = resolveFullBicState(makeMockItem(), createMockBicConfig());
      expect(state.transferHistory).toEqual([]);
    });

    it('returns resolved history when resolveTransferHistory is present', () => {
      const config = createMockBicConfig({
        resolveTransferHistory: () => [
          { fromOwner: null, toOwner: { userId: 'u1', displayName: 'Alice', role: 'PM' }, transferredAt: '2026-01-01T00:00:00Z', action: 'Created' },
        ],
      });
      const state = resolveFullBicState(makeMockItem(), config);
      expect(state.transferHistory).toHaveLength(1);
      expect(state.transferHistory[0].action).toBe('Created');
    });
  });

  describe('ownership chain resolution', () => {
    it('resolves previousOwner, nextOwner, and escalationOwner', () => {
      const item = makeMockItem({
        previousOwnerId: 'u-prev',
        previousOwnerName: 'Prev Person',
        nextOwnerId: 'u-next',
        nextOwnerName: 'Next Person',
        escalationOwnerId: 'u-esc',
        escalationOwnerName: 'Esc Person',
      });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.previousOwner?.userId).toBe('u-prev');
      expect(state.nextOwner?.userId).toBe('u-next');
      expect(state.escalationOwner?.userId).toBe('u-esc');
    });

    it('returns null for absent chain members', () => {
      const item = makeMockItem({
        previousOwnerId: null,
        previousOwnerName: null,
        nextOwnerId: null,
        nextOwnerName: null,
        escalationOwnerId: null,
        escalationOwnerName: null,
      });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.previousOwner).toBeNull();
      expect(state.nextOwner).toBeNull();
      expect(state.escalationOwner).toBeNull();
    });
  });

  describe('expectedAction resolution', () => {
    it('resolves expectedAction from config', () => {
      const item = makeMockItem({ expectedAction: 'Review and approve' });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.expectedAction).toBe('Review and approve');
    });
  });
});

// ── Hook-level tests ──────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useBicNextMove hook', () => {
  it('returns resolved state via TanStack Query', async () => {
    const item = makeMockItem();
    const config = createMockBicConfig();

    const { result } = renderHook(
      () => useBicNextMove(item, config, { itemKey: 'test::001' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.state).toBeDefined();
    expect(result.current.state?.currentOwner?.displayName).toBe('Alice Chen');
  });

  it('returns undefined state when disabled', () => {
    const item = makeMockItem();
    const config = createMockBicConfig();

    const { result } = renderHook(
      () => useBicNextMove(item, config, { itemKey: 'test::002', enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.state).toBeUndefined();
  });

  it('does not error on initial mount', async () => {
    const item = makeMockItem();
    const config = createMockBicConfig();

    const { result } = renderHook(
      () => useBicNextMove(item, config, { itemKey: 'test::003' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
  });

  it('does not fire transfer on first mount (initial render is not a transfer)', async () => {
    const handler = vi.fn();
    window.addEventListener('hbc:bic-transfer', handler);

    const { result } = renderHook(
      () => useBicNextMove(
        makeMockItem(),
        createMockBicConfig(),
        { itemKey: 'test::no-initial-transfer' }
      ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // No transfer event on initial mount
    expect(handler).not.toHaveBeenCalled();
    window.removeEventListener('hbc:bic-transfer', handler);
  });

  it('resolves state for null owner via hook', async () => {
    const item = makeMockItem({ currentOwnerId: null, currentOwnerName: null });

    const { result } = renderHook(
      () => useBicNextMove(item, createMockBicConfig(), { itemKey: 'test::null-owner-hook' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.state?.currentOwner).toBeNull();
    expect(result.current.state?.urgencyTier).toBe('immediate');
  });
});
