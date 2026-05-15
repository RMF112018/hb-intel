import { describe, expect, it, vi } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_AGREEMENT_SEARCH_PATH,
  createAdobeSignLiveSearchClient,
} from './adobe-sign-live-search-client.js';
import { buildAdobeSignSearchRequest } from './adobe-sign-search-request.js';
import type { AdobeSignSearchClientInput } from './adobe-sign-search-client.js';

const ACTOR_KEY = adobeSignActorKey(
  '11111111-2222-3333-4444-555555555555',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
);
const ACCESS_TOKEN = 'at-do-not-leak';
const VALID_INPUT: AdobeSignSearchClientInput = {
  actorKey: ACTOR_KEY,
  accessToken: ACCESS_TOKEN,
  apiAccessPoint: 'https://api.na1.adobesign.com',
  request: buildAdobeSignSearchRequest({ pageSize: 25 }),
};

const VALID_AGREEMENT = {
  id: 'agr-1',
  name: 'Contract A',
  recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
  senderInfo: { name: 'Alice', email: 'alice@example.com' },
  displayDate: '2026-05-10T00:00:00.000Z',
  lastUpdate: '2026-05-11T00:00:00.000Z',
  expirationTime: '2026-05-20T00:00:00.000Z',
  viewURL: 'https://secure.na1.adobesign.com/account/agreementView?aid=1',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedSearchRequestDiagnostics(overrides?: {
  bodyTopLevelKeyCount?: number;
  hasCursorField?: boolean;
}) {
  return {
    endpointHost: 'api.na1.adobesign.com',
    endpointPath: '/api/rest/v6/search',
    method: 'POST',
    bodyTopLevelKeyCount: 2,
    hasMatchingFiltersInfoField: true,
    hasAgreementOriginInfoField: true,
    hasRecipientStatusFilterField: true,
    hasPageSizeField: true,
    hasCursorField: false,
    approvedStatusCount: 6,
    ...overrides,
  };
}

describe('createAdobeSignLiveSearchClient — request shape', () => {
  it('targets {apiAccessPoint}/api/rest/v6/search exactly', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    await client.search(VALID_INPUT);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchSpy.mock.calls[0]!;
    expect(calledUrl).toBe(`${VALID_INPUT.apiAccessPoint}${ADOBE_SIGN_AGREEMENT_SEARCH_PATH}`);
  });

  it('sends POST with Bearer authorization, JSON content-type, and pageSize + status filter in body', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    await client.search(VALID_INPUT);
    const [, init] = fetchSpy.mock.calls[0]!;
    const initObj = init as RequestInit;
    expect(initObj.method).toBe('POST');
    const headers = initObj.headers as Record<string, string>;
    expect(headers.authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(headers['content-type']).toBe('application/json');
    const bodyJson = JSON.parse(initObj.body as string);
    expect(bodyJson.pageSize).toBe(25);
    expect(bodyJson.matchingFiltersInfo.recipientStatusFilter.values).toEqual([
      'WAITING_FOR_MY_SIGNATURE',
      'WAITING_FOR_MY_APPROVAL',
      'WAITING_FOR_MY_ACCEPTANCE',
      'WAITING_FOR_MY_ACKNOWLEDGEMENT',
      'WAITING_FOR_MY_FORM_FILLING',
      'WAITING_FOR_MY_DELEGATION',
    ]);
    expect(bodyJson.cursor).toBeUndefined();
  });

  it('includes cursor in the body only when provided', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignSearchRequest({ pageSize: 50, cursor: 'opaque-cursor' }),
    });
    const [, init] = fetchSpy.mock.calls[0]!;
    const bodyJson = JSON.parse((init as RequestInit).body as string);
    expect(bodyJson.pageSize).toBe(50);
    expect(bodyJson.cursor).toBe('opaque-cursor');
  });
});

