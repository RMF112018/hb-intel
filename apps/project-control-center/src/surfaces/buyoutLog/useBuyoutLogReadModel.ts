/**
 * Phase 3 / Wave 13 / Prompt 05.
 *
 * Read-model hook for the Buyout Log region group. Mirrors the
 * `useConstraintsLogReadModel` pattern: takes a narrow client + project
 * id, returns a discriminated-union view-model, owns the loading and
 * promise-rejection error branches, and cancels in-flight effects on
 * unmount or input change.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import { buildPccBuyoutLogViewModel } from './buyoutLogAdapter.js';
import type { IPccBuyoutLogReadModelClient, IPccBuyoutLogViewModel } from './buyoutLogViewModel.js';

export function useBuyoutLogReadModel(
  client: IPccBuyoutLogReadModelClient,
  projectId: PccProjectId,
): IPccBuyoutLogViewModel {
  const [vm, setVm] = useState<IPccBuyoutLogViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getBuyoutLog(projectId);
        if (cancelled) return;
        setVm(buildPccBuyoutLogViewModel(env));
      } catch {
        if (cancelled) return;
        setVm({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);
  return vm;
}
