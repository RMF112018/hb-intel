/**
 * Project Home read-model hook.
 *
 * Pure consumer of `IPccProjectHomeReadModelClient`. Fetches `home`,
 * `priorityActions`, and `documentControl` envelopes in parallel, runs
 * them through `buildPccProjectHomeViewModel`, and exposes a stable
 * view-model.
 *
 * Returns `'loading'` on first render. Wave 4 clients always resolve
 * (Prompt 03 safe-fallback design), so the hook never enters an error
 * branch. Cancellation prevents stale envelope writes after unmount
 * or a `client` / `projectId` change.
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
      // Wave 14 / Prompt 06 — approvals fetch is wrapped in a per-call
      // `.catch(() => undefined)` so an approvals-only failure degrades
      // gracefully to zero approvals-derived candidates / fixture-fallback
      // card. Other Project Home reads keep their existing failure
      // semantics so this prompt does not change Wave 4 behaviour.
      const [
        home,
        priorityActions,
        documentControl,
        procoreProjectMapping,
        procoreSyncHealth,
        approvals,
      ] = await Promise.all([
        client.getProjectHome(projectId),
        client.getPriorityActions(projectId),
        client.getDocumentControl(projectId),
        client.getProcoreProjectMapping(projectId),
        client.getProcoreSyncHealth(projectId),
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
