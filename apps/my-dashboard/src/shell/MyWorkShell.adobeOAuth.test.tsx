import { fireEvent, render, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
} from '@hbc/models/myWork/fixtures';
import type { MyProjectLinksReadModel, MyWorkReadModelEnvelope } from '@hbc/models/myWork';

import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
import { _resetConfig, setRuntimeConfig } from '../config/runtimeConfig.js';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';

import { MyWorkShell } from './MyWorkShell.js';

const PROJECT_LINKS_AVAILABLE: MyWorkReadModelEnvelope<MyProjectLinksReadModel> = {
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-05-13T00:00:00Z',
  data: { items: [], paging: { hasMore: false } } as unknown as MyProjectLinksReadModel,
};

function makeAuthorizationRequiredStub(): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AUTHORIZATION_REQUIRED),
    getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED),
    getMyProjectLinks: vi.fn().mockResolvedValue(PROJECT_LINKS_AVAILABLE),
    startAdobeSignOAuth: vi.fn(),
  };
}

beforeEach(() => {
  _resetConfig();
  window.history.replaceState({}, '', '/test-return-path');
});

afterEach(() => {
  cleanup();
  _resetConfig();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

function makeStartResponse(authorizationUrl: string): Response {
  return new Response(
    JSON.stringify({
      data: {
        authorizationUrl,
        stateExpiresAtUtc: '2026-05-13T12:00:00.000Z',
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

async function openAdobeFocusedModule(container: HTMLElement): Promise<void> {
  const launcher = container.querySelector(
    '[data-my-work-module-launcher="my-work-home"]',
  ) as HTMLButtonElement;
  fireEvent.click(launcher);
  const item = container.querySelector(
    '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
  ) as HTMLButtonElement;
  fireEvent.click(item);
}

describe('MyWorkShell — Adobe Sign OAuth end-to-end handler', () => {
  it('POSTs to /api/my-work/me/adobe-sign/oauth/start with bearer + returnPath, then navigates to authorizationUrl', async () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://func.example.invalid',
    });
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(
        makeStartResponse('https://secure.adobesign.com/public/oauth/v2?state=opaque'),
      );
    vi.stubGlobal('fetch', fetchSpy);
    // jsdom's window.location object is non-configurable; replace it
    // wholesale via vi.stubGlobal which manages property descriptors.
    const assignSpy = vi.fn();
    vi.stubGlobal('location', {
      ...window.location,
      pathname: '/test-return-path',
      search: '',
      hash: '',
      href: 'http://localhost/test-return-path',
      assign: assignSpy,
      replace: vi.fn(),
      reload: vi.fn(),
    });

    const getApiToken = vi.fn().mockResolvedValue('test-bearer-token');
    const { container } = render(
      <MyWorkReadModelClientProvider client={makeAuthorizationRequiredStub()}>
        <MyWorkShell getApiToken={getApiToken} />
      </MyWorkReadModelClientProvider>,
    );

    await openAdobeFocusedModule(container);

    // Wait for the focused-module non-ready guidance card + Connect button.
    // The shell's default provider with backendMode=production + no getApiToken
    // would land on backend-unavailable. Here getApiToken IS provided but the
    // provider's wrapped client uses the shell's outer getApiToken via the
    // shell, not the provider — the focused-module envelope is fetched by the
    // hook with the provider's getApiToken (which is undefined here), so the
    // queue resolves backend-unavailable → non-ready variant → Connect CTA.
    const button = await waitFor(() => {
      const b = container.querySelector(
        '[data-adobe-sign-connect-action="start"]',
      ) as HTMLButtonElement | null;
      expect(b).not.toBeNull();
      return b!;
    });

    // Prompt 03 closure: the focused panel must carry the
    // `authorization-required` guidance marker so a hosted-tenant screenshot
    // reviewer can grep one attribute to prove the auth-required branch was
    // actually rendered (and not a fixture-ready path masquerading as it).
    const guidance = container.querySelector(
      '[data-my-work-card-role="adobe-sign-connection-guidance"]',
    );
    expect(guidance?.getAttribute('data-adobe-sign-guidance-status')).toBe(
      'authorization-required',
    );
    expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('idle');

    fireEvent.click(button);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0] as [
      string | URL,
      RequestInit | undefined,
    ];
    const calledUrlStr = typeof calledUrl === 'string' ? calledUrl : calledUrl.toString();
    expect(calledUrlStr).toBe('https://func.example.invalid/api/my-work/me/adobe-sign/oauth/start');
    expect(calledInit?.method).toBe('POST');
    const headers = new Headers(calledInit?.headers ?? {});
    expect(headers.get('Authorization')).toBe('Bearer test-bearer-token');
    expect(getApiToken).toHaveBeenCalled();
    const bodyText =
      typeof calledInit?.body === 'string' ? calledInit.body : JSON.stringify(calledInit?.body);
    expect(bodyText).toContain('/test-return-path');

    await waitFor(() => {
      expect(assignSpy).toHaveBeenCalledWith(
        'https://secure.adobesign.com/public/oauth/v2?state=opaque',
      );
    });
    // vi.restoreAllMocks() in afterEach unstubs the global automatically.
  });

  it('omits the Connect CTA on the focused module when getApiToken is not provided (legacy fixture posture)', async () => {
    const { container } = render(
      <MyWorkReadModelClientProvider>
        <MyWorkShell />
      </MyWorkReadModelClientProvider>,
    );
    await openAdobeFocusedModule(container);
    // No getApiToken → handleConnectAdobeSign is undefined → guidance card's
    // CTA visibility falls back to the legacy onConnect-only path → no button.
    await waitFor(() => {
      expect(
        container.querySelector('[data-my-work-card-role="adobe-sign-connection-guidance"]'),
      ).not.toBeNull();
    });
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});
