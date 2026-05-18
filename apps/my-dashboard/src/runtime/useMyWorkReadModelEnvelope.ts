/**
 * Per-envelope async-loading hooks for the My Work read-model surface.
 *
 * Each hook resolves the active client via `useMyWorkReadModelClient()` and
 * invokes one read-only method, exposing the full envelope (not a collapsed
 * boolean) so surfaces in later prompts can render real `sourceStatus`,
 * `mode`, `warnings`, and `generatedAtUtc`.
 *
 * Status state machine:
 *   idle (initial sync render before effect fires; not observed in jsdom but
 *        kept for SSR safety)
 *   → loading (effect started)
 *   → success | error (effect resolved)
 *
 * The hook ignores stale resolutions via a mounted-ref guard so a query
 * change does not "race" the prior pending promise.
 *
 * @module runtime/useMyWorkReadModelEnvelope
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  MyProjectLinksReadModel,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import { useMyWorkReadModelClient } from './MyWorkReadModelClientProvider.js';

export type EnvelopeState<T> =
  | { readonly status: 'loading'; readonly envelope: undefined; readonly error: undefined }
  | {
      readonly status: 'success';
      readonly envelope: MyWorkReadModelEnvelope<T>;
      readonly error: undefined;
    }
  | { readonly status: 'error'; readonly envelope: undefined; readonly error: Error };

const LOADING_STATE = {
  status: 'loading',
  envelope: undefined,
  error: undefined,
} as const;

/**
 * Refetch trigger surfaced alongside the envelope state. Callers that need to
 * force a fresh load (e.g., after a user-initiated mutation like an Adobe
 * Sign disconnect) invoke `refetch()`; the hook bumps an internal
 * `requestNonce` so the load effect re-runs.
 */
export type EnvelopeStateWithRefetch<T> = EnvelopeState<T> & {
  readonly refetch: () => void;
};

function useEnvelope<T>(
  loader: () => Promise<MyWorkReadModelEnvelope<T>>,
): EnvelopeStateWithRefetch<T> {
  const [state, setState] = useState<EnvelopeState<T>>(LOADING_STATE);
  const [requestNonce, setRequestNonce] = useState(0);

  // Capture the latest loader without re-running the effect on identity changes
  // (avoids infinite loops when callers inline-create loader closures).
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState(LOADING_STATE);
    loaderRef
      .current()
      .then((envelope) => {
        if (!active) return;
        setState({ status: 'success', envelope, error: undefined });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', envelope: undefined, error });
      });
    return () => {
      active = false;
    };
    // Re-runs whenever `requestNonce` changes — that is the refetch signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestNonce]);

  const refetch = useCallback(() => {
    setRequestNonce((n) => n + 1);
  }, []);

  return { ...state, refetch } as EnvelopeStateWithRefetch<T>;
}

export function useMyWorkHomeEnvelope(): EnvelopeStateWithRefetch<MyWorkHomeReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getMyWorkHome());
}

export function useAdobeSignActionQueueEnvelope(
  query?: MyWorkAdobeSignActionQueueQuery,
): EnvelopeStateWithRefetch<MyWorkAdobeSignActionQueueReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getAdobeSignActionQueue(query));
}

export function useMyProjectLinksEnvelope(): EnvelopeStateWithRefetch<MyProjectLinksReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getMyProjectLinks());
}
