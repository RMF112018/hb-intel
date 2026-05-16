import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ADOBE_SIGN_QUEUE_AVAILABLE, MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';

import { MyWorkReadModelClientProvider } from './MyWorkReadModelClientProvider.js';
import {
  useAdobeSignActionQueueEnvelope,
  useMyProjectLinksEnvelope,
  useMyWorkHomeEnvelope,
} from './useMyWorkReadModelEnvelope.js';

const PROJECT_LINKS_AVAILABLE: MyWorkReadModelEnvelope<MyProjectLinksReadModel> = {
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-05-13T00:00:00Z',
  data: { items: [], paging: { hasMore: false } } as unknown as MyProjectLinksReadModel,
};

function makeStubClient(overrides: Partial<IMyWorkReadModelClient> = {}): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AVAILABLE),
    getMyProjectLinks: vi.fn().mockResolvedValue(PROJECT_LINKS_AVAILABLE),
    resolveAdobeSignActionLink: vi.fn().mockResolvedValue({ status: 'source-unavailable' }),
    startAdobeSignOAuth: vi.fn(),
    ...overrides,
  };
}

function makeWrapper(client: IMyWorkReadModelClient): (p: { children: ReactNode }) => JSX.Element {
  return ({ children }) => (
    <MyWorkReadModelClientProvider client={client}>{children}</MyWorkReadModelClientProvider>
  );
}

describe('useMyWorkHomeEnvelope', () => {
  it('returns the resolved envelope and invokes the client method exactly once', async () => {
    const stub = makeStubClient();
    const { result } = renderHook(() => useMyWorkHomeEnvelope(), { wrapper: makeWrapper(stub) });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.envelope).toBe(MY_WORK_HOME_AVAILABLE);
    expect(stub.getMyWorkHome).toHaveBeenCalledTimes(1);
  });

  it('stays in loading state while the client method has not resolved', () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { result } = renderHook(() => useMyWorkHomeEnvelope(), { wrapper: makeWrapper(stub) });
    expect(result.current.status).toBe('loading');
    expect(result.current.envelope).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces the rejection as an Error on the error state', async () => {
    const rejection = new Error('home-load-failed');
    const stub = makeStubClient({
      getMyWorkHome: vi.fn().mockRejectedValue(rejection),
    });
    const { result } = renderHook(() => useMyWorkHomeEnvelope(), { wrapper: makeWrapper(stub) });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(rejection);
    expect(result.current.envelope).toBeUndefined();
  });
});

describe('useAdobeSignActionQueueEnvelope', () => {
  it('returns the resolved envelope and forwards the query argument', async () => {
    const stub = makeStubClient();
    const { result } = renderHook(() => useAdobeSignActionQueueEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.envelope).toBe(ADOBE_SIGN_QUEUE_AVAILABLE);
    expect(stub.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
  });

  it('stays in loading state for a never-resolving client', () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn<IMyWorkReadModelClient['getAdobeSignActionQueue']>(
        () => new Promise(() => {}),
      ),
    });
    const { result } = renderHook(() => useAdobeSignActionQueueEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    expect(result.current.status).toBe('loading');
  });

  it('surfaces rejection as error state', async () => {
    const rejection = new Error('queue-load-failed');
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockRejectedValue(rejection),
    });
    const { result } = renderHook(() => useAdobeSignActionQueueEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(rejection);
  });
});

describe('useMyProjectLinksEnvelope', () => {
  it('returns the resolved envelope', async () => {
    const stub = makeStubClient();
    const { result } = renderHook(() => useMyProjectLinksEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.envelope).toBe(PROJECT_LINKS_AVAILABLE);
    expect(stub.getMyProjectLinks).toHaveBeenCalledTimes(1);
  });

  it('stays in loading state for a never-resolving client', () => {
    const stub = makeStubClient({
      getMyProjectLinks: vi.fn<IMyWorkReadModelClient['getMyProjectLinks']>(
        () => new Promise(() => {}),
      ),
    });
    const { result } = renderHook(() => useMyProjectLinksEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    expect(result.current.status).toBe('loading');
  });

  it('surfaces rejection as error state', async () => {
    const rejection = new Error('project-links-load-failed');
    const stub = makeStubClient({
      getMyProjectLinks: vi.fn().mockRejectedValue(rejection),
    });
    const { result } = renderHook(() => useMyProjectLinksEnvelope(), {
      wrapper: makeWrapper(stub),
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(rejection);
  });
});

describe('multi-hook composition', () => {
  it('multiple hooks under one provider share the same client instance', async () => {
    const stub = makeStubClient();
    function Combined() {
      const home = useMyWorkHomeEnvelope();
      const queue = useAdobeSignActionQueueEnvelope();
      const links = useMyProjectLinksEnvelope();
      return { home, queue, links };
    }
    const { result } = renderHook(() => Combined(), { wrapper: makeWrapper(stub) });
    await waitFor(() => {
      expect(result.current.home.status).toBe('success');
      expect(result.current.queue.status).toBe('success');
      expect(result.current.links.status).toBe('success');
    });
    expect(stub.getMyWorkHome).toHaveBeenCalledTimes(1);
    expect(stub.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
    expect(stub.getMyProjectLinks).toHaveBeenCalledTimes(1);
  });
});
