import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MY_WORK_HOME_AUTHORIZATION_REQUIRED } from '@hbc/models/myWork/fixtures';
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
    getAdobeSignActionQueue: vi.fn(),
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

describe('MyWorkShell — Adobe Sign OAuth end-to-end handler', () => {
  it('POSTs to /api/my-work/me/adobe-sign/oauth/start with bearer + returnPath, then navigates to authorizationUrl', async () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://func.example.invalid',
    });
    // The shell mounts MyProjectsHomeCard alongside the consolidated Adobe
    // card on the home page, which also issues a fetch (project-links) under
    // backend posture. Return a fresh Response per call (Response bodies can
    // only be consumed once) and key the OAuth response by URL.
    const fetchSpy = vi.fn().mockImplementation(async (input: string | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.endsWith('/api/my-work/me/adobe-sign/oauth/start')) {
        return makeStartResponse('https://secure.adobesign.com/public/oauth/v2?state=opaque');
      }
      // Generic OK body for any unrelated fetches (e.g. project-links).
      return new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchSpy);
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

    // The consolidated Adobe card surfaces the Connect CTA in
    // authorization-required state when a getApiToken provider is supplied.
    const button = await waitFor(() => {
      const b = container.querySelector(
        '[data-adobe-sign-connect-action="start"]',
      ) as HTMLButtonElement | null;
      expect(b).not.toBeNull();
      return b!;
    });
    // The card stamps the source-status marker so a hosted-tenant screenshot
    // reviewer can grep one attribute to prove the auth-required branch.
    const card = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('authorization-required');
    expect(button.getAttribute('data-adobe-sign-connect-state')).toBe('idle');

    fireEvent.click(button);

    // The shell also mounts MyProjectsHomeCard alongside the consolidated Adobe
    // card on the home page; with a backend-posture getApiToken, that card
    // makes its own `/api/my-work/me/project-links` fetch. Filter the spy to
    // the OAuth-start call rather than asserting the call count.
    await waitFor(() => {
      const oauthCall = fetchSpy.mock.calls.find((call) => {
        const url = typeof call[0] === 'string' ? call[0] : (call[0] as URL).toString();
        return url.endsWith('/api/my-work/me/adobe-sign/oauth/start');
      });
      expect(oauthCall).toBeDefined();
    });
    const oauthCall = fetchSpy.mock.calls.find((call) => {
      const url = typeof call[0] === 'string' ? call[0] : (call[0] as URL).toString();
      return url.endsWith('/api/my-work/me/adobe-sign/oauth/start');
    })!;
    const [calledUrl, calledInit] = oauthCall as [string | URL, RequestInit | undefined];
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
  });

  it('omits the Connect CTA on the consolidated Adobe card when getApiToken is not provided (legacy fixture posture)', async () => {
    const { container } = render(
      <MyWorkReadModelClientProvider client={makeAuthorizationRequiredStub()}>
        <MyWorkShell />
      </MyWorkReadModelClientProvider>,
    );
    await waitFor(() => {
      expect(
        container.querySelector('[data-my-work-card-role="adobe-sign-action-queue"]'),
      ).not.toBeNull();
    });
    const card = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(card.getAttribute('data-adobe-sign-action-queue-state')).toBe('authorization-required');
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });
});
