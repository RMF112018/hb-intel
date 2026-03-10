# SF06-T04 — Hooks

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold), T02 (contracts), T03 (diff engine), T07 (VersionApi — must be complete before hooks are tested against real API)
**Blocks:** T05 (`HbcVersionHistory`), T06 (`HbcVersionDiff`)

---

## Objective

Implement all three React hooks: `useVersionHistory`, `useVersionSnapshot`, and `useVersionDiff`. All hooks follow the platform signature pattern `use{Name}<T>(config, ...args)`. Each hook is independently testable against mock API responses.

---

## Hook Signatures

```typescript
// Metadata-first version list — D-06
function useVersionHistory<T>(
  recordType: string,
  recordId: string,
  config: IVersionedRecordConfig<T>
): IUseVersionHistoryResult;

// On-demand full snapshot loader
function useVersionSnapshot<T>(
  snapshotId: string | null
): IUseVersionSnapshotResult<T>;

// Deferred client-side diff — D-05
function useVersionDiff<T>(
  recordType: string,
  recordId: string,
  versionA: number,
  versionB: number,
  config: IVersionedRecordConfig<T>
): IUseVersionDiffResult;
```

---

## File: `src/hooks/useVersionHistory.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { VersionApi } from '../api/VersionApi';
import { filterMetadataForDisplay, countSupersededVersions } from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
  IVersionMetadata,
  IUseVersionHistoryResult,
} from '../types';

/**
 * Loads the metadata-first version list for a record (D-06).
 * Fetches all version metadata rows (no snapshot payloads) in a single query.
 * Provides `showSuperseded` toggle to reveal/hide versions tagged 'superseded' (D-03).
 */
