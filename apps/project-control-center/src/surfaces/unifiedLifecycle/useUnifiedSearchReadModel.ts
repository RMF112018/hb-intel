/**
 * Wave 99 / Prompt 06A — unified search (Ask HBI) hook seam.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Hook layer that consumes the unified-search adapter from Prompt 04A.
 * Lives alongside the seam's adapters, view-model, and lifecycle hook
 * for co-location, but does NOT register a routed surface and is not
 * mounted by `PccSurfaceRouter`.
 *
 * Calls a narrow read-model client's `getUnifiedSearch(projectId,
 * viewerPersona?, query?)` once per nonblank `[client, projectId,
 * viewerPersona, trimmedQuery]` change, normalizes the resolved
 * envelope through the Prompt 04A unified-search adapter, and exposes
 * a wrapper-state discriminated union (`idle` | `loading` | `error` |
 * `ready`) for future Ask-HBI panel composition (Prompt 06B).
 *
 * State-shape pattern: mirrors `useUnifiedLifecycleReadModel` (Prompt
 * 05A) with one wrinkle — query-driven `idle` posture when no nonblank
 * query has been selected.
 *
 * Query handling:
 *   - undefined / blank / whitespace-only `selectedQuery` short-circuits
 *     to `{ status: 'idle' }`. The client method is NOT called and any
 *     prior `ready` view-model is discarded (no stale answer remains
 *     visible after the consumer clears the query).
 *   - nonblank queries are trimmed before being passed as the third
 *     positional arg. The backend client owns `q=` URL serialization;
 *     this hook does not serialize.
 *
 * Envelope-level posture (`source-unavailable`, `backend-unavailable`,
 * `unauthorized`, `forbidden`, `missing-config`, `stale`) surfaces
 * through `state.viewModel.sourceStatus` / `cardState` on the `ready`
 * branch — the hook does NOT collapse those into its own `error`
 * status. The hook's `error` status is reserved for promise rejection.
 *
 * The hook calls ONLY `client.getUnifiedSearch`. The narrow client
 * interface exposes nothing else; defense-in-depth spies in the test
 * file confirm the six aggregate/leaf methods are never invoked.
 *
 * No live LLM, vector, search, Microsoft Graph, Procore, Sage, CRM,
 * Adobe, or auth-runtime wiring. The hook is preview-safe and consumes
 * only the canonical fixture / backend envelope contract.
 */

import { useEffect, useState } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { buildPccUnifiedSearchViewModel } from './unifiedSearchAdapter.js';
import type {
  IPccUnifiedSearchReadModelClient,
  IPccUnifiedSearchViewModel,
} from './unifiedLifecycleViewModel.js';

export type IUseUnifiedSearchReadModelState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: Error }
  | { readonly status: 'ready'; readonly viewModel: IPccUnifiedSearchViewModel };

const IDLE_STATE: IUseUnifiedSearchReadModelState = { status: 'idle' };

export function useUnifiedSearchReadModel(
  client: IPccUnifiedSearchReadModelClient,
  projectId: PccProjectId,
  viewerPersona: PccPersona | undefined,
  selectedQuery: string | undefined,
): IUseUnifiedSearchReadModelState {
  const trimmedQuery = typeof selectedQuery === 'string' ? selectedQuery.trim() : '';
  const hasQuery = trimmedQuery.length > 0;
  const [state, setState] = useState<IUseUnifiedSearchReadModelState>(
    hasQuery ? { status: 'loading' } : IDLE_STATE,
  );
  useEffect(() => {
    if (!hasQuery) {
      setState(IDLE_STATE);
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const envelope = await client.getUnifiedSearch(
          projectId,
          viewerPersona,
          trimmedQuery,
        );
        if (cancelled) return;
        setState({
          status: 'ready',
          viewModel: buildPccUnifiedSearchViewModel(envelope),
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId, viewerPersona, trimmedQuery, hasQuery]);
  return state;
}
