/**
 * Project Home read-model hook.
 *
 * Pure consumer of `IPccProjectHomeReadModelClient`. Fetches `home`,
 * `priorityActions`, and `documentControl` envelopes in parallel, runs
 * them through `buildPccProjectHomeViewModel`, and exposes a stable
 * view-model.
 *
 * Returns `'loading'` on first render, then transitions to `'ready'`
 * once the parallel fetches resolve. Each per-call result is wrapped
 * in `.catch(() => undefined)` so a single rejected envelope degrades
 * to a per-slot `'source-unavailable'` posture in the adapter without
 * stalling the whole surface in `'loading'`. Cancellation prevents
 * stale envelope writes after unmount or a `client` / `projectId`
 * change.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import { buildPccProjectHomeViewModel } from './projectHomeAdapter.js';
import type {
  IPccProjectHomeReadModelClient,
  IPccProjectHomeViewModel,
} from './projectHomeViewModel.js';

export interface IUseProjectHomeReadModelResult {
  readonly status: 'loading' | 'ready';
  readonly viewModel?: IPccProjectHomeViewModel;
}

export function useProjectHomeReadModel(
  client: IPccProjectHomeReadModelClient,
  projectId: PccProjectId,
): IUseProjectHomeReadModelResult {
  const [state, setState] = useState<IUseProjectHomeReadModelResult>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      // Wave 14 / Prompt 06 introduced per-call `.catch(() => undefined)`
      // for `getApprovals` so an approvals-only rejection degraded
      // gracefully. The remaining five reads previously assumed clients
      // never reject (`Wave 4 / Prompt 03 safe-fallback design`); under
      // hosted SPFx runtime that assumption can break (any single
      // rejection propagated unhandled, leaving the hook permanently in
      // `loading` and the surface in skeleton). Wrapping every call in
      // `.catch(() => undefined)` lets the adapter degrade per-slot to
      // a `'source-unavailable'` posture rather than stalling the whole
      // surface.
      const [
        home,
        priorityActions,
        documentControl,
        procoreProjectMapping,
        procoreSyncHealth,
        approvals,
      ] = await Promise.all([
        client.getProjectHome(projectId).catch(() => undefined),
        client.getPriorityActions(projectId).catch(() => undefined),
        client.getDocumentControl(projectId).catch(() => undefined),
        client.getProcoreProjectMapping(projectId).catch(() => undefined),
        client.getProcoreSyncHealth(projectId).catch(() => undefined),
        client.getApprovals(projectId).catch(() => undefined),
      ]);
      if (cancelled) return;
      setState({
        status: 'ready',
        viewModel: buildPccProjectHomeViewModel({
          projectId,
          home,
          priorityActions,
          documentControl,
          procoreProjectMapping,
          procoreSyncHealth,
          approvals,
        }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);

  return state;
}
