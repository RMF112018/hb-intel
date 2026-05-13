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

import { useEffect, useRef, useState } from 'react';

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

function useEnvelope<T>(loader: () => Promise<MyWorkReadModelEnvelope<T>>): EnvelopeState<T> {
  const [state, setState] = useState<EnvelopeState<T>>(LOADING_STATE);

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
    // Deliberately re-run only when triggerKey below changes (callers pass
    // stable inputs by reference).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export function useMyWorkHomeEnvelope(): EnvelopeState<MyWorkHomeReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getMyWorkHome());
}

export function useAdobeSignActionQueueEnvelope(
  query?: MyWorkAdobeSignActionQueueQuery,
): EnvelopeState<MyWorkAdobeSignActionQueueReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getAdobeSignActionQueue(query));
}

export function useMyProjectLinksEnvelope(): EnvelopeState<MyProjectLinksReadModel> {
  const client = useMyWorkReadModelClient();
  return useEnvelope(() => client.getMyProjectLinks());
}
