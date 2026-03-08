# SF04-T03 — Hooks: `useAcknowledgment` + `useAcknowledgmentGate`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (bypass enforcement), D-02 (optimistic + offline queue), D-05 (fetch strategy), D-06 (client-side callback scope), D-09 (decline blocks)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 2

---

## Objective

Implement the two hooks that power all acknowledgment interactions: `useAcknowledgment` (state loading, mutation, optimistic update, offline queue) and `useAcknowledgmentGate` (current user eligibility across all three modes).

---

## 3-Line Plan

1. Implement `useAcknowledgment` with TanStack Query fetch (D-05), optimistic `onMutate`/`onError` (D-02), and network-failure offline queue routing.
2. Implement `useAcknowledgmentGate` as a thin selector over `useAcknowledgment` state.
3. Verify all mode branches (single, parallel, sequential) and bypass path (D-01) with unit tests.

---

## `src/hooks/useAcknowledgment.ts`

```typescript
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useSessionStateQueue } from '@hbc/session-state';
import {
  deriveAcknowledgmentState,
  isNetworkFailure,
} from '../utils/acknowledgmentLogic';
import type {
  AckContextType,
  IAcknowledgmentState,
  ISubmitAcknowledgmentParams,
  ISubmitAcknowledgmentRequest,
  ISubmitAcknowledgmentResponse,
  IUseAcknowledgmentReturn,
} from '../types';
import type { IAcknowledgmentConfig } from '../types/IAcknowledgment';

// ─── Query Key Factory ───────────────────────────────────────────────────────

export const ackKeys = {
  all: ['acknowledgments'] as const,
  detail: (contextType: AckContextType, contextId: string): QueryKey =>
    ['acknowledgments', contextType, contextId] as const,
};

// ─── API Calls ───────────────────────────────────────────────────────────────

async function fetchAcknowledgmentState(
  contextType: AckContextType,
  contextId: string
): Promise<IAcknowledgmentState> {
  const res = await fetch(
    `/api/acknowledgments?contextType=${contextType}&contextId=${contextId}`
  );
  if (!res.ok) throw res;
  return res.json();
}

async function postAcknowledgment(
  body: ISubmitAcknowledgmentRequest
): Promise<ISubmitAcknowledgmentResponse> {
  const res = await fetch('/api/acknowledgments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw res;
  return res.json();
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAcknowledgment<T>(
  config: IAcknowledgmentConfig<T>,
  contextId: string,
  currentUserId: string
): IUseAcknowledgmentReturn {
  const queryClient = useQueryClient();
  const offlineQueue = useSessionStateQueue('acknowledgments'); // D-02

  const queryKey = ackKeys.detail(config.contextType, contextId);

  // ── Fetch (D-05) ──────────────────────────────────────────────────────────
  const { data: state, isLoading, isError } = useQuery<IAcknowledgmentState>({
    queryKey,
    queryFn: () => fetchAcknowledgmentState(config.contextType, contextId),
    staleTime: 30_000,           // D-05
    refetchOnWindowFocus: true,  // D-05
    refetchInterval: 60_000,     // D-05 — critical for sequential mode awareness
  });

  // ── Mutation ─────────────────────────────────────────────────────────────
  const { mutateAsync: submitMutation, isPending: isSubmitting } = useMutation<
    ISubmitAcknowledgmentResponse,
    unknown,
    ISubmitAcknowledgmentParams
  >({
    mutationFn: (params) => {
      const body: ISubmitAcknowledgmentRequest = {
        contextType: config.contextType,
        contextId,
        partyUserId: currentUserId,
        status: params.status,
        declineReason: params.declineReason,
        declineCategory: params.declineCategory,
        acknowledgedAt: new Date().toISOString(), // D-02: client timestamp
        bypassSequentialOrder: params.bypassSequentialOrder, // D-01
      };
      return postAcknowledgment(body);
    },

    // ── Optimistic update (D-02) ────────────────────────────────────────────
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<IAcknowledgmentState>(queryKey);

      if (snapshot) {
        const optimisticEvent = {
          partyUserId: currentUserId,
          partyDisplayName: '(you)',
          status: params.status,
          acknowledgedAt: new Date().toISOString(),
          declineReason: params.declineReason,
          declineCategory: params.declineCategory,
          bypassSequentialOrder: params.bypassSequentialOrder,
          isPendingSync: false,
        };
        const optimisticEvents = [
          ...snapshot.events.filter((e) => e.partyUserId !== currentUserId),
          optimisticEvent,
        ];
        const parties = config.resolveParties(undefined as unknown as T);
        const optimisticState = deriveAcknowledgmentState(
          snapshot.config,
          parties,
          optimisticEvents
        );
        queryClient.setQueryData<IAcknowledgmentState>(queryKey, optimisticState);
      }

      return { snapshot };
    },

    onSuccess: (response) => {
      // Invalidate to fetch authoritative server state (D-02)
      queryClient.invalidateQueries({ queryKey });

      // Fire client-side callback for UI effects only (D-06)
      if (response.isComplete && config.onAllAcknowledged) {
        config.onAllAcknowledged(
          undefined as unknown as T,
          response.updatedState.events
        );
      }
    },

    onError: async (error, params, context) => {
      if (isNetworkFailure(error)) {
        // Network failure → offline queue (D-02)
        const body: ISubmitAcknowledgmentRequest = {
          contextType: config.contextType,
          contextId,
          partyUserId: currentUserId,
          status: params.status,
          declineReason: params.declineReason,
          declineCategory: params.declineCategory,
          acknowledgedAt: new Date().toISOString(),
          bypassSequentialOrder: params.bypassSequentialOrder,
        };
        await offlineQueue.enqueue({
          endpoint: '/api/acknowledgments',
          method: 'POST',
          body,
        });

        // Mark optimistic event as pending sync (D-02)
        const current = queryClient.getQueryData<IAcknowledgmentState>(queryKey);
        if (current) {
          const updated: IAcknowledgmentState = {
            ...current,
            events: current.events.map((e) =>
              e.partyUserId === currentUserId
                ? { ...e, isPendingSync: true }
                : e
            ),
          };
          queryClient.setQueryData<IAcknowledgmentState>(queryKey, updated);
        }
      } else {
        // Logical failure → rollback (D-02)
        if (context?.snapshot) {
          queryClient.setQueryData<IAcknowledgmentState>(queryKey, context.snapshot);
        }
      }
    },

    onSettled: () => {
      // Always re-sync from server after any mutation attempt
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const submit = async (params: ISubmitAcknowledgmentParams): Promise<void> => {
    await submitMutation(params);
  };

  return { state, isLoading, isError, submit, isSubmitting };
}
```

