/**
 * Phase 3 / Wave 14 / Prompt 05.
 *
 * Read-model hook for the Approvals / Checkpoints surface. Mirrors the
 * `useBuyoutLogReadModel` and `useConstraintsLogReadModel` patterns: takes
 * a narrow client + project id, returns a discriminated-union view-model,
 * owns the loading and promise-rejection error branches, and cancels
 * in-flight effects on unmount or input change.
 */

import { useEffect, useState } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { buildPccApprovalsViewModel } from './approvalsAdapter.js';
import type {
  IPccApprovalsReadModelClient,
  IPccApprovalsViewModel,
} from './approvalsViewModel.js';

export function useApprovalsReadModel(
  client: IPccApprovalsReadModelClient,
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): IPccApprovalsViewModel {
  const [vm, setVm] = useState<IPccApprovalsViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getApprovals(projectId, viewerPersona);
        if (cancelled) return;
        setVm(buildPccApprovalsViewModel(env));
      } catch {
        if (cancelled) return;
        setVm({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId, viewerPersona]);
  return vm;
}
