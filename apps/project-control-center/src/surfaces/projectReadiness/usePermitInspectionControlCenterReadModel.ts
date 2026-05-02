/**
 * Permit & Inspection Control Center — read-model hook.
 *
 * Phase 3 / Wave 10 / Prompt 05. Effect-based, cancel-safe React hook
 * mirroring the Wave 9 `useLifecycleReadinessReadModel` precedent. Calls
 * `client.getPermitInspectionControlCenter(projectId)` once per
 * (client, projectId) tuple change and surfaces the resulting view-model
 * via `buildPermitInspectionControlCenterViewModel`.
 *
 * No fetch callsite (the read-model client owns all network access);
 * no SPFx context dependence; no auth; no mutation.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import {
  buildPermitInspectionControlCenterViewModel,
  type IPccPermitInspectionControlCenterReadModelClient,
  type PccPermitInspectionControlCenterViewModel,
} from './permitInspectionControlCenterViewModel.js';

export function usePermitInspectionControlCenterReadModel(
  client: IPccPermitInspectionControlCenterReadModelClient,
  projectId: PccProjectId,
): PccPermitInspectionControlCenterViewModel {
  const [vm, setVm] = useState<PccPermitInspectionControlCenterViewModel>({
    status: 'loading',
  });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getPermitInspectionControlCenter(projectId);
        if (cancelled) return;
        setVm(buildPermitInspectionControlCenterViewModel(env));
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
