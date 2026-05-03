/**
 * Phase 3 / Wave 12 / Prompt 05.
 *
 * Read-model hook for the Constraints Log region group. Mirrors the
 * `useResponsibilityMatrixReadModel` pattern: takes a narrow client +
 * project id, returns a discriminated-union view-model, and cancels
 * in-flight effects on unmount or input change.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import { buildPccConstraintsLogViewModel } from './constraintsLogAdapter.js';
import type {
  IPccConstraintsLogReadModelClient,
  IPccConstraintsLogViewModel,
} from './constraintsLogViewModel.js';

export function useConstraintsLogReadModel(
  client: IPccConstraintsLogReadModelClient,
  projectId: PccProjectId,
): IPccConstraintsLogViewModel {
  const [vm, setVm] = useState<IPccConstraintsLogViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getConstraintsLog(projectId);
        if (cancelled) return;
        setVm(buildPccConstraintsLogViewModel(env));
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
