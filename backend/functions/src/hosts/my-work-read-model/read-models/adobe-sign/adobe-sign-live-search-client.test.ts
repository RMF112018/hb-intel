import { describe, expect, it, vi } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_AGREEMENT_SEARCH_PATH,
  createAdobeSignLiveSearchClient,
} from './adobe-sign-live-search-client.js';
import { buildAdobeSignSearchRequest } from './adobe-sign-search-request.js';
import { buildAdobeSignRecentCompletionsRequest } from './adobe-sign-recent-completions-request.js';
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
  queryIntent?: 'action-queue' | 'recent-completions';
  bodyTopLevelKeyCount?: number;
  hasCursorField?: boolean;
  agreementAssetsCriteriaHasStatusField?: boolean;
  agreementAssetsCriteriaHasTypeField?: boolean;
  approvedStatusCount?: number | undefined;
  agreementAssetsCriteriaAgreementTypeCount?: number;
  agreementAssetsCriteriaSignedStatusCount?: number;
  agreementAssetsCriteriaHasModifiedDateField?: boolean;
  agreementAssetsCriteriaModifiedDateHasRangeField?: boolean;
  agreementAssetsCriteriaModifiedDateRangeHasLowerBoundField?: boolean;
  agreementAssetsCriteriaModifiedDateRangeHasUpperBoundField?: boolean;
  agreementAssetsCriteriaHasSortByField?: boolean;
  agreementAssetsCriteriaHasSortOrderField?: boolean;
}) {
  return {
    queryIntent: 'action-queue',
    endpointHost: 'api.na1.adobesign.com',
    endpointPath: '/api/rest/v6/search',
    method: 'POST',
    bodyTopLevelKeyCount: 2,
    hasScopeField: true,
    scopeAgreementAssetsCount: 1,
    hasAgreementAssetsCriteriaField: true,
    agreementAssetsCriteriaHasPageSizeField: true,
    agreementAssetsCriteriaHasStartIndexField: true,
    agreementAssetsCriteriaHasStatusField: false,
    agreementAssetsCriteriaHasRoleField: false,
    agreementAssetsCriteriaHasTypeField: false,
    hasMatchingFiltersInfoField: false,
    hasAgreementOriginInfoField: false,
    hasRecipientStatusFilterField: false,
    hasPageSizeField: false,
    hasCursorField: false,
    approvedStatusCount: 6,
    agreementAssetsCriteriaAgreementTypeCount: 0,
    agreementAssetsCriteriaSignedStatusCount: 0,
    agreementAssetsCriteriaHasModifiedDateField: false,
    agreementAssetsCriteriaModifiedDateHasRangeField: false,
    agreementAssetsCriteriaModifiedDateRangeHasLowerBoundField: false,
    agreementAssetsCriteriaModifiedDateRangeHasUpperBoundField: false,
    agreementAssetsCriteriaHasSortByField: false,
    agreementAssetsCriteriaHasSortOrderField: false,
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

  it('sends POST with Bearer authorization and scope + agreementAssetsCriteria body', async () => {
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
    expect(bodyJson.scope).toEqual(['AGREEMENT_ASSETS']);
    expect(bodyJson.agreementAssetsCriteria).toEqual({
      pageSize: 25,
      startIndex: 0,
    });
    expect(bodyJson.matchingFiltersInfo).toBeUndefined();
    expect(bodyJson.pageSize).toBeUndefined();
    expect(bodyJson.cursor).toBeUndefined();
  });

  it('decodes backend-generated cursor into agreementAssetsCriteria.startIndex', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignSearchRequest({
        pageSize: 50,
        cursor: 'adobe-search-start-index:75',
      }),
    });
    const [, init] = fetchSpy.mock.calls[0]!;
    const bodyJson = JSON.parse((init as RequestInit).body as string);
    expect(bodyJson.scope).toEqual(['AGREEMENT_ASSETS']);
    expect(bodyJson.agreementAssetsCriteria).toEqual({
      pageSize: 50,
      startIndex: 75,
    });
    expect(bodyJson.cursor).toBeUndefined();
  });

  it('rejects malformed cursor values without dispatching a malformed Adobe request', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(
      await client.search({
        ...VALID_INPUT,
        request: buildAdobeSignSearchRequest({ pageSize: 50, cursor: 'opaque-cursor' }),
      }),
    ).toEqual({ status: 'unreachable', reason: 'unknown' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('builds recent-completions body with signed agreement filters, modifiedDate range, and descending sort', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreements: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignRecentCompletionsRequest({
        now: new Date('2026-05-15T12:00:00.000Z'),
        pageSize: 10,
        cursor: 'adobe-search-start-index:5',
      }),
    });
    const [, init] = fetchSpy.mock.calls[0]!;
    const bodyJson = JSON.parse((init as RequestInit).body as string);
    expect(bodyJson).toEqual({
      scope: ['AGREEMENT_ASSETS'],
      agreementAssetsCriteria: {
        type: ['AGREEMENT'],
        status: ['SIGNED'],
        modifiedDate: {
          range: {
            gt: '2026-04-15T12:00:00.000Z',
            lt: '2026-05-15T12:00:00.000Z',
          },
        },
        startIndex: 5,
        pageSize: 10,
        sortByField: 'CREATED_DATE',
        sortOrder: 'DESC',
      },
    });
  });
});

