/**
 * Wave 99 / Prompt 06A — useUnifiedSearchReadModel hook test suite.
 *
 * Mirrors `useUnifiedLifecycleReadModel.test.ts` (renderHook + waitFor +
 * vi.spyOn pattern) and re-uses the canonical
 * `SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL` fixture from
 * `@hbc/models/pcc` (responses[0] = grounded, responses[1] = refusal).
 *
 * Hook contract:
 *   - state shape: discriminated wrapper
 *     ({ status: 'idle' } | { status: 'loading' }
 *      | { status: 'error', error } | { status: 'ready', viewModel })
 *   - blank / whitespace / undefined `selectedQuery` short-circuits to
 *     { status: 'idle' } and discards any prior ready view-model
 *   - nonblank query is trimmed and passed as the third positional arg
 *   - calls only `client.getUnifiedSearch(projectId, viewerPersona?, query?)`
 *   - converts the resolved envelope through `buildPccUnifiedSearchViewModel`
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
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type PccUnifiedSearchAskHbiReadModel,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import {
  useUnifiedSearchReadModel,
  type IPccUnifiedSearchReadModelClient,
  type IUseUnifiedSearchReadModelState,
} from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;
const GENERATED_AT = '2026-05-03T00:00:00.000Z';

function envelope(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccUnifiedSearchAskHbiReadModel = SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
): PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel> {
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
  state: IUseUnifiedSearchReadModelState,
): Extract<IUseUnifiedSearchReadModelState, { status: 'ready' }> {
  if (state.status !== 'ready') {
    throw new Error(`expected ready, got ${state.status}`);
  }
  return state;
}

interface IDeferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
}

// Manual deferred helper — Promise.withResolvers is not assumed available.
function createDeferred<T>(): IDeferred<T> {
  let resolveFn!: (value: T) => void;
  let rejectFn!: (error: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });
  return { promise, resolve: resolveFn, reject: rejectFn };
}

// ─────────────────────────────────────────────────────────────────────
// Idle posture (blank / whitespace / undefined query)
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — idle posture', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('fetch must not be called by the hook');
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('undefined query reports { status: "idle" } and does not call the client', () => {
    const spy = vi.fn(async () => envelope('available'));
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', undefined),
    );
    expect(result.current).toEqual({ status: 'idle' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('whitespace-only query reports { status: "idle" } and does not call the client', () => {
    const spy = vi.fn(async () => envelope('available'));
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', '   \t\n '),
    );
    expect(result.current).toEqual({ status: 'idle' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('clearing the query resets a prior ready view-model back to idle', async () => {
    const spy = vi.fn(async () => envelope('available'));
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const { result, rerender } = renderHook(
      ({ q }: { q: string | undefined }) =>
        useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', q),
      { initialProps: { q: 'capacity?' as string | undefined } },
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(spy).toHaveBeenCalledTimes(1);
    rerender({ q: '   ' });
    expect(result.current).toEqual({ status: 'idle' });
    rerender({ q: undefined });
    expect(result.current).toEqual({ status: 'idle' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Trimmed query positional pass-through
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — query pass-through', () => {
  it('passes the trimmed query as the third positional arg exactly once', async () => {
    const seen: Array<readonly unknown[]> = [];
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch(
        projectId: PccProjectId,
        viewerPersona?: PccPersona,
        query?: string,
      ) {
        seen.push([projectId, viewerPersona, query]);
        return envelope('available');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-executive', '  capacity?  '),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(seen).toEqual([[PROJECT_ID, 'project-executive', 'capacity?']]);
  });

  it('passes undefined viewerPersona straight through', async () => {
    const seen: Array<readonly unknown[]> = [];
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch(
        projectId: PccProjectId,
        viewerPersona?: PccPersona,
        query?: string,
      ) {
        seen.push([projectId, viewerPersona, query]);
        return envelope('available');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, undefined, 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(seen).toEqual([[PROJECT_ID, undefined, 'capacity?']]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Ready view-model: grounded vs refusal
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — ready view-model preserves grounded + refusal posture', () => {
  it('available envelope produces a ready view-model with the adapted answers', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('available');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('available');
    expect(ready.viewModel.cardState).toBe('preview');
    expect(ready.viewModel.answers).toHaveLength(
      SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL.responses.length,
    );
  });

  it('grounded answer preserves citations (sourceLineage / recordType / recordId)', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('available');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    const grounded = ready.viewModel.answers.find((a) => a.kind === 'grounded');
    expect(grounded).toBeDefined();
    if (grounded && grounded.kind === 'grounded') {
      expect(grounded.citations.length).toBeGreaterThan(0);
      const [first] = grounded.citations;
      expect(first.citationId).toBeDefined();
      expect(first.recordType).toBeDefined();
      expect(first.recordId).toBeDefined();
      expect(first.sourceLineage).toBeDefined();
    }
  });

  it('refusal answer preserves refusalReason and carries empty citations', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('available');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    const refusal = ready.viewModel.answers.find((a) => a.kind === 'refusal');
    expect(refusal).toBeDefined();
    if (refusal && refusal.kind === 'refusal') {
      expect(refusal.refusalReason).toBeTruthy();
      expect(refusal.citations).toEqual([]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Envelope degraded posture stays on 'ready'; rejected promise is 'error'
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — envelope sourceStatus is not the hook "error"', () => {
  it('backend-unavailable envelope resolves to ready (cardState: error)', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('backend-unavailable', { responses: [] });
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('backend-unavailable');
    expect(ready.viewModel.cardState).toBe('error');
    expect(ready.viewModel.answers).toEqual([]);
  });

  it('source-unavailable envelope resolves to ready (cardState: unavailable-fixture)', async () => {
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        return envelope('source-unavailable', { responses: [] });
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const ready = readyOrThrow(result.current);
    expect(ready.viewModel.sourceStatus).toBe('source-unavailable');
    expect(ready.viewModel.cardState).toBe('unavailable-fixture');
    expect(ready.viewModel.answers).toEqual([]);
  });

  it('promise rejection sets { status: "error", error } (preserves message)', async () => {
    const rejectingClient: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch() {
        throw new Error('boom');
      },
    };
    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(rejectingClient, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status === 'error') {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error.message).toBe('boom');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Refetch + cancellation
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — refetch + cancellation', () => {
  it('changing the query refetches once per query change', async () => {
    const seen: string[] = [];
    const client: IPccUnifiedSearchReadModelClient = {
      async getUnifiedSearch(
        _projectId: PccProjectId,
        _viewerPersona?: PccPersona,
        query?: string,
      ) {
        seen.push(query ?? '');
        return envelope('available');
      },
    };
    const { result, rerender } = renderHook(
      ({ q }: { q: string }) =>
        useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', q),
      { initialProps: { q: 'capacity?' } },
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(seen).toEqual(['capacity?']);
    rerender({ q: 'cost?' });
    await waitFor(() => expect(seen).toEqual(['capacity?', 'cost?']));
  });

  it('mounted-flag cancellation: post-unmount snapshot stays loading after a deferred resolve', async () => {
    const deferred =
      createDeferred<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>();
    const pendingClient: IPccUnifiedSearchReadModelClient = {
      getUnifiedSearch() {
        return deferred.promise;
      },
    };
    const { result, unmount } = renderHook(() =>
      useUnifiedSearchReadModel(pendingClient, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    expect(result.current.status).toBe('loading');
    unmount();
    deferred.resolve(envelope('available'));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.status).toBe('loading');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Single-method discipline (defense-in-depth on a full fixture client)
// ─────────────────────────────────────────────────────────────────────

describe('useUnifiedSearchReadModel — calls only getUnifiedSearch', () => {
  it('does not invoke any aggregate / leaf-route methods on the fixture client', async () => {
    const client = createPccFixtureReadModelClient();
    const searchSpy = vi.spyOn(client, 'getUnifiedSearch');
    const aggregateSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const memorySpy = vi.spyOn(client, 'getProjectMemory');
    const lensesSpy = vi.spyOn(client, 'getProjectLenses');
    const traceabilitySpy = vi.spyOn(client, 'getProjectTraceability');
    const warrantySpy = vi.spyOn(client, 'getWarrantyTrace');
    const crossProjectSpy = vi.spyOn(client, 'getCrossProjectKnowledge');

    const { result } = renderHook(() =>
      useUnifiedSearchReadModel(client, PROJECT_ID, 'project-manager', 'capacity?'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(PROJECT_ID, 'project-manager', 'capacity?');
    expect(aggregateSpy).not.toHaveBeenCalled();
    expect(memorySpy).not.toHaveBeenCalled();
    expect(lensesSpy).not.toHaveBeenCalled();
    expect(traceabilitySpy).not.toHaveBeenCalled();
    expect(warrantySpy).not.toHaveBeenCalled();
    expect(crossProjectSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Source-scan: hook does not reference forbidden runtime/auth/identifiers.
// `getUnifiedSearch` is the single allowed client-method identifier.
// ─────────────────────────────────────────────────────────────────────

const HOOK_FILE = resolve(
  __dirname,
  '..',
  'surfaces',
  'unifiedLifecycle',
  'useUnifiedSearchReadModel.ts',
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

describe('useUnifiedSearchReadModel — source-scan discipline', () => {
  const raw = readFileSync(HOOK_FILE, 'utf8');
  const commentsStripped = stripCommentsOnly(raw);
  const tokensStripped = stripCommentsAndStrings(raw);

  it.each([
    'getUnifiedLifecycle',
    'getProjectMemory',
    'getProjectLenses',
    'getProjectTraceability',
    'getWarrantyTrace',
    'getCrossProjectKnowledge',
  ])(
    'comments+strings-stripped source contains no forbidden client-method identifier %s',
    (identifier) => {
      const re = new RegExp(`\\b${identifier}\\b`);
      expect(re.test(tokensStripped)).toBe(false);
    },
  );

  it.each([
    'pccReadModelClient',
    'pccBackendReadModelClient',
    'pccFixtureReadModelClient',
    'fetch(',
    'XMLHttpRequest',
    '@microsoft/sp-',
    '@hbc/auth',
    'graph.microsoft',
    'procore',
    'sage',
    'adobe',
    'docusign',
    'document-crunch',
    'dynamics',
    'crm.dynamics',
    'salesforce',
  ])(
    'comments-only-stripped source contains no forbidden runtime/auth token "%s"',
    (token) => {
      expect(commentsStripped.includes(token)).toBe(false);
    },
  );

  it('comments+strings-stripped source DOES reference getUnifiedSearch (sanity: the single allowed client method)', () => {
    expect(/\bgetUnifiedSearch\b/.test(tokensStripped)).toBe(true);
  });

  it('comments+strings-stripped source DOES reference buildPccUnifiedSearchViewModel (sanity: adapter is used)', () => {
    expect(/\bbuildPccUnifiedSearchViewModel\b/.test(tokensStripped)).toBe(true);
  });
});
