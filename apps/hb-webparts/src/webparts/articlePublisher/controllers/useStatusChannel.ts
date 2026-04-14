/**
 * Status channel — owns the status-banner message + tone pair used by
 * every lifecycle flow. Clearing the message always resets the tone to
 * 'info' so a stale error tone cannot linger.
 */
import * as React from 'react';
import type { StatusBannerTone } from '../sharedChrome/index.js';

export type SetStatus = (
  message: string | undefined,
  tone?: StatusBannerTone,
) => void;

export interface StatusChannel {
  readonly status: string | undefined;
  readonly statusTone: StatusBannerTone;
  readonly setStatus: SetStatus;
}

export function useStatusChannel(): StatusChannel {
  const [status, setStatusRaw] = React.useState<string | undefined>();
  const [statusTone, setStatusTone] = React.useState<StatusBannerTone>('info');
  const setStatus = React.useCallback<SetStatus>((message, tone = 'info') => {
    setStatusRaw(message);
    setStatusTone(message ? tone : 'info');
  }, []);
  return { status, statusTone, setStatus };
}