export function useVersionHistory<T>(
  recordType: string,
  recordId: string,
  config: IVersionedRecordConfig<T>
): IUseVersionHistoryResult {
  const [allMetadata, setAllMetadata] = useState<IVersionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showSuperseded, setShowSuperseded] = useState(false);

  const load = useCallback(async () => {
    if (!recordType || !recordId) return;
    setIsLoading(true);
    setError(null);
    try {
      const rows = await VersionApi.getMetadataList(recordType, recordId);
      // Newest first
      setAllMetadata([...rows].sort((a, b) => b.version - a.version));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [recordType, recordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleMetadata = filterMetadataForDisplay(allMetadata, showSuperseded);
  const hasSuperseded = countSupersededVersions(allMetadata) > 0;

  return {
    metadata: visibleMetadata,
    isLoading,
    error,
    showSuperseded,
    // Only expose the setter when there are actually superseded versions to show
    setShowSuperseded: hasSuperseded ? setShowSuperseded : () => undefined,
    refresh: load,
  };
}
```

---

## File: `src/hooks/useVersionSnapshot.ts`

```typescript
import { useState, useEffect } from 'react';
import { VersionApi } from '../api/VersionApi';
import type { IVersionSnapshot, IUseVersionSnapshotResult } from '../types';

/**
 * Loads a full version snapshot on demand by snapshotId (D-06).
 * Called when the user selects a version in `HbcVersionHistory` or
 * when `useVersionDiff` needs to retrieve both comparison payloads.
 * Pass `null` to skip fetching (hook returns idle state).
 */
export function useVersionSnapshot<T>(
  snapshotId: string | null
): IUseVersionSnapshotResult<T> {
  const [snapshot, setSnapshot] = useState<IVersionSnapshot<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!snapshotId) {
      setSnapshot(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    VersionApi.getSnapshotById<T>(snapshotId)
      .then((result) => {
        if (!cancelled) setSnapshot(result);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [snapshotId]);

  return { snapshot, isLoading, error };
}
```

---

## File: `src/hooks/useVersionDiff.ts`

```typescript
import { useState, useEffect, useMemo } from 'react';
import { VersionApi } from '../api/VersionApi';
import { computeDiff } from '../engine/diffEngine';
import { findMetadataByVersion } from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
  IVersionSnapshot,
  IVersionMetadata,
  IVersionDiff,
  IUseVersionDiffResult,
} from '../types';

/**
 * Computes a field-level diff between two version snapshots (D-05).
 *
 * Loading sequence:
 * 1. Fetch both full snapshots in parallel via `VersionApi.getSnapshot`.
 * 2. Fetch metadata list (needed for metadata display in the diff header).
 * 3. In a deferred `useEffect`, run `diffEngine.computeDiff()` off the
 *    synchronous rendering path to avoid main-thread blocking on large records.
 *
 * `isComputing` is true during both the fetch and the diff computation phases.
 */
export function useVersionDiff<T>(
  recordType: string,
  recordId: string,
  versionA: number,
  versionB: number,
  config: IVersionedRecordConfig<T>
): IUseVersionDiffResult {
  const [snapshotA, setSnapshotA] = useState<IVersionSnapshot<T> | null>(null);
  const [snapshotB, setSnapshotB] = useState<IVersionSnapshot<T> | null>(null);
  const [metadataList, setMetadataList] = useState<IVersionMetadata[]>([]);
  const [diffs, setDiffs] = useState<IVersionDiff[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Phase 1: fetch both snapshots + metadata list in parallel
  useEffect(() => {
    if (!recordType || !recordId || versionA <= 0 || versionB <= 0) return;
    if (versionA === versionB) {
      setDiffs([]);
      return;
    }

    let cancelled = false;
    setIsFetching(true);
    setError(null);
    setDiffs([]);

    Promise.all([
      VersionApi.getSnapshot<T>(recordType, recordId, versionA),
      VersionApi.getSnapshot<T>(recordType, recordId, versionB),
      VersionApi.getMetadataList(recordType, recordId),
    ])
      .then(([snapA, snapB, meta]) => {
        if (cancelled) return;
        setSnapshotA(snapA);
        setSnapshotB(snapB);
        setMetadataList(meta);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recordType, recordId, versionA, versionB]);

  // Phase 2: deferred diff computation — runs after snapshots are loaded (D-05)
  useEffect(() => {
    if (!snapshotA || !snapshotB) return;

    setIsComputing(true);

    // Use a microtask to defer computation off the synchronous render path
    const handle = setTimeout(() => {
      try {
        const excludeFields = (config.excludeFields ?? []) as string[];
        const result = computeDiff(
          snapshotA.snapshot as Record<string, unknown>,
          snapshotB.snapshot as Record<string, unknown>,
          excludeFields
        );
        setDiffs(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsComputing(false);
      }
    }, 0);

    return () => clearTimeout(handle);
  }, [snapshotA, snapshotB, config.excludeFields]);

  const metadataA = useMemo(
    () => findMetadataByVersion(metadataList, versionA) ?? null,
    [metadataList, versionA]
  );

  const metadataB = useMemo(
    () => findMetadataByVersion(metadataList, versionB) ?? null,
    [metadataList, versionB]
  );

  return {
    diffs,
    isComputing: isFetching || isComputing,
    error,
    metadataA,
    metadataB,
  };
}
```

---

## File: `src/hooks/index.ts`

```typescript
export { useVersionHistory } from './useVersionHistory';
export { useVersionSnapshot } from './useVersionSnapshot';
export { useVersionDiff } from './useVersionDiff';
```

---

## Representative Unit Tests

```typescript
// src/hooks/__tests__/useVersionHistory.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionHistory } from '../useVersionHistory';
import { VersionApi } from '../../api/VersionApi';
import type { IVersionMetadata } from '../../types';

vi.mock('../../api/VersionApi');

const makeMetadata = (version: number, tag: IVersionMetadata['tag']): IVersionMetadata => ({
  snapshotId: `snap-${version}`,
  version,
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
  changeSummary: `v${version}`,
  tag,
});

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

describe('useVersionHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads metadata list and sorts newest first', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'submitted'),
      makeMetadata(3, 'approved'),
      makeMetadata(2, 'rejected'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.metadata[0]?.version).toBe(3);
    expect(result.current.metadata[2]?.version).toBe(1);
  });

  it('hides superseded versions by default', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'approved'),
      makeMetadata(2, 'superseded'),
      makeMetadata(3, 'submitted'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metadata).toHaveLength(2);
  });

  it('shows superseded versions when showSuperseded is toggled', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'approved'),
      makeMetadata(2, 'superseded'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setShowSuperseded(true));
    expect(result.current.metadata).toHaveLength(2);
  });

  it('sets error on API failure', async () => {
    vi.mocked(VersionApi.getMetadataList).mockRejectedValue(new Error('SP error'));

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('SP error');
  });

  it('refresh() re-fetches the list', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([makeMetadata(1, 'draft')]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'draft'),
      makeMetadata(2, 'submitted'),
    ]);

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.metadata).toHaveLength(2));
  });
});

