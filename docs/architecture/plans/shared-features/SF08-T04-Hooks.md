# SF08-T04 — Hooks: `@hbc/workflow-handoff`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`
**Decisions Applied:** D-02 (state machine), D-03 (pre-flight), D-04 (snapshot semantics), D-05 (BIC transfer), D-06 (document resolution), D-09 (generic types)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01 (scaffold), T02 (contracts), T03 (HandoffApi)

> **Doc Classification:** Canonical Normative Plan — SF08-T04 hooks task; sub-plan of `SF08-Workflow-Handoff.md`.

---

## Objective

Implement the three hooks that form the data layer for handoff composition, inbox monitoring, and outbound status tracking. All hooks use TanStack Query. `usePrepareHandoff` is the most complex — it orchestrates async document resolution and synchronous pre-flight validation.

---

## 3-Line Plan

1. Implement `usePrepareHandoff` — orchestrates package assembly (field mapping, async document resolution, pre-flight validation).
2. Implement `useHandoffInbox` — loads pending handoffs for the current user with count badge support.
3. Implement `useHandoffStatus` — tracks outbound handoff status with active polling when in `sent`/`received` state.

---

## Query Key Factory

```typescript
// src/hooks/handoffQueryKeys.ts

export const handoffQueryKeys = {
  inbox: () => ['workflow-handoff', 'inbox'] as const,
  outbox: () => ['workflow-handoff', 'outbox'] as const,
  package: (handoffId: string) => ['workflow-handoff', 'package', handoffId] as const,
  outboundBySource: (sourceRecordId: string) =>
    ['workflow-handoff', 'outbound', sourceRecordId] as const,
};
```

---

## `src/hooks/usePrepareHandoff.ts`

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  IHandoffConfig,
  IHandoffDocument,
  IHandoffContextNote,
  IPreflightResult,
  IPreflightCheck,
  IUsePrepareHandoffResult,
  IBicOwner,
} from '../types/IWorkflowHandoff';

/**
 * Assembles a handoff package from a source record and config.
 *
 * Assembly steps (D-03, D-04, D-06):
 * 1. Run pre-flight validation synchronously (D-03)
 * 2. Run mapSourceToDestination synchronously (D-04: frozen at assembly time)
 * 3. Run resolveDocuments asynchronously (D-06: async URL resolution)
 * 4. Run resolveRecipient synchronously
 *
 * The assembled package is held in component state — not persisted until the
 * sender calls HandoffApi.create() from HbcHandoffComposer Step 4 (send).
 *
 * @param sourceRecord - The current source record (should be stable; re-assembly on change)
 * @param config       - The handoff route configuration
 * @param currentUser  - The user composing the handoff (sender identity)
 * @param enabled      - Set false to skip assembly (e.g., until user opens the Composer)
 */
