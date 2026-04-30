/**
 * Project Home read-model hook (Phase 3 / Wave 4 / Prompt 05).
 *
 * Pure consumer of `IPccProjectHomeReadModelClient`. Fetches `home`
 * and `documentControl` envelopes in parallel, runs them through
 * `buildPccProjectHomeViewModel`, and exposes a stable view-model.
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
      const [home, documentControl] = await Promise.all([
        client.getProjectHome(projectId),
        client.getDocumentControl(projectId),
      ]);
      if (cancelled) return;
      setState({
        status: 'ready',
        viewModel: buildPccProjectHomeViewModel({ home, documentControl }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);

  return state;
}
