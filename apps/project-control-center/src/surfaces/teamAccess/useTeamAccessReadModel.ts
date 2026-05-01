/**
 * Team & Access read-model hook (Phase 3 / Wave 6 / Prompt 06).
 *
 * Pure consumer of a narrow `IPccTeamAccessReadModelClient`. Fetches the
 * `team-access` envelope and exposes a stable `{ status, data?,
 * sourceStatus? }` result. Mounted-flag cancellation prevents stale
 * envelope writes after unmount or a `client` / `projectId` change.
 *
 * The narrow consumer interface is intentionally defined here (not
 * re-exported from `src/api/`) so non-api consumers can type the
 * client prop without crossing the controlled-consumption guard for
 * `IPccReadModelClient`. TypeScript structural typing lets the full
 * `IPccReadModelClient` flow into a value typed as
 * `IPccTeamAccessReadModelClient`.
 */

import { useEffect, useState } from 'react';
import type {
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccTeamAccessReadModel,
} from '@hbc/models/pcc';

export interface IPccTeamAccessReadModelClient {
  getTeamAccess(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccTeamAccessReadModel>>;
}

export type UseTeamAccessReadModelStatus = 'loading' | 'preview' | 'error';

export interface IUseTeamAccessReadModelResult {
  readonly status: UseTeamAccessReadModelStatus;
  readonly data?: PccTeamAccessReadModel;
  readonly sourceStatus?: PccReadModelSourceStatus;
}

export function useTeamAccessReadModel(
  client: IPccTeamAccessReadModelClient,
  projectId: PccProjectId,
): IUseTeamAccessReadModelResult {
  const [state, setState] = useState<IUseTeamAccessReadModelResult>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const envelope = await client.getTeamAccess(projectId);
        if (cancelled) return;
        if (envelope.sourceStatus === 'available') {
          setState({
            status: 'preview',
            data: envelope.data,
            sourceStatus: envelope.sourceStatus,
          });
        } else {
          setState({
            status: 'error',
            sourceStatus: envelope.sourceStatus,
          });
        }
      } catch {
        if (cancelled) return;
        setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId]);

  return state;
}