export function usePrepareHandoff<TSource, TDest>(
  sourceRecord: TSource | null,
  config: IHandoffConfig<TSource, TDest>,
  currentUser: IBicOwner,
  enabled = true
): IUsePrepareHandoffResult<TSource, TDest> {
  const [isAssembling, setIsAssembling] = useState(false);
  const [isError, setIsError] = useState(false);
  const [preflight, setPreflight] = useState<IPreflightResult | null>(null);
  const [assembledPackage, setAssembledPackage] = useState<
    IUsePrepareHandoffResult<TSource, TDest>['package']
  >(null);

  // Track whether a reassembly was requested
  const reassembleCount = useRef(0);

  const assemble = useCallback(async () => {
    if (!sourceRecord || !enabled) return;

    setIsAssembling(true);
    setIsError(false);

    try {
      // Step 1: Pre-flight validation (D-03 — synchronous)
      const blockingReason = config.validateReadiness(sourceRecord);
      const preflightResult: IPreflightResult = {
        isReady: blockingReason === null,
        blockingReason,
        checks: buildPreflightChecks(blockingReason),
      };
      setPreflight(preflightResult);

      // Step 2: Map source → destination seed data (D-04 — synchronous, frozen at this moment)
      const destinationSeedData = config.mapSourceToDestination(sourceRecord);

      // Step 3: Resolve documents (D-06 — async)
      let documents: IHandoffDocument[] = [];
      try {
        documents = await config.resolveDocuments(sourceRecord);
      } catch (err) {
        // Document resolution failure is non-fatal; proceed with empty list
        console.warn('[usePrepareHandoff] resolveDocuments failed:', err);
      }

      // Step 4: Resolve recipient (synchronous; null = sender must pick manually in Step 3)
      const recipient = config.resolveRecipient(sourceRecord);

      setAssembledPackage({
        sourceModule: config.sourceModule,
        sourceRecordType: config.sourceRecordType,
        sourceRecordId: (sourceRecord as { id?: string }).id ?? '',
        destinationModule: config.destinationModule,
        destinationRecordType: config.destinationRecordType,
        sourceSnapshot: sourceRecord,
        destinationSeedData,
        documents,
        contextNotes: [],    // Sender populates context notes in Composer Step 2
        sender: currentUser,
        recipient: recipient ?? currentUser, // Fallback; Composer Step 3 surfaces override if null
      });
    } catch (err) {
      console.error('[usePrepareHandoff] assembly error:', err);
      setIsError(true);
    } finally {
      setIsAssembling(false);
    }
  }, [sourceRecord, config, currentUser, enabled]);

  // Trigger assembly when source record or enabled state changes
  useEffect(() => {
    assemble();
  }, [assemble, reassembleCount.current]);

  const reassemble = useCallback(() => {
    reassembleCount.current += 1;
    assemble();
  }, [assemble]);

  return {
    package: assembledPackage,
    preflight,
    isAssembling,
    isError,
    reassemble,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Preflight check builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a blocking reason string into a structured check list for display
 * in HbcHandoffComposer Step 1.
 *
 * Real implementations may return multiple named checks by extending
 * IHandoffConfig with an optional `getPreflightChecks` method.
 * For the initial implementation, a single check is derived from validateReadiness.
 */
function buildPreflightChecks(blockingReason: string | null): IPreflightCheck[] {
  if (blockingReason === null) {
    return [
      { label: 'Record is ready for handoff', passed: true },
    ];
  }
  return [
    { label: blockingReason, passed: false },
  ];
}
```

---

## `src/hooks/useHandoffInbox.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { HandoffApi } from '../api/HandoffApi';
import type { IUseHandoffInboxResult } from '../types/IWorkflowHandoff';
import { HANDOFF_INBOX_STALE_TIME_MS } from '../constants/handoffDefaults';
import { handoffQueryKeys } from './handoffQueryKeys';

/**
 * Returns all pending handoff packages for the current user (as recipient).
 *
 * Primary consumers:
 * - My Work Feed (PH9b §A) — surfaces pending handoffs as high-priority items
 * - Navigation badges — shows pending handoff count in the app shell
 * - HbcHandoffReceiver — loaded when user opens a specific handoff from the inbox
 *
 * Returns only `sent` and `received` status packages (active inbox only).
 *
 * @param enabled - Set false when user is not authenticated or context is not ready
 */
export function useHandoffInbox<TSource = unknown, TDest = unknown>(
  enabled = true
): IUseHandoffInboxResult<TSource, TDest> {
  const query = useQuery({
    queryKey: handoffQueryKeys.inbox(),
    queryFn: () => HandoffApi.inbox<TSource, TDest>(),
    staleTime: HANDOFF_INBOX_STALE_TIME_MS,
    enabled,
  });

  const pending = query.data ?? [];

  return {
    pending,
    pendingCount: pending.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
```

---

## `src/hooks/useHandoffStatus.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { HandoffApi } from '../api/HandoffApi';
import type { IUseHandoffStatusResult } from '../types/IWorkflowHandoff';
import {
  HANDOFF_STATUS_STALE_TIME_MS,
  HANDOFF_STATUS_REFETCH_INTERVAL_MS,
} from '../constants/handoffDefaults';
import { handoffQueryKeys } from './handoffQueryKeys';

/**
 * Tracks the status of a specific outbound handoff package.
 *
 * Primary consumers:
 * - `HbcHandoffStatusBadge` — renders current status on the source record
 * - Sender detail views — shows "Awaiting Acknowledgment" status with recipient info
 *
 * Active polling: when status is `sent` or `received`, refetches every 30 seconds
 * to surface acknowledgment or rejection promptly. Polling stops when the package
 * reaches a terminal state (`acknowledged` or `rejected`).
 *
 * @param handoffId - The handoff package ID; null to skip the query
 */
export function useHandoffStatus<TSource = unknown, TDest = unknown>(
  handoffId: string | null
): IUseHandoffStatusResult<TSource, TDest> {
  const isTerminal = (status: string | null) =>
    status === 'acknowledged' || status === 'rejected';

  const query = useQuery({
    queryKey: handoffQueryKeys.package(handoffId ?? ''),
    queryFn: () => HandoffApi.get<TSource, TDest>(handoffId!),
    staleTime: HANDOFF_STATUS_STALE_TIME_MS,
    enabled: handoffId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? null;
      // Poll actively when waiting for recipient action; stop when terminal (D-02)
      if (!isTerminal(status) && (status === 'sent' || status === 'received')) {
        return HANDOFF_STATUS_REFETCH_INTERVAL_MS;
      }
      return false;
    },
  });

  return {
    package: query.data ?? null,
    status: query.data?.status ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
```

---

## Cache Invalidation Strategy

After any handoff state transition (send, acknowledge, reject), the calling component should invalidate the relevant query keys:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { handoffQueryKeys } from '@hbc/workflow-handoff';

// In a mutation's onSuccess handler:
queryClient.invalidateQueries({ queryKey: handoffQueryKeys.inbox() });
queryClient.invalidateQueries({ queryKey: handoffQueryKeys.outbox() });
queryClient.invalidateQueries({ queryKey: handoffQueryKeys.package(handoffId) });
```

---

## Verification Commands

```bash
pnpm --filter @hbc/workflow-handoff check-types
pnpm --filter @hbc/workflow-handoff build
pnpm --filter @hbc/workflow-handoff test -- --grep "usePrepareHandoff|useHandoffInbox|useHandoffStatus"

node -e "
  import('./packages/workflow-handoff/dist/index.js').then(m => {
    console.log('usePrepareHandoff:', typeof m.usePrepareHandoff === 'function');
    console.log('useHandoffInbox:', typeof m.useHandoffInbox === 'function');
    console.log('useHandoffStatus:', typeof m.useHandoffStatus === 'function');
    console.log('handoffQueryKeys:', typeof m.handoffQueryKeys === 'object');
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF08-T04 completed: 2026-03-10
- handoffQueryKeys.ts created: 4 query key functions (inbox, outbox, package, outboundBySource)
- usePrepareHandoff.ts: full implementation replacing stub; 4-step assembly (preflight → map → docs → recipient)
  - buildPreflightChecks helper (non-exported)
  - reassembleCount.current in useEffect deps kept per spec (functionally redundant but not harmful)
  - IHandoffContextNote import from spec omitted — unused (contextNotes typed by inference as never[])
- useHandoffInbox.ts: TanStack Query wrapper; staleTime 90s; returns pending, pendingCount, isLoading, isError, refetch
- useHandoffStatus.ts: TanStack Query wrapper; staleTime 30s; conditional refetchInterval 30s for sent/received; stops on terminal
- hooks/index.ts: added handoffQueryKeys export
- Verification: check-types ✓, build ✓, lint ✓ (--max-warnings 0), full workspace build (32/32) ✓
Next: SF08-T05 (HbcHandoffComposer)
-->
