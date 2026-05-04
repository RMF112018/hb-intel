/**
 * Wave 13 Prompt 13E — shared Procore surface read-model hook.
 *
 * Pure consumer of `IPccProcoreSurfaceClient`. Fetches the two Procore
 * envelopes in parallel for the requested project, runs them through
 * `buildPccProcoreSurfaceViewModel`, and exposes a stable view-model.
 * Used by every PCC core surface that surfaces Procore-derived signals
 * (Project Readiness, External Systems, Site Health). Project Home has
 * its own composite hook (`useProjectHomeReadModel`).
 *
 * Returns `undefined` on first render; cancellation prevents stale
 * envelope writes after unmount or a `client` / `projectId` change.
 */

import { useEffect, useState } from 'react';
import type { PccProjectId } from '@hbc/models/pcc';
import {
  buildPccProcoreSurfaceViewModel,
  type IPccProcoreSurfaceClient,
  type IPccProcoreSurfaceViewModel,
} from './procoreSurfaceAdapter.js';

export function useProcoreSurfaceReadModel(
  client: IPccProcoreSurfaceClient,
  projectId: PccProjectId,
): IPccProcoreSurfaceViewModel | undefined {
  const [vm, setVm] = useState<IPccProcoreSurfaceViewModel | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setVm(undefined);
    void (async () => {
      const [mapping, syncHealth] = await Promise.all([
        client.getProcoreProjectMapping(projectId),
        client.getProcoreSyncHealth(projectId),
      ]);
      if (cancelled) return;
      setVm(buildPccProcoreSurfaceViewModel({ projectId, mapping, syncHealth }));
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);

  return vm;
}