---

## `src/hooks/useAcknowledgmentGate.ts`

```typescript
import type {
  IAcknowledgmentConfig,
  IAcknowledgmentState,
  IUseAcknowledgmentGateReturn,
} from '../types';

/**
 * Determines whether the current user can acknowledge — and whether it is their turn.
 * Pure selector over IAcknowledgmentState — does not fetch independently.
 *
 * Mode logic:
 * - single:     canAcknowledge if user is the listed party and status is pending
 * - parallel:   canAcknowledge if user is a required party, pending, and state is not declined
 * - sequential: canAcknowledge ONLY if user is the currentSequentialParty (D-01)
 */
export function useAcknowledgmentGate<T>(
  config: IAcknowledgmentConfig<T>,
  state: IAcknowledgmentState | undefined,
  item: T,
  currentUserId: string
): IUseAcknowledgmentGateReturn {
  if (!state) {
    return { canAcknowledge: false, isCurrentTurn: false, party: null };
  }

  const parties = config.resolveParties(item);
  const party = parties.find((p) => p.userId === currentUserId) ?? null;

  if (!party) {
    return { canAcknowledge: false, isCurrentTurn: false, party: null };
  }

  const existingEvent = state.events.find((e) => e.partyUserId === currentUserId);
  const alreadyActed =
    existingEvent?.status === 'acknowledged' ||
    existingEvent?.status === 'declined' ||
    existingEvent?.status === 'bypassed';

  // Workflow is blocked by a decline — no further acknowledgments possible (D-09)
  if (state.overallStatus === 'declined') {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  // Workflow is already complete
  if (state.isComplete) {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  if (alreadyActed) {
    return { canAcknowledge: false, isCurrentTurn: false, party };
  }

  if (config.mode === 'sequential') {
    // Sequential: only the currentSequentialParty can act (D-01)
    const isCurrentTurn =
      state.currentSequentialParty?.userId === currentUserId;
    return {
      canAcknowledge: isCurrentTurn && party.required,
      isCurrentTurn,
      party,
    };
  }

  // single / parallel: any pending required party can act
  const isCurrentTurn = party.required;
  return {
    canAcknowledge: party.required,
    isCurrentTurn,
    party,
  };
}
```

