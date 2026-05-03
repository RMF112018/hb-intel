/**
 * Wave 99 / Prompt 05A — unified lifecycle read-model hook seam.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Hook layer that consumes the unified-lifecycle adapter seam from
 * Prompts 04A/04B. Lives alongside the seam's adapters and view-model
 * for co-location, but does NOT register a routed surface and is not
 * mounted by `PccSurfaceRouter`.
 *
 * Calls a narrow read-model client's `getUnifiedLifecycle(projectId,
 * viewerPersona?)` once per `[client, projectId, viewerPersona]`
 * change, normalizes the resolved envelope through the Prompt 04B
 * aggregate adapter, and exposes a wrapper-state discriminated union
 * (`loading` | `error` | `ready`) for future surface containers.
 *
 * State-shape pattern: `useProjectHomeReadModel` (wrapper —
 * `{ status, viewModel? }`).
 * Async / cancellation pattern: `useResponsibilityMatrixReadModel`
 * (cancelled-flag closed over both branches; no AbortController).
 *
 * Envelope-level posture (`source-unavailable`, `backend-unavailable`,
 * `unauthorized`, `forbidden`, `missing-config`, `stale`) surfaces
 * through `state.viewModel.sourceStatus` / `cardState` on the `ready`
 * branch — the hook does NOT collapse those into its own `error`
 * status. The hook's `error` status is reserved for promise
 * rejection.
 *
 * The hook calls ONLY `client.getUnifiedLifecycle`. The aggregate
 * envelope already contains all seven canonical read models; no leaf
 * route is fetched separately, and `unified-search` is not invoked
 * with a query at this layer.
 */

import { useEffect, useState } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { buildPccUnifiedLifecycleViewModel } from './unifiedLifecycleAdapter.js';
import type {
  IPccUnifiedLifecycleReadModelClient,
  IPccUnifiedLifecycleViewModel,
} from './unifiedLifecycleViewModel.js';

export type IUseUnifiedLifecycleReadModelState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: Error }
  | { readonly status: 'ready'; readonly viewModel: IPccUnifiedLifecycleViewModel };

export function useUnifiedLifecycleReadModel(
  client: IPccUnifiedLifecycleReadModelClient,
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): IUseUnifiedLifecycleReadModelState {
  const [state, setState] = useState<IUseUnifiedLifecycleReadModelState>({
    status: 'loading',
  });
  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const envelope = await client.getUnifiedLifecycle(projectId, viewerPersona);
        if (cancelled) return;
        setState({
          status: 'ready',
          viewModel: buildPccUnifiedLifecycleViewModel(envelope),
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
  }, [client, projectId, viewerPersona]);
  return state;
}
