/**
 * Wave 99 / Prompt 05A — useUnifiedLifecycleReadModel hook test suite.
 *
 * Mirrors `useTeamAccessReadModel.test.ts` (renderHook + waitFor +
 * vi.spyOn pattern) and re-uses the canonical
 * `SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE` fixture from `@hbc/models/pcc`.
 *
 * Hook contract:
 *   - state shape: discriminated wrapper
 *     ({ status: 'loading' } | { status: 'error', error }
 *      | { status: 'ready', viewModel })
 *   - calls only `client.getUnifiedLifecycle(projectId, viewerPersona?)`
 *   - converts the resolved envelope through
 *     `buildPccUnifiedLifecycleViewModel` (Prompt 04B aggregate)
 *   - envelope-level posture (source-unavailable, backend-unavailable,
 *     unauthorized, forbidden, missing-config, stale) flows through
 *     `state.viewModel.sourceStatus` / `cardState` on the `'ready'`
 *     branch — the hook's `'error'` is reserved for promise rejection
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type PccUnifiedLifecycleReadModel,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import {
  useUnifiedLifecycleReadModel,
  type IPccUnifiedLifecycleReadModelClient,
  type IUseUnifiedLifecycleReadModelState,
} from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;
const GENERATED_AT = '2026-05-03T00:00:00.000Z';

function envelope(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccUnifiedLifecycleReadModel = SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
): PccReadModelEnvelope<PccUnifiedLifecycleReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona: 'project-manager',
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

function readyOrThrow(
  state: IUseUnifiedLifecycleReadModelState,
): Extract<IUseUnifiedLifecycleReadModelState, { status: 'ready' }> {
  if (state.status !== 'ready') {
    throw new Error(`expected ready, got ${state.status}`);
  }
  return state;
}

// ─────────────────────────────────────────────────────────────────────
// Fixture-default behavior
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedLifecycleReadModel — fixture-default behavior', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('fetch must not be called by the hook with the fixture client');
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initial render reports { status: "loading" }', () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    expect(result.current.status).toBe('loading');
  });

  it('resolves to ready with the canonical aggregate view-model', async () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('available');
    expect(ready.viewModel.cardState).toBe('preview');
    expect(ready.viewModel.lifecycleTimeline).toBeDefined();
    expect(ready.viewModel.projectMemory).toBeDefined();
    expect(ready.viewModel.projectLenses).toBeDefined();
    expect(ready.viewModel.projectTraceability).toBeDefined();
    expect(ready.viewModel.warrantyTrace).toBeDefined();
    expect(ready.viewModel.crossProjectKnowledge).toBeDefined();
    expect(ready.viewModel.unifiedSearch).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Envelope-level degraded posture vs. promise-rejection error
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedLifecycleReadModel — envelope sourceStatus is not the hook "error"', () => {
  it('source-unavailable envelope resolves to ready (cardState: unavailable-fixture)', async () => {
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        return envelope('source-unavailable');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('source-unavailable');
    expect(ready.viewModel.cardState).toBe('unavailable-fixture');
  });

  it('backend-unavailable envelope resolves to ready (cardState: error)', async () => {
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        return envelope('backend-unavailable');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('backend-unavailable');
    expect(ready.viewModel.cardState).toBe('error');
  });

  it('promise rejection sets { status: "error", error } (preserves message)', async () => {
    const rejectingClient: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        throw new Error('boom');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(rejectingClient, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status === 'error') {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error.message).toBe('boom');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Aggregate-only call discipline
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedLifecycleReadModel — calls only getUnifiedLifecycle', () => {
  it('exercises only getUnifiedLifecycle on the fixture client; the six leaf routes are not called', async () => {
    const client = createPccFixtureReadModelClient();
    const aggregateSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const memorySpy = vi.spyOn(client, 'getProjectMemory');
    const lensesSpy = vi.spyOn(client, 'getProjectLenses');
    const traceabilitySpy = vi.spyOn(client, 'getProjectTraceability');
    const warrantySpy = vi.spyOn(client, 'getWarrantyTrace');
    const crossProjectSpy = vi.spyOn(client, 'getCrossProjectKnowledge');
    const searchSpy = vi.spyOn(client, 'getUnifiedSearch');

    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(aggregateSpy).toHaveBeenCalledTimes(1);
    expect(memorySpy).not.toHaveBeenCalled();
    expect(lensesSpy).not.toHaveBeenCalled();
    expect(traceabilitySpy).not.toHaveBeenCalled();
    expect(warrantySpy).not.toHaveBeenCalled();
    expect(crossProjectSpy).not.toHaveBeenCalled();
    expect(searchSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Positional-arg correctness for viewerPersona
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedLifecycleReadModel — viewerPersona pass-through', () => {
  it('forwards viewerPersona as the second positional arg when provided', async () => {
    const seen: Array<readonly unknown[]> = [];
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle(projectId: PccProjectId, viewerPersona?: PccPersona) {
        seen.push([projectId, viewerPersona]);
        return SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE;
      },
    };
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID, 'project-executive'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(seen).toEqual([[PROJECT_ID, 'project-executive']]);
  });

  it('passes undefined as the second arg when viewerPersona is omitted', async () => {
    const seen: Array<readonly unknown[]> = [];
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle(projectId: PccProjectId, viewerPersona?: PccPersona) {
        seen.push([projectId, viewerPersona]);
        return SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE;
      },
    };
    const { result } = renderHook(() =>
      useUnifiedLifecycleReadModel(client, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(seen).toEqual([[PROJECT_ID, undefined]]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Refetch + cancellation
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedLifecycleReadModel — refetch + cancellation', () => {
  it('refetches when projectId changes', async () => {
    const spy = vi.fn(async (id: PccProjectId) => ({
      ...SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
      projectId: id,
    }));
    const client: IPccUnifiedLifecycleReadModelClient = { getUnifiedLifecycle: spy };
    const { result, rerender } = renderHook(
      ({ id }: { id: PccProjectId }) => useUnifiedLifecycleReadModel(client, id),
      { initialProps: { id: PROJECT_ID } },
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(spy).toHaveBeenCalledTimes(1);
    rerender({ id: 'p-other' as PccProjectId });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });

  it('mounted-flag cancellation: post-unmount snapshot stays loading after a deferred resolve', async () => {
    type ResolveFn = (env: PccReadModelEnvelope<PccUnifiedLifecycleReadModel>) => void;
    const deferred: { resolve: ResolveFn | null } = { resolve: null };
    const pendingClient: IPccUnifiedLifecycleReadModelClient = {
      getUnifiedLifecycle() {
        return new Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>(
          (resolve) => {
            deferred.resolve = resolve;
          },
        );
      },
    };
    const { result, unmount } = renderHook(() =>
      useUnifiedLifecycleReadModel(pendingClient, PROJECT_ID),
    );
    expect(result.current.status).toBe('loading');
    unmount();
    deferred.resolve?.(envelope('available'));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.status).toBe('loading');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Source-scan: hook does not reference non-canonical route literals or
// any of the six leaf-route identifier names.
// ─────────────────────────────────────────────────────────────────────

const HOOK_FILE = resolve(
  __dirname,
  '..',
  'surfaces',
  'unifiedLifecycle',
  'useUnifiedLifecycleReadModel.ts',
);

function stripCommentsOnly(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
}

function stripCommentsAndStrings(src: string): string {
  return stripCommentsOnly(src)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

describe('useUnifiedLifecycleReadModel — source-scan discipline', () => {
  const raw = readFileSync(HOOK_FILE, 'utf8');
  const commentsStripped = stripCommentsOnly(raw);
  const tokensStripped = stripCommentsAndStrings(raw);

  it.each([
    'lifecycle-timeline',
    'traceability-graph',
    'closed-project-references',
  ])(
    'comments-only-stripped source contains no quoted "%s" route literal',
    (literal) => {
      expect(commentsStripped.includes(`'${literal}'`)).toBe(false);
      expect(commentsStripped.includes(`"${literal}"`)).toBe(false);
    },
  );

  it.each([
    'getProjectMemory',
    'getProjectLenses',
    'getProjectTraceability',
    'getWarrantyTrace',
    'getCrossProjectKnowledge',
    'getUnifiedSearch',
  ])(
    'comments+strings-stripped source contains no leaf-route identifier %s',
    (identifier) => {
      const re = new RegExp(`\\b${identifier}\\b`);
      expect(re.test(tokensStripped)).toBe(false);
    },
  );

  it('comments+strings-stripped source DOES reference getUnifiedLifecycle (sanity)', () => {
    expect(/\bgetUnifiedLifecycle\b/.test(tokensStripped)).toBe(true);
  });
});
