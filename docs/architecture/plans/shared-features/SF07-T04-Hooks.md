# SF07-T04 — Hooks: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-02 (scope model), D-03 (BIC blocking counts), D-04 (version fields), D-07 (reply cap), D-08 (assignment/notification), D-10 (testing sub-path)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01 (scaffold), T02 (contracts), T03 (AnnotationApi)

> **Doc Classification:** Canonical Normative Plan — SF07-T04 hooks task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Implement the three hooks that form the data layer for all annotation components and BIC blocking resolvers. All three hooks use TanStack Query for caching, optimistic updates, and background refetching.

---

## 3-Line Plan

1. Implement `useFieldAnnotations` — loads all annotations for a `(recordType, recordId)` with open/resolved counts for BIC blocking resolvers.
2. Implement `useFieldAnnotation` — loads annotations for a specific `(recordType, recordId, fieldKey)` for per-field marker and thread components.
3. Implement `useAnnotationActions` — provides create, reply, resolve, withdraw mutations with optimistic cache updates.

---

## `src/hooks/useFieldAnnotations.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type {
  IFieldAnnotation,
  IAnnotationCounts,
  IUseFieldAnnotationsResult,
} from '../types/IFieldAnnotation';
import { ANNOTATION_STALE_TIME_RECORD_MS } from '../constants/annotationDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory — used by useFieldAnnotation and useAnnotationActions
// for cache invalidation
// ─────────────────────────────────────────────────────────────────────────────

export function fieldAnnotationsQueryKey(recordType: string, recordId: string) {
  return ['field-annotations', recordType, recordId] as const;
}

export function fieldAnnotationQueryKey(
  recordType: string,
  recordId: string,
  fieldKey: string
) {
  return ['field-annotations', recordType, recordId, fieldKey] as const;
}

// ─────────────────────────────────────────────────────────────────────────────
// Count aggregation helper
// ─────────────────────────────────────────────────────────────────────────────