describe('createAdobeSignLiveSearchClient — happy path', () => {
  it('accepts the confirmed live envelope agreementAssetsResults.agreementAssetsResultList', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreementAssetsResults: {
          agreementAssetsResultList: [
            {
              id: 'agreement-1',
              name: 'Envelope Name',
              recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
            },
          ],
          searchPageInfo: {},
          status: {},
          totalHits: 1,
        },
        totalHits: 1,
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toEqual([
      {
        intent: 'action-queue',
        agreementId: 'agreement-1',
        agreementName: 'Envelope Name',
        recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
      },
    ]);
  });

  it('accepts the confirmed live envelope with an empty agreementAssetsResultList', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreementAssetsResults: {
          agreementAssetsResultList: [],
          searchPageInfo: {},
          status: {},
          totalHits: 0,
        },
        totalHits: 0,
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toEqual([]);
  });

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
      intent: 'action-queue',
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
      intent: 'action-queue',
      agreementId: 'agr-2',
      agreementName: 'Contract B',
      recipientStatus: 'WAITING_FOR_MY_APPROVAL',
    });
    // Tolerates the alternate Adobe URL field name.
    expect(result.items[2]?.sourceOpenUrlCandidate).toBe(
      'https://secure.na1.adobesign.com/x?aid=3',
    );
    expect(result.nextCursor).toBeUndefined();
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

  it('drops action-queue rows missing recipientStatus', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreements: [{ id: 'agr-1', name: 'No Recipient Status' }],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toEqual([]);
  });

  it('retains recent-completions rows missing recipientStatus', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreements: [{ id: 'agr-1', name: 'Completed Without Recipient Status' }],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignRecentCompletionsRequest({
        now: new Date('2026-05-15T12:00:00.000Z'),
        pageSize: 10,
      }),
    });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toEqual([
      {
        intent: 'recent-completions',
        agreementId: 'agr-1',
        agreementName: 'Completed Without Recipient Status',
      },
    ]);
  });

  it('preserves optional recipientStatus passthrough for recent-completions rows', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreements: [
          {
            id: 'agr-1',
            name: 'Completed Agreement',
            recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
          },
        ],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignRecentCompletionsRequest({
        now: new Date('2026-05-15T12:00:00.000Z'),
        pageSize: 10,
      }),
    });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.items).toEqual([
      {
        intent: 'recent-completions',
        agreementId: 'agr-1',
        agreementName: 'Completed Agreement',
        recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
      },
    ]);
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
  it('2xx with agreementAssetsResults object but missing agreementAssetsResultList array remains malformed-response', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        agreementAssetsResults: {
          searchPageInfo: {},
          status: {},
          totalHits: 1,
        },
        totalHits: 1,
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
  });

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
      providerStatusCode: 400,
      providerErrorCode: 'invalid_request',
      providerResponseHasErrorField: true,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('recent-completions diagnostics include intent and completed-query shape markers', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_request' }, 400));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search({
      ...VALID_INPUT,
      request: buildAdobeSignRecentCompletionsRequest({
        now: new Date('2026-05-15T12:00:00.000Z'),
        pageSize: 10,
      }),
    });
    expect(result).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerStatusCode: 400,
      providerErrorCode: 'invalid_request',
      providerResponseHasErrorField: true,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics({
        queryIntent: 'recent-completions',
        agreementAssetsCriteriaHasStatusField: true,
        agreementAssetsCriteriaHasTypeField: true,
        approvedStatusCount: undefined,
        agreementAssetsCriteriaAgreementTypeCount: 1,
        agreementAssetsCriteriaSignedStatusCount: 1,
        agreementAssetsCriteriaHasModifiedDateField: true,
        agreementAssetsCriteriaModifiedDateHasRangeField: true,
        agreementAssetsCriteriaModifiedDateRangeHasLowerBoundField: true,
        agreementAssetsCriteriaModifiedDateRangeHasUpperBoundField: true,
        agreementAssetsCriteriaHasSortByField: true,
        agreementAssetsCriteriaHasSortOrderField: true,
      }),
    });
  });

  it('HTTP 400 code shape → normalized providerErrorCode + code field presence', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ code: 'INVALID_REQUEST' }, 400));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerStatusCode: 400,
      providerErrorCode: 'invalid_request',
      providerResponseHasErrorField: false,
      providerResponseHasCodeField: true,
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
      providerStatusCode: 400,
      providerResponseHasErrorField: true,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 400 non-JSON body → http-4xx with false/false provider field presence', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response('bad request', { status: 400, headers: { 'content-type': 'text/plain' } }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerStatusCode: 400,
      providerResponseHasErrorField: false,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 429 → unreachable + rate-limited', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'rate_limited' }, 429));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'rate-limited',
      providerStatusCode: 429,
      providerErrorCode: 'rate_limited',
      providerResponseHasErrorField: true,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 429 non-JSON body → rate-limited with false/false provider field presence', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response('rate limited', { status: 429, headers: { 'content-type': 'text/plain' } }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'rate-limited',
      providerStatusCode: 429,
      providerResponseHasErrorField: false,
      providerResponseHasCodeField: false,
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
    });
  });

  it('HTTP 500 → unreachable + http-5xx', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'server' }, 500));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
      providerStatusCode: 500,
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
        topLevelKeyCount: 1,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: true,
        hasNextCursorField: false,
        hasPageField: false,
        pageWasObject: false,
        pageHasNextCursorField: false,
        hasUserAgreementListField: false,
        hasUserAgreementListArray: false,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('Malformed (non-JSON) 200 body → unreachable + malformed-response', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: false,
        topLevelKeyCount: 0,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: false,
        pageWasObject: false,
        pageHasNextCursorField: false,
        hasUserAgreementListField: false,
        hasUserAgreementListArray: false,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.malformedSearchResponseDiagnostics?.topLevelKeyNamesCsv).toBe('');
    expect(result.malformedSearchResponseDiagnostics?.topLevelKeyTypesCsv).toBe('');
    expect(result.malformedSearchResponseDiagnostics?.topLevelObjectChildKeyTypesCsv).toBe('');
  });

  it('2xx with agreementAssets array exposes agreementAssets candidate diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssets: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 1,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: false,
        pageWasObject: false,
        pageHasNextCursorField: false,
        hasUserAgreementListField: false,
        hasUserAgreementListArray: false,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: true,
        hasAgreementAssetsArray: true,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with results array exposes results candidate diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ results: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 1,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: false,
        pageWasObject: false,
        pageHasNextCursorField: false,
        hasUserAgreementListField: false,
        hasUserAgreementListArray: false,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: true,
        hasResultsArray: true,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with agreementAssetList array exposes agreementAssetList diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssetList: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasAgreementAssetListField: true,
      hasAgreementAssetListArray: true,
    });
  });

  it('2xx with agreementAssetsList array exposes agreementAssetsList diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssetsList: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasAgreementAssetsListField: true,
      hasAgreementAssetsListArray: true,
    });
  });

  it('2xx with agreementAssetSearchResults array exposes agreementAssetSearchResults diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssetSearchResults: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasAgreementAssetSearchResultsField: true,
      hasAgreementAssetSearchResultsArray: true,
    });
  });

  it('2xx with agreementAssetSearchResultList array exposes agreementAssetSearchResultList diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssetSearchResultList: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasAgreementAssetSearchResultListField: true,
      hasAgreementAssetSearchResultListArray: true,
    });
  });

  it('2xx with searchResult.agreementAssets exposes nested searchResult diagnostics', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        searchResult: {
          agreementAssets: [],
        },
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasSearchResultField: true,
      searchResultWasObject: true,
      searchResultHasAgreementAssetsField: true,
      searchResultHasAgreementAssetsArray: true,
    });
  });

  it('2xx with metadata candidate fields exposes metadata diagnostics', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        pagingInfo: {},
        pagination: {},
        pageData: {},
        totalHits: 0,
        totalRecords: 0,
        startIndex: 0,
        pageSize: 25,
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics).toMatchObject({
      hasPagingInfoField: true,
      hasPaginationField: true,
      hasPageDataField: true,
      hasTotalHitsField: true,
      hasTotalRecordsField: true,
      hasStartIndexField: true,
      hasPageSizeField: true,
    });
  });

  it('2xx with top-level primitive and object fields emits deterministic top-level key/type telemetry', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        alpha: 1,
        beta: { inner: 'x' },
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics?.topLevelKeyNamesCsv).toBe('alpha,beta');
    expect(result.malformedSearchResponseDiagnostics?.topLevelKeyTypesCsv).toBe(
      'alpha:number,beta:object',
    );
  });

  it('2xx with top-level object having nested array child emits first-level child key/type telemetry', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        envelope: {
          rows: [],
          meta: {},
        },
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    const result = await client.search(VALID_INPUT);
    expect(result.status).toBe('unreachable');
    if (result.status !== 'unreachable') return;
    expect(result.reason).toBe('malformed-response');
    expect(result.malformedSearchResponseDiagnostics?.topLevelObjectChildKeyTypesCsv).toBe(
      'envelope.meta:object,envelope.rows:array',
    );
  });

  it('2xx with agreementAssets and totalCount exposes bounded metadata diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ agreementAssets: [], totalCount: 0 }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 2,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: false,
        pageWasObject: false,
        pageHasNextCursorField: false,
        hasUserAgreementListField: false,
        hasUserAgreementListArray: false,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: true,
        hasAgreementAssetsArray: true,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: true,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with page and userAgreementList envelope exposes bounded envelope diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ page: {}, userAgreementList: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 2,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: true,
        pageWasObject: true,
        pageHasNextCursorField: false,
        hasUserAgreementListField: true,
        hasUserAgreementListArray: true,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with page.nextCursor exposes nested page cursor diagnostics', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ page: { nextCursor: 'opaque' }, userAgreementList: [] }));
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 2,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: true,
        pageWasObject: true,
        pageHasNextCursorField: true,
        hasUserAgreementListField: true,
        hasUserAgreementListArray: true,
        userAgreementListHasAtLeastOneItem: false,
        firstUserAgreementWasObject: false,
        firstUserAgreementHasIdField: false,
        firstUserAgreementHasNameField: false,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with first userAgreementList row having id/name/status exposes first-row shape diagnostics', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        page: {},
        userAgreementList: [{ id: 'agreement-1', name: 'Agreement One', status: 'WAITING_FOR_MY_SIGNATURE' }],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 2,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: true,
        pageWasObject: true,
        pageHasNextCursorField: false,
        hasUserAgreementListField: true,
        hasUserAgreementListArray: true,
        userAgreementListHasAtLeastOneItem: true,
        firstUserAgreementWasObject: true,
        firstUserAgreementHasIdField: true,
        firstUserAgreementHasNameField: true,
        firstUserAgreementHasStatusField: true,
        firstUserAgreementHasRecipientStatusField: false,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
      },
    });
  });

  it('2xx with first userAgreementList row having recipientStatus exposes recipientStatus field-presence diagnostics', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        page: {},
        userAgreementList: [
          { id: 'agreement-1', name: 'Agreement One', recipientStatus: 'WAITING_FOR_MY_SIGNATURE' },
        ],
      }),
    );
    const client = createAdobeSignLiveSearchClient({ fetch: fetchSpy });
    expect(await client.search(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      searchRequestDiagnostics: expectedSearchRequestDiagnostics(),
      malformedSearchResponseDiagnostics: {
        bodyWasJsonObject: true,
        topLevelKeyCount: 2,
        hasTopLevelAgreementsArray: false,
        hasSearchAgreementsResponseField: false,
        hasNextCursorField: false,
        hasPageField: true,
        pageWasObject: true,
        pageHasNextCursorField: false,
        hasUserAgreementListField: true,
        hasUserAgreementListArray: true,
        userAgreementListHasAtLeastOneItem: true,
        firstUserAgreementWasObject: true,
        firstUserAgreementHasIdField: true,
        firstUserAgreementHasNameField: true,
        firstUserAgreementHasStatusField: false,
        firstUserAgreementHasRecipientStatusField: true,
        hasAgreementAssetsField: false,
        hasAgreementAssetsArray: false,
        hasResultsField: false,
        hasResultsArray: false,
        hasSearchResultsField: false,
        hasSearchResultsArray: false,
        hasResultListField: false,
        hasResultListArray: false,
        hasPageInfoField: false,
        hasTotalCountField: false,
        hasCurrentPageField: false,
        hasTotalPagesField: false,
        hasAgreementAssetListField: false,
        hasAgreementAssetListArray: false,
        hasAgreementAssetsListField: false,
        hasAgreementAssetsListArray: false,
        hasAgreementAssetSearchResultsField: false,
        hasAgreementAssetSearchResultsArray: false,
        hasAgreementAssetSearchResultListField: false,
        hasAgreementAssetSearchResultListArray: false,
        hasSearchResultField: false,
        searchResultWasObject: false,
        searchResultHasAgreementAssetsField: false,
        searchResultHasAgreementAssetsArray: false,
        hasPagingInfoField: false,
        hasPaginationField: false,
        hasPageDataField: false,
        hasTotalHitsField: false,
        hasTotalRecordsField: false,
        hasStartIndexField: false,
        hasPageSizeField: false,
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
