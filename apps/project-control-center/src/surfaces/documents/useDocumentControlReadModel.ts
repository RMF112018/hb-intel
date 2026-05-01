/**
 * Wave 7 / Prompt 03B — Document Control read-model hook.
 *
 * Pure consumer of `IPccDocumentsReadModelClient`. State machine:
 *
 *  - `'loading'` — initial / in-flight
 *  - `'preview'` — any successfully resolved envelope (`available`,
 *    `source-unavailable`, `backend-unavailable`). The view model is
 *    always present; consumers inspect `sourceStatus` for degraded
 *    cues. The adapter naturally produces empty per-lane entries for
 *    non-available envelopes, so degraded states render safe-empty.
 *  - `'error'` — only when the client promise throws / rejects.
 *
 * Cancellation flag prevents stale envelope writes after unmount or
 * client/projectId change.
 */

import { useEffect, useState } from 'react';
import type { PccPersona, PccProjectId, PccReadModelSourceStatus } from '@hbc/models/pcc';
import {
  buildPccDocumentControlViewModel,
  type IPccDocumentControlViewModel,
  type IPccDocumentsReadModelClient,
} from './documentControlViewModel';

export type UseDocumentControlReadModelStatus = 'loading' | 'preview' | 'error';

export interface IUseDocumentControlReadModelResult {
  readonly status: UseDocumentControlReadModelStatus;
  readonly viewModel?: IPccDocumentControlViewModel;
  readonly sourceStatus?: PccReadModelSourceStatus;
}

export function useDocumentControlReadModel(
  client: IPccDocumentsReadModelClient,
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): IUseDocumentControlReadModelResult {
  const [state, setState] = useState<IUseDocumentControlReadModelResult>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const envelope = await client.getDocumentControl(projectId, viewerPersona);
        if (cancelled) return;
        // Every successfully resolved envelope flows through 'preview'
        // with the adapter-built view model. The adapter drops MPF
        // entries when sourceStatus !== 'available', so degraded
        // envelopes naturally produce a safe-empty view model.
        setState({
          status: 'preview',
          viewModel: buildPccDocumentControlViewModel(envelope),
          sourceStatus: envelope.sourceStatus,
        });
      } catch {
        if (cancelled) return;
        // Only thrown / rejected promises produce 'error'.
        setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, projectId, viewerPersona]);

  return state;
}
