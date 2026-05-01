/**
 * Wave 7 / Prompt 03B — Document Control read-model hook.
 *
 * Pure consumer of `IPccDocumentsReadModelClient`. Mirrors the Team &
 * Access hook posture: `loading | preview | error` with cancellation
 * via a mounted flag. Treats `'available'` envelopes as `'preview'` and
 * any non-available envelope or thrown rejection as `'error'`. The view
 * model is built by `buildPccDocumentControlViewModel` for the
 * `'preview'` case so consumers receive a fully filtered shape.
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
        if (envelope.sourceStatus === 'available') {
          setState({
            status: 'preview',
            viewModel: buildPccDocumentControlViewModel(envelope),
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
  }, [client, projectId, viewerPersona]);

  return state;
}