describe('createAdobeSignLiveSearchClient — happy path', () => {
  it('maps a multi-row agreements response into AdobeSignSearchClientItem rows', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreements: [
          VALID_AGREEMENT,
          {
            id: 'agr-2',
            name: 'Contract B',
            recipientStatus: 'WAITING_FOR_MY_APPROVAL',
          },
          {
            id: 'agr-3',
            name: 'Contract C',
            recipientStatus: 'WAITING_FOR_MY_ACCEPTANCE',
            agreementViewUrl: 'https://secure.na1.adobesign.com/x?aid=3',
          },
        ],
        nextCursor: 'next-page-token',
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toMatchObject({
      agreementId: 'agr-1',
      agreementName: 'Contract A',
      recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
      senderDisplayName: 'Alice',
      senderEmail: 'alice@example.com',
      createdAtUtc: '2026-05-10T00:00:00.000Z',
      modifiedAtUtc: '2026-05-11T00:00:00.000Z',
      expirationAtUtc: '2026-05-20T00:00:00.000Z',
      sourceOpenUrlCandidate: 'https://secure.na1.adobesign.com/account/agreementView?aid=1',
    });
    expect(result.items[1]).toEqual({
      agreementId: 'agr-2',
      agreementName: 'Contract B',
      recipientStatus: 'WAITING_FOR_MY_APPROVAL',
    });
    // Tolerates the alternate Adobe URL field name.
    expect(result.items[2]?.sourceOpenUrlCandidate).toBe(
      'https://secure.na1.adobesign.com/x?aid=3',
    );
    expect(result.nextCursor).toBe('next-page-token');
  });

  it('silently drops a row that is missing a required field; the rest survive', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreements: [
          VALID_AGREEMENT,
          { name: 'no-id-row', recipientStatus: 'WAITING_FOR_MY_SIGNATURE' },
          { id: 'agr-3', name: 'Contract C', recipientStatus: 'WAITING_FOR_MY_DELEGATION' },
        ],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items.map((item) => item.agreementId)).toEqual(['agr-1', 'agr-3']);
  });

  it('omits nextCursor when absent from the response', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [VALID_AGREEMENT] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.nextCursor).toBeUndefined();
  });
});

describe('createAdobeSignLiveSearchClient — error mappings', () => {
  it('HTTP 401 → unauthorized', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'unauthorized' }, 401));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({ status: 'unauthorized' });
  });

  it('HTTP 403 → unauthorized', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'forbidden' }, 403));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({ status: 'unauthorized' });
  });

  it('HTTP 400 invalid_request → unreachable + http-4xx + providerErrorCode + diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_request' }, 400));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerErrorCode: 'invalid_request',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 400 with unsafe provider error narrative omits providerErrorCode', async () => {
    const fetchSpy = vi.fn(
      async () => jsonResponse({ error: 'Request body is not valid for this endpoint' }, 400),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 429 → unreachable + rate-limited', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'rate_limited' }, 429));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'rate-limited',
      providerErrorCode: 'rate_limited',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 500 → unreachable + http-5xx', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'server' }, 500));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('network throw → unreachable + network', async () => {
    const fetchSpy = vi.fn(async () => {
      throw new Error('network down');
    });
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'network',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('AbortError throw → unreachable + timeout', async () => {
    const fetchSpy = vi.fn(async () => {
      const err = new Error('aborted') as Error & { name: string };
      err.name = 'AbortError';
      throw err;
    });
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'timeout',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('200 without an agreements array → unreachable + malformed-response', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ searchAgreementsResponse: {} }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: true,
        hasNextCursorField: false,
      },
    });
  });

  it('Malformed (non-JSON) 200 body → unreachable + malformed-response', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: false,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
      },
    });
  });
});

describe('createAdobeSignLiveSearchClient — pre-fetch access-point validation', () => {
  it('rejects a non-HTTPS apiAccessPoint without calling fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search({
      ...VALID_INPUT,
      apiAccessPoint: 'http://api.na1.adobesign.com',
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-allow-listed host without calling fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search({
      ...VALID_INPUT,
      apiAccessPoint: 'https://attacker.example.com',
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createAdobeSignLiveSearchClient — no secret leak in failure outcomes', () => {
  it('does not echo the accessToken in any failure result', async () => {
    const scenarios: Array<() => Promise<Response>> = [
      async () => jsonResponse({}, 401),
      async () => jsonResponse({}, 500),
      async () => jsonResponse({}, 429),
      async () => {
        throw new Error('network');
      },
    ];
    for (const scenario of scenarios) {
      const fetchSpy = vi.fn(scenario);
      const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
      const result = await client.search(VALID_INPUT);
      expect(JSON.stringify(result)).not.toContain(ACCESS_TOKEN);
    }
  });
});