---

## Gate Logic Truth Table

| Mode | User is party | Required | Already acted | State is declined | Is current turn (sequential) | canAcknowledge |
|---|---|---|---|---|---|---|
| single | ✓ | ✓ | ✗ | ✗ | N/A | **true** |
| single | ✓ | ✓ | ✓ | ✗ | N/A | false |
| single | ✗ | — | — | — | N/A | false |
| parallel | ✓ | ✓ | ✗ | ✗ | N/A | **true** |
| parallel | ✓ | ✓ | ✗ | ✓ | N/A | false (D-09) |
| parallel | ✓ | ✗ | ✗ | ✗ | N/A | false (optional party) |
| sequential | ✓ | ✓ | ✗ | ✗ | ✓ | **true** |
| sequential | ✓ | ✓ | ✗ | ✗ | ✗ | false (not their turn) |
| sequential | ✓ | ✓ | ✗ | ✓ | ✓ | false (D-09) |

---

## Unit Tests (Representative)

```typescript
// src/hooks/__tests__/useAcknowledgmentGate.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAcknowledgmentGate } from '../useAcknowledgmentGate';
import { createMockAckConfig, mockAckStates } from '@hbc/acknowledgment/testing';

describe('useAcknowledgmentGate', () => {
  const config = createMockAckConfig({ mode: 'sequential' });
  const PARTY_1_ID = 'user-1';
  const PARTY_2_ID = 'user-2';

  it('returns canAcknowledge true for sequential current party', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(config, mockAckStates.pending, undefined, PARTY_1_ID)
    );
    expect(result.current.canAcknowledge).toBe(true);
    expect(result.current.isCurrentTurn).toBe(true);
  });

  it('returns canAcknowledge false for sequential non-current party', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(config, mockAckStates.pending, undefined, PARTY_2_ID)
    );
    expect(result.current.canAcknowledge).toBe(false);
    expect(result.current.isCurrentTurn).toBe(false);
  });

  it('returns canAcknowledge false when state is declined (D-09)', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(config, mockAckStates.declined, undefined, PARTY_1_ID)
    );
    expect(result.current.canAcknowledge).toBe(false);
  });

  it('returns canAcknowledge false when already acted', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(
        createMockAckConfig({ mode: 'parallel' }),
        mockAckStates.partialParallel,
        undefined,
        PARTY_1_ID // already acknowledged in partialParallel state
      )
    );
    expect(result.current.canAcknowledge).toBe(false);
  });

  it('returns canAcknowledge false for non-party user', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(config, mockAckStates.pending, undefined, 'user-999')
    );
    expect(result.current.canAcknowledge).toBe(false);
    expect(result.current.party).toBeNull();
  });

  it('returns canAcknowledge false when isComplete', () => {
    const { result } = renderHook(() =>
      useAcknowledgmentGate(config, mockAckStates.complete, undefined, PARTY_1_ID)
    );
    expect(result.current.canAcknowledge).toBe(false);
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/acknowledgment typecheck
pnpm --filter @hbc/acknowledgment test -- --reporter=verbose hooks/
```
