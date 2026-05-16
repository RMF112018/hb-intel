import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
import { _resetConfig, setRuntimeConfig } from '../config/runtimeConfig.js';

import {
  MyWorkReadModelClientProvider,
  useMyWorkReadModelClient,
} from './MyWorkReadModelClientProvider.js';

beforeEach(() => {
  _resetConfig();
});

afterEach(() => {
  _resetConfig();
  vi.restoreAllMocks();
});

function makeStubClient(overrides: Partial<IMyWorkReadModelClient> = {}): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn(),
    getMyProjectLinks: vi.fn(),
    resolveAdobeSignActionLink: vi.fn().mockResolvedValue({ status: 'source-unavailable' }),
    startAdobeSignOAuth: vi.fn(),
    ...overrides,
  };
}

describe('MyWorkReadModelClientProvider', () => {
  it('exposes the explicit `client` prop verbatim (test/override seam)', () => {
    const stub = makeStubClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MyWorkReadModelClientProvider client={stub}>{children}</MyWorkReadModelClientProvider>
    );
    const { result } = renderHook(() => useMyWorkReadModelClient(), { wrapper });
    expect(result.current).toBe(stub);
  });

  it('memoizes the resolved client across re-renders when inputs are stable', () => {
    const stub = makeStubClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MyWorkReadModelClientProvider client={stub}>{children}</MyWorkReadModelClientProvider>
    );
    const { result, rerender } = renderHook(() => useMyWorkReadModelClient(), { wrapper });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('honours an explicit ui-review opt-out — clean fixture with sourceStatus="available"', async () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MyWorkReadModelClientProvider>{children}</MyWorkReadModelClientProvider>
    );
    const { result } = renderHook(() => useMyWorkReadModelClient(), { wrapper });
    const envelope = await result.current.getMyWorkHome();
    expect(envelope.mode).toBe('fixture');
    expect(envelope.sourceStatus).toBe('available');
  });

  it('constructs a fixture-with-simulateBackendUnavailable client when backend mode is requested but prerequisites are missing', async () => {
    // backendMode=production requests backend; no functionAppUrl + no getApiToken
    // → factory falls through to the simulateBackendUnavailable fixture path.
    setRuntimeConfig({ backendMode: 'production' });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MyWorkReadModelClientProvider>{children}</MyWorkReadModelClientProvider>
    );
    const { result } = renderHook(() => useMyWorkReadModelClient(), { wrapper });
    const envelope = await result.current.getMyWorkHome();
    expect(envelope.mode).toBe('fixture');
    expect(envelope.sourceStatus).toBe('backend-unavailable');
  });

  it('constructs a backend-attempting client when backend mode + functionAppUrl + getApiToken are all wired', async () => {
    // Spy on global fetch so we can prove the backend client was selected
    // by observing a real network attempt at the configured URL.
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://function-app.example.invalid',
    });
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { ...MY_WORK_HOME_AVAILABLE } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const getApiToken = vi.fn().mockResolvedValue('test-token');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MyWorkReadModelClientProvider getApiToken={getApiToken}>
        {children}
      </MyWorkReadModelClientProvider>
    );
    const { result } = renderHook(() => useMyWorkReadModelClient(), { wrapper });
    await result.current.getMyWorkHome();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toMatch(/function-app\.example\.invalid/);
    expect(getApiToken).toHaveBeenCalled();
  });

  it('throws when `useMyWorkReadModelClient` is called outside a provider', () => {
    // Silence the React error boundary console noise for this expected throw.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<UnwrappedHookConsumer />)).toThrow(
      /useMyWorkReadModelClient must be used inside <MyWorkReadModelClientProvider>/,
    );
    errSpy.mockRestore();
  });
});

function UnwrappedHookConsumer(): JSX.Element {
  useMyWorkReadModelClient();
  return <div />;
}
