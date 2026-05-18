import { describe, expect, it, vi } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_AGREEMENT_SIGNING_URLS_PATH_SUFFIX,
  createAdobeSignLiveActionLinkClient,
} from './adobe-sign-live-action-link-client.js';
import type { AdobeSignActionLinkClientInput } from './adobe-sign-action-link-client.js';

const ACTOR = {
  tenantId: '11111111-2222-3333-4444-555555555555',
  oid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  actorKey: adobeSignActorKey('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  upn: 'signer@hbc.test',
};

const VALID_INPUT: AdobeSignActionLinkClientInput = {
  actor: ACTOR,
  agreementId: 'CBJCHBCAABAASHXLhpnMlIeuA2Pi3S7ewnID8yF8Qq4r',
  accessToken: 'at-do-not-leak',
  apiAccessPoint: 'https://api.na1.adobesign.com',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('createAdobeSignLiveActionLinkClient', () => {
  it('calls the v6 signingUrls endpoint with bearer auth', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          { signingUrls: [{ email: 'signer@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1' }] },
        ],
      }),
    );

    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    const result = await client.resolveActionLink(VALID_INPUT);

    expect(result).toEqual({
      status: 'ok',
      redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1',
      selectedBy: 'actor-match',
      urlCandidateCount: 1,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe(
      `${VALID_INPUT.apiAccessPoint}/api/rest/v6/agreements/${encodeURIComponent(VALID_INPUT.agreementId)}${ADOBE_SIGN_AGREEMENT_SIGNING_URLS_PATH_SUFFIX}`,
    );
    expect((init as RequestInit).method).toBe('GET');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.authorization).toBe(`Bearer ${VALID_INPUT.accessToken}`);
  });

  it('selects actor-matching participant URL when multiple signing URLs exist', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          {
            signingUrls: [
              { email: 'other@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=other' },
              { email: 'signer@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=me' },
            ],
          },
        ],
      }),
    );
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'ok',
      redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=me',
      selectedBy: 'actor-match',
      urlCandidateCount: 2,
    });
  });

  it('falls back to a single participant URL when actor match is absent', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          { signingUrls: [{ email: 'someone@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=single' }] },
        ],
      }),
    );
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'ok',
      redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=single',
      selectedBy: 'single-candidate',
      urlCandidateCount: 1,
    });
  });

  it('resolves exactly one valid esignUrl candidate without requiring email match', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          { signingUrls: [{ esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=single-no-email' }] },
        ],
      }),
    );
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'ok',
      redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=single-no-email',
      selectedBy: 'single-candidate',
      urlCandidateCount: 1,
    });
  });

  it('pre-patch failure classification: multiple candidates without actor match are no-recipient-match (candidate selection failure)', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          {
            signingUrls: [
              { esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=a' },
              { esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=b' },
            ],
          },
        ],
      }),
    );
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'no-recipient-match',
      urlCandidateCount: 2,
    });
  });

  it('returns no-recipient-match when multiple participant URLs exist and actor match is absent', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        signingUrlSetInfos: [
          {
            signingUrls: [
              { email: 'a@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=a' },
              { email: 'b@hbc.test', esignUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=b' },
            ],
          },
        ],
      }),
    );
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'no-recipient-match',
      urlCandidateCount: 2,
    });
  });

  it('returns no-action-url for empty signing URL collections', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ signingUrlSetInfos: [{ signingUrls: [] }] }));
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({ status: 'no-action-url', urlCandidateCount: 0 });
  });

  it('returns malformed-response when body shape is not signingUrlSetInfos[]', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ notSigningUrls: true }));
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
    });
  });

  it('maps 401 and 403 to unauthorized', async () => {
    const c401 = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 401)) });
    const c403 = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 403)) });
    expect(await c401.resolveActionLink(VALID_INPUT)).toEqual({ status: 'unauthorized' });
    expect(await c403.resolveActionLink(VALID_INPUT)).toEqual({ status: 'unauthorized' });
  });

  it('maps 404 to not-ready', async () => {
    const client = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 404)) });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({ status: 'not-ready' });
  });

  it('maps 429 to rate-limited', async () => {
    const client = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 429)) });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({ status: 'rate-limited' });
  });

  it('maps 5xx to unreachable:http-5xx', async () => {
    const client = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 503)) });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
      providerStatusCode: 503,
    });
  });

  it('maps generic 4xx to unreachable:http-4xx', async () => {
    const client = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 400)) });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerStatusCode: 400,
    });
  });

  it('maps invalid access points to unreachable:invalid-access-point and does not call fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({}));
    const client = createAdobeSignLiveActionLinkClient({ fetch: fetchSpy });
    expect(
      await client.resolveActionLink({
        ...VALID_INPUT,
        apiAccessPoint: 'http://localhost:7071',
      }),
    ).toEqual({
      status: 'unreachable',
      reason: 'invalid-access-point',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('maps network failures to unreachable:network', async () => {
    const client = createAdobeSignLiveActionLinkClient({
      fetch: vi.fn(async () => {
        throw new Error('network');
      }),
    });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'network',
    });
  });

  it('maps timeout failures to unreachable:timeout', async () => {
    const client = createAdobeSignLiveActionLinkClient({
      fetch: vi.fn(async () => {
        const e = new Error('aborted') as Error & { name: string };
        e.name = 'AbortError';
        throw e;
      }),
      timeoutMs: 1,
    });
    expect(await client.resolveActionLink(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'timeout',
    });
  });

  it('does not leak access tokens in failure outcomes', async () => {
    const client = createAdobeSignLiveActionLinkClient({ fetch: vi.fn(async () => jsonResponse({}, 503)) });
    const result = await client.resolveActionLink(VALID_INPUT);
    expect(JSON.stringify(result)).not.toContain(VALID_INPUT.accessToken);
  });
});
