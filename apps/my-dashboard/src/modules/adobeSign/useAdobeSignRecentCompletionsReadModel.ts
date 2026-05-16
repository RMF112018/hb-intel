import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkAdobeSignRecentCompletionsReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';
import type { IMyWorkReadModelClient } from '../../api/myWorkReadModelClient.js';

export type AdobeSignRecentCompletionsRequestStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AdobeSignRecentCompletionsReadModelState {
  readonly status: AdobeSignRecentCompletionsRequestStatus;
  readonly envelope?: MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>;
  readonly error?: unknown;
  readonly hasFetched: boolean;
  readonly retry: () => void;
}

export interface UseAdobeSignRecentCompletionsReadModelInput {
  readonly client: IMyWorkReadModelClient;
  readonly query?: MyWorkAdobeSignRecentCompletionsQuery;
  readonly enabled: boolean;
}

export function useAdobeSignRecentCompletionsReadModel({
  client,
  query,
  enabled,
}: UseAdobeSignRecentCompletionsReadModelInput): AdobeSignRecentCompletionsReadModelState {
  const [requestNonce, setRequestNonce] = useState(0);
  const [state, setState] = useState<
    Omit<AdobeSignRecentCompletionsReadModelState, 'retry'>
  >({
    status: 'idle',
    hasFetched: false,
  });

  const hasRequestedRef = useRef(false);
  const retry = useCallback(() => {
    hasRequestedRef.current = false;
    setRequestNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled || (hasRequestedRef.current && requestNonce === 0)) return;

    hasRequestedRef.current = true;
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading' }));

    if (typeof client.getAdobeSignRecentCompletions !== 'function') {
      setState({
        status: 'error',
        error: new Error('adobe-sign-recent-completions-client-method-missing'),
        hasFetched: true,
      });
      return;
    }

    void client
      .getAdobeSignRecentCompletions(query)
      .then((envelope) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          envelope,
          hasFetched: true,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          error,
          hasFetched: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [client, enabled, query, requestNonce]);

  return {
    ...state,
    retry,
  };
}
