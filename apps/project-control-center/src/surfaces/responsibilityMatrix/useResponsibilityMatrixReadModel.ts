/**
 * Phase 3 / Wave 11 / Prompt 05.
 *
 * Read-model hook for the Responsibility Matrix region group. Mirrors the
 * `useProjectReadinessReadModel` / `useLifecycleReadinessReadModel`
 * pattern living inside `PccProjectReadinessSurface.tsx`: takes a narrow
 * client + project id, returns a discriminated-union view-model, and
 * cancels in-flight effects on unmount or input change.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import { buildPccResponsibilityMatrixViewModel } from './responsibilityMatrixAdapter.js';
import type {
  IPccResponsibilityMatrixReadModelClient,
  IPccResponsibilityMatrixViewModel,
} from './responsibilityMatrixViewModel.js';

export function useResponsibilityMatrixReadModel(
  client: IPccResponsibilityMatrixReadModelClient,
  projectId: PccProjectId,
): IPccResponsibilityMatrixViewModel {
  const [vm, setVm] = useState<IPccResponsibilityMatrixViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getResponsibilityMatrix(projectId);
        if (cancelled) return;
        setVm(buildPccResponsibilityMatrixViewModel(env));
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