// src/hooks/__tests__/useVersionSnapshot.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionSnapshot } from '../useVersionSnapshot';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

describe('useVersionSnapshot', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns null when snapshotId is null (idle)', () => {
    const { result } = renderHook(() => useVersionSnapshot(null));
    expect(result.current.snapshot).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches snapshot by id', async () => {
    const mockSnap = { snapshotId: 'snap-1', version: 1, snapshot: { score: 42 } };
    vi.mocked(VersionApi.getSnapshotById).mockResolvedValue(mockSnap as never);

    const { result } = renderHook(() => useVersionSnapshot('snap-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.snapshot).toEqual(mockSnap);
  });

  it('cancels in-flight request on snapshotId change', async () => {
    vi.mocked(VersionApi.getSnapshotById).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useVersionSnapshot<{ score: number }>(id),
      { initialProps: { id: 'snap-1' } }
    );

    rerender({ id: null });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.snapshot).toBeNull();
  });
});

// src/hooks/__tests__/useVersionDiff.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionDiff } from '../useVersionDiff';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

describe('useVersionDiff', () => {
  beforeEach(() => vi.resetAllMocks());

  it('computes diff between two snapshots', async () => {
    const snapA = { snapshotId: 'a', version: 1, snapshot: { score: 42, name: 'Alpha' } };
    const snapB = { snapshotId: 'b', version: 2, snapshot: { score: 67, name: 'Alpha' } };

    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (snapA as never) : (snapB as never)
    );
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 1, 2, mockConfig)
    );

    await waitFor(() => expect(result.current.isComputing).toBe(false));

    expect(result.current.diffs).toHaveLength(1);
    expect(result.current.diffs[0]?.fieldName).toBe('score');
    expect(result.current.diffs[0]?.numericDelta).toBe('+25');
  });

  it('returns empty diffs when versionA === versionB', async () => {
    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 2, 2, mockConfig)
    );
    await waitFor(() => expect(result.current.isComputing).toBe(false));
    expect(result.current.diffs).toHaveLength(0);
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(VersionApi.getSnapshot).mockRejectedValue(new Error('Fetch failed'));
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 1, 2, mockConfig)
    );

    await waitFor(() => expect(result.current.isComputing).toBe(false));
    expect(result.current.error?.message).toBe('Fetch failed');
  });
});
```

---

## Cross-Package Wiring Notes

**`@hbc/session-state`** — Hooks do not read from or write to `@hbc/session-state`. Draft state is the consuming module's concern; `@hbc/versioned-record` only manages committed version snapshots (D-08).

**`@hbc/complexity`** — Hooks have no complexity dependency. Complexity integration is handled at the component layer (T05, T06).

**`@hbc/notification-intelligence`** — Hooks do not call `NotificationApi.send()`. Notifications fire inside `VersionApi.createSnapshot()` (T07), not in hooks.

---

## Verification Commands

```bash
cd packages/versioned-record

# Run all hook tests
pnpm test -- --reporter=verbose src/hooks/__tests__/

# TypeScript strict check
pnpm typecheck
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF06-T04 completed: 2026-03-10
- Replaced 3 hook stubs with full implementations (useVersionHistory, useVersionSnapshot, useVersionDiff)
- Added typed method signatures to VersionApi stub (getMetadataList, getSnapshot, getSnapshotById)
- Created 3 test files with 11 tests total — all passing
- Full monorepo gates: build 30/30, check-types 38/38, lint clean, 67 package tests passing
- Minor deviations from spec: prefixed unused `config` param with underscore in useVersionHistory; used `as unknown as string[]` cast for excludeFields in useVersionDiff
Next: T05 (HbcVersionHistory component)
-->