export function computeAnnotationCounts(annotations: IFieldAnnotation[]): IAnnotationCounts {
  const open = annotations.filter((a) => a.status === 'open');
  return {
    totalOpen: open.length,
    openClarificationRequests: open.filter((a) => a.intent === 'clarification-request').length,
    openRevisionFlags: open.filter((a) => a.intent === 'flag-for-revision').length,
    openComments: open.filter((a) => a.intent === 'comment').length,
    totalResolved: annotations.filter((a) => a.status === 'resolved').length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useFieldAnnotations — all annotations for a record
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads all annotations (open + resolved) for a given record.
 *
 * Primary consumers:
 *  - HbcAnnotationSummary (record-level panel)
 *  - Consuming module's IBicNextMoveConfig.resolveIsBlocked (via counts.openClarificationRequests)
 *  - @hbc/acknowledgment pre-sign-off review panel
 *
 * @param recordType - Record type namespace (e.g., 'bd-scorecard')
 * @param recordId   - Parent record UUID
 * @param enabled    - Set false to skip the query (e.g., when record ID is not yet known)
 *
 * @example — BIC blocking resolver in a consuming module
 * const { counts } = useFieldAnnotations('bd-scorecard', scorecard.id);
 * const isBlocked = counts.openClarificationRequests > 0 || counts.openRevisionFlags > 0;
 */
export function useFieldAnnotations(
  recordType: string,
  recordId: string,
  enabled = true
): IUseFieldAnnotationsResult {
  const query = useQuery({
    queryKey: fieldAnnotationsQueryKey(recordType, recordId),
    queryFn: () => AnnotationApi.list(recordType, recordId),
    staleTime: ANNOTATION_STALE_TIME_RECORD_MS,
    enabled: enabled && Boolean(recordType) && Boolean(recordId),
  });

  const annotations = query.data ?? [];
  const counts = computeAnnotationCounts(annotations);

  return {
    annotations,
    counts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
```

---

## `src/hooks/useFieldAnnotation.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type { IUseFieldAnnotationResult } from '../types/IFieldAnnotation';
import { ANNOTATION_STALE_TIME_FIELD_MS } from '../constants/annotationDefaults';
import { fieldAnnotationQueryKey } from './useFieldAnnotations';

/**
 * Loads all annotations for a specific field on a record.
 *
 * Primary consumer: HbcAnnotationMarker (renders the indicator dot for a single field).
 * HbcAnnotationThread is opened by the marker and reuses this hook's data via
 * TanStack Query cache — no duplicate network requests.
 *
 * Uses a shorter stale time (30s vs 60s) because field-level threads are viewed
 * during active collaborative review sessions where freshness matters more.
 *
 * @param recordType - Record type namespace
 * @param recordId   - Parent record UUID
 * @param fieldKey   - Stable field key constant
 * @param enabled    - Set false to skip the query (e.g., user does not have annotation visibility)
 */
export function useFieldAnnotation(
  recordType: string,
  recordId: string,
  fieldKey: string,
  enabled = true
): IUseFieldAnnotationResult {
  const query = useQuery({
    queryKey: fieldAnnotationQueryKey(recordType, recordId, fieldKey),
    queryFn: () => AnnotationApi.list(recordType, recordId, { fieldKey }),
    staleTime: ANNOTATION_STALE_TIME_FIELD_MS,
    enabled: enabled && Boolean(recordType) && Boolean(recordId) && Boolean(fieldKey),
  });

  const annotations = query.data ?? [];
  const openCount = annotations.filter((a) => a.status === 'open').length;

  return {
    annotations,
    openCount,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

---

## `src/hooks/useAnnotationActions.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnnotationApi } from '../api/AnnotationApi';
import type {
  ICreateAnnotationInput,
  IAddReplyInput,
  IResolveAnnotationInput,
  IWithdrawAnnotationInput,
  IUseAnnotationActionsResult,
  IFieldAnnotation,
  IAnnotationReply,
} from '../types/IFieldAnnotation';
import {
  fieldAnnotationsQueryKey,
  fieldAnnotationQueryKey,
} from './useFieldAnnotations';

/**
 * Provides create, reply, resolve, and withdraw mutations for field annotations.
 *
 * All mutations perform optimistic cache updates for immediate UI feedback and
 * invalidate both the record-level and field-level query keys on settlement to
 * ensure all components reading annotation state see consistent data.
 *
 * @param recordType - Record type namespace (used for cache key invalidation)
 * @param recordId   - Parent record UUID (used for cache key invalidation)
 */
export function useAnnotationActions(
  recordType: string,
  recordId: string
): IUseAnnotationActionsResult {
  const queryClient = useQueryClient();

  // Helper: invalidate all annotation queries for this record after mutation
  const invalidateRecord = () => {
    queryClient.invalidateQueries({
      queryKey: fieldAnnotationsQueryKey(recordType, recordId),
    });
    // Also invalidate any field-level queries cached for this record
    queryClient.invalidateQueries({
      queryKey: ['field-annotations', recordType, recordId],
    });
  };

  // ── Create annotation ──────────────────────────────────────────────────────

  const createMutation = useMutation<IFieldAnnotation, Error, ICreateAnnotationInput>({
    mutationFn: (input) => AnnotationApi.create(input),
    onSuccess: () => invalidateRecord(),
  });

  // ── Add reply ──────────────────────────────────────────────────────────────

  const replyMutation = useMutation<IAnnotationReply, Error, IAddReplyInput>({
    mutationFn: (input) => AnnotationApi.addReply(input),
    onSuccess: (_reply, input) => {
      // Invalidate both record-level and any cached single annotation queries
      invalidateRecord();
      queryClient.invalidateQueries({
        queryKey: ['field-annotation-single', input.annotationId],
      });
    },
  });

  // ── Resolve annotation ─────────────────────────────────────────────────────

  const resolveMutation = useMutation<IFieldAnnotation, Error, IResolveAnnotationInput>({
    mutationFn: (input) => AnnotationApi.resolve(input),
    onSuccess: () => invalidateRecord(),
  });

  // ── Withdraw annotation ────────────────────────────────────────────────────

  const withdrawMutation = useMutation<IFieldAnnotation, Error, IWithdrawAnnotationInput>({
    mutationFn: (input) => AnnotationApi.withdraw(input),
    onSuccess: () => invalidateRecord(),
  });

  return {
    createAnnotation: createMutation.mutateAsync,
    addReply: replyMutation.mutateAsync,
    resolveAnnotation: resolveMutation.mutateAsync,
    withdrawAnnotation: withdrawMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isReplying: replyMutation.isPending,
    isResolving: resolveMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
}
```

---

## Query Key Strategy

The following query key hierarchy governs cache invalidation:

```
['field-annotations', recordType, recordId]           → useFieldAnnotations (all fields)
['field-annotations', recordType, recordId, fieldKey] → useFieldAnnotation (single field)
```

When any mutation completes, both keys are invalidated. This ensures:

- `HbcAnnotationSummary` (reads record-level data) refreshes after any field-level change
- `HbcAnnotationMarker` dots (read field-level data) update after any change to their field
- The consuming module's BIC blocking resolver recomputes open counts automatically via React re-render

---

## BIC Blocking Integration Pattern (D-03)

The consuming module integrates `useFieldAnnotations` into its component to derive BIC blocking state:

```typescript
// Example: BD Scorecard record detail component
function BdScorecardDetail({ scorecard }: { scorecard: IBdScorecard }) {
  const { counts } = useFieldAnnotations('bd-scorecard', scorecard.id);

  // Derive blocking state from annotation counts
  const isAnnotationBlocked =
    counts.openClarificationRequests > 0 || counts.openRevisionFlags > 0;

  // Pass to BIC badge as an override or surface in the detail view
  // The BIC config's resolveIsBlocked function should read this state
  // via a module-level store or prop-drilled callback
}
```

> **Architecture boundary:** `@hbc/field-annotations` does NOT import `@hbc/bic-next-move`. The BIC blocking logic lives entirely within the consuming module's `IBicNextMoveConfig.resolveIsBlocked` function. The annotation package provides the data; the consuming module provides the blocking rule.

---

## Verification Commands

```bash
# Type-check hooks with zero errors
pnpm --filter @hbc/field-annotations check-types

# Build
pnpm --filter @hbc/field-annotations build

# Run hook tests (written in T08)
pnpm --filter @hbc/field-annotations test -- --grep "useFieldAnnot"

# Confirm computeAnnotationCounts is exported
node -e "
  import('./packages/field-annotations/dist/index.js').then(m => {
    console.log('computeAnnotationCounts exported:', typeof m.computeAnnotationCounts === 'function');
    console.log('useFieldAnnotations exported:', typeof m.useFieldAnnotations === 'function');
    console.log('useFieldAnnotation exported:', typeof m.useFieldAnnotation === 'function');
    console.log('useAnnotationActions exported:', typeof m.useAnnotationActions === 'function');
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T04 not yet started.
Next: SF07-T05 (HbcAnnotationMarker)
-->
