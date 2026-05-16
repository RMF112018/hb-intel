import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE } from '@hbc/models/myWork/fixtures';

import type { IMyWorkReadModelClient } from '../../api/myWorkReadModelClient.js';
import { useAdobeSignRecentCompletionsReadModel } from './useAdobeSignRecentCompletionsReadModel.js';

function makeClient(
  overrides?: Partial<Pick<IMyWorkReadModelClient, 'getAdobeSignRecentCompletions'>>,
): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn(async () => {
      throw new Error('not used');
    }),
    getAdobeSignActionQueue: vi.fn(async () => {
      throw new Error('not used');
    }),
    getAdobeSignRecentCompletions:
      overrides?.getAdobeSignRecentCompletions ??
      vi.fn(async () => ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE),
    getMyProjectLinks: vi.fn(async () => {
      throw new Error('not used');
    }),
    startAdobeSignOAuth: vi.fn(async () => {
      throw new Error('not used');
    }),
  };
}

describe('useAdobeSignRecentCompletionsReadModel', () => {
  it('is idle before enabled', () => {
    const client = makeClient();
    const { result } = renderHook(() =>
      useAdobeSignRecentCompletionsReadModel({
        client,
        enabled: false,
      }),
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.hasFetched).toBe(false);
    expect(result.current.envelope).toBeUndefined();
    expect(client.getAdobeSignRecentCompletions).toHaveBeenCalledTimes(0);
  });

  it('fetches once on first enable and retains envelope', async () => {
    const client = makeClient();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAdobeSignRecentCompletionsReadModel({
          client,
          enabled,
        }),
      { initialProps: { enabled: false } },
    );

    act(() => {
      rerender({ enabled: true });
    });

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current.hasFetched).toBe(true);
    expect(result.current.envelope).toEqual(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
    expect(client.getAdobeSignRecentCompletions).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch on repeated enable toggles', async () => {
    const client = makeClient();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAdobeSignRecentCompletionsReadModel({
          client,
          enabled,
        }),
      { initialProps: { enabled: false } },
    );

    act(() => {
      rerender({ enabled: true });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      rerender({ enabled: false });
      rerender({ enabled: true });
      rerender({ enabled: true });
    });

    expect(client.getAdobeSignRecentCompletions).toHaveBeenCalledTimes(1);
    expect(result.current.envelope).toEqual(ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE);
  });

  it('surfaces predictable error posture', async () => {
    const client = makeClient({
      getAdobeSignRecentCompletions: vi.fn(async () => {
        throw new Error('backend-down');
      }),
    });

    const { result } = renderHook(() =>
      useAdobeSignRecentCompletionsReadModel({
        client,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.hasFetched).toBe(true);
    expect(result.current.envelope).toBeUndefined();
    expect((result.current.error as Error).message).toBe('backend-down');
    expect(client.getAdobeSignRecentCompletions).toHaveBeenCalledTimes(1);
  });
});
