import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

import { ADOBE_SIGN_QUEUE_AVAILABLE, MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';

import {
  MyWorkActiveEnvelopeProvider,
  MyWorkFocusedAdobeEnvelopeProvider,
  MyWorkHomeEnvelopeProvider,
  useMyWorkFocusedAdobeEnvelopeContext,
  useMyWorkHomeEnvelopeContext,
} from './MyWorkActiveEnvelopeContext.js';

const PROJECT_LINKS_AVAILABLE: MyWorkReadModelEnvelope<MyProjectLinksReadModel> = {
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-05-13T00:00:00Z',
  data: { items: [], paging: { hasMore: false } } as unknown as MyProjectLinksReadModel,
};

function makeStubClient(): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AVAILABLE),
    getMyProjectLinks: vi.fn().mockResolvedValue(PROJECT_LINKS_AVAILABLE),
    startAdobeSignOAuth: vi.fn(),
  };
}

function HomeProbe() {
  const state = useMyWorkHomeEnvelopeContext();
  return (
    <span data-probe="home" data-status={state.status}>
      {state.status === 'success' ? state.envelope.sourceStatus : ''}
    </span>
  );
}

function FocusedProbe() {
  const state = useMyWorkFocusedAdobeEnvelopeContext();
  return (
    <span data-probe="focused" data-status={state.status}>
      {state.status === 'success' ? state.envelope.sourceStatus : ''}
    </span>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MyWorkActiveEnvelopeContext — providers', () => {
  it('home provider publishes the home envelope and fetches it exactly once', async () => {
    const client = makeStubClient();
    const { container } = render(
      <MyWorkReadModelClientProvider client={client}>
        <MyWorkHomeEnvelopeProvider>
          <HomeProbe />
        </MyWorkHomeEnvelopeProvider>
      </MyWorkReadModelClientProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-probe="home"]')?.getAttribute('data-status')).toBe(
        'success',
      ),
    );
    expect(container.querySelector('[data-probe="home"]')?.textContent).toBe('available');
    expect(client.getMyWorkHome).toHaveBeenCalledTimes(1);
    expect(client.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('focused Adobe provider publishes the queue envelope and fetches it exactly once', async () => {
    const client = makeStubClient();
    const { container } = render(
      <MyWorkReadModelClientProvider client={client}>
        <MyWorkFocusedAdobeEnvelopeProvider>
          <FocusedProbe />
        </MyWorkFocusedAdobeEnvelopeProvider>
      </MyWorkReadModelClientProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-probe="focused"]')?.getAttribute('data-status')).toBe(
        'success',
      ),
    );
    expect(container.querySelector('[data-probe="focused"]')?.textContent).toBe('available');
    expect(client.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
    expect(client.getMyWorkHome).not.toHaveBeenCalled();
  });

  it('consumer hook throws when used outside its matching provider', () => {
    // React's error reporting routes uncaught render errors through
    // console.error. Stub it to keep test output clean while still asserting
    // the throw via Testing Library's render-catch.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<HomeProbe />)).toThrow(/missing <MyWorkHomeEnvelopeProvider>/);
      cleanup();
      expect(() => render(<FocusedProbe />)).toThrow(
        /missing <MyWorkFocusedAdobeEnvelopeProvider>/,
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('MyWorkActiveEnvelopeProvider — router', () => {
  it('mounts the home provider when activeModuleId is undefined', async () => {
    const client = makeStubClient();
    const { container } = render(
      <MyWorkReadModelClientProvider client={client}>
        <MyWorkActiveEnvelopeProvider>
          <HomeProbe />
        </MyWorkActiveEnvelopeProvider>
      </MyWorkReadModelClientProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-probe="home"]')?.getAttribute('data-status')).toBe(
        'success',
      ),
    );
    expect(client.getMyWorkHome).toHaveBeenCalledTimes(1);
    expect(client.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('mounts the focused Adobe provider when activeModuleId is "adobe-sign-action-queue"', async () => {
    const client = makeStubClient();
    const { container } = render(
      <MyWorkReadModelClientProvider client={client}>
        <MyWorkActiveEnvelopeProvider activeModuleId="adobe-sign-action-queue">
          <FocusedProbe />
        </MyWorkActiveEnvelopeProvider>
      </MyWorkReadModelClientProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-probe="focused"]')?.getAttribute('data-status')).toBe(
        'success',
      ),
    );
    expect(client.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
    expect(client.getMyWorkHome).not.toHaveBeenCalled();
  });
});
