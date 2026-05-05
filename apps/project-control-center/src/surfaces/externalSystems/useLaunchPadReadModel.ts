/**
 * Phase 3 / Wave 15 / Prompt 05.
 *
 * Read-model hook for the External Systems Launch Pad surface. Mirrors the
 * `useApprovalsReadModel` pattern: takes a narrow client + project id,
 * returns a discriminated-union view-model, owns the loading and
 * promise-rejection error branches, and cancels in-flight effects on
 * unmount or input change.
 */

import { useEffect, useState } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { buildPccLaunchPadViewModel } from './launchPadAdapter.js';
import type { IPccLaunchPadReadModelClient, IPccLaunchPadViewModel } from './launchPadViewModel.js';

export function useLaunchPadReadModel(
  client: IPccLaunchPadReadModelClient,
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): IPccLaunchPadViewModel {
  const [vm, setVm] = useState<IPccLaunchPadViewModel>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setVm({ status: 'loading' });
    void (async () => {
      try {
        const env = await client.getExternalSystemsLaunchPad(projectId, viewerPersona);
        if (cancelled) return;
        setVm(buildPccLaunchPadViewModel(env, viewerPersona));
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
