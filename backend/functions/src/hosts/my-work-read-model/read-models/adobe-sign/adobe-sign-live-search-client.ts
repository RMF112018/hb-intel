/**
 * Adobe Sign live search HTTP adapter — B05 remediation Prompt 05.
 *
 * Production implementation of `IAdobeSignSearchClient` against the
 * bounded Adobe Acrobat Sign agreement-search endpoint
 * `POST {api_access_point}/api/rest/v6/search`. Closes the contract
 * already declared in `adobe-sign-search-client.ts` so the
 * `createAdobeSignActionQueueAdapter(...)` orchestrator can run end-to-
 * end against a real Adobe tenant.
 *
 * Boundary guarantees:
 *
 *   - The `apiAccessPoint` is validated against the canonical
 *     Adobe-Sign suffix allow-list (`isAllowedAdobeAccessPoint`)
 *     before any network call — a forged grant cannot redirect the
 *     search round trip.
 *   - The bearer access token is supplied only via the
 *     `authorization` header; it never appears in URLs, bodies, logs,
 *     thrown errors, or returned failure outcomes.
 *   - The recipient-status filter is fixed at the boundary to the
 *     `request.approvedStatuses` set the bounded
 *     `buildAdobeSignSearchRequest` produced; per the existing
 *     internal contract this is the six MVP user-action statuses.
 *   - Adobe's response body is parsed defensively; structurally
 *     malformed rows are silently dropped (the upstream adapter
 *     handles unsupported recipient statuses separately). A wholly
 *     malformed body normalises to `{ status: 'unreachable', reason:
 *     'unknown' }` — the adapter never sees raw vendor payload.
 *   - The Adobe v6 agreement-search wire-shape used here is the
 *     best-known commercial shape; the exact body property names are
 *     verification-pending the first hosted round trip. The adapter
 *     test pins the boundary fields the contract requires (status
 *     filter values, `pageSize`, `cursor`, `authorization` header)
 *     so the live shape can be tuned without breaking the contract.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client
 */

import {
  ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS,
  isAllowedAdobeAccessPoint,
} from './adobe-sign-live-oauth-service.js';
import type {
  AdobeSignSearchClientInput,
  AdobeSignSearchClientItem,
  AdobeSignSearchResult,
  IAdobeSignSearchClient,
} from './adobe-sign-search-client.js';

export const ADOBE_SIGN_AGREEMENT_SEARCH_PATH = '/api/rest/v6/search' as const;

export type AdobeSignLiveFetch = typeof globalThis.fetch;

export interface AdobeSignLiveSearchClientDeps {
  /** Defaults to `globalThis.fetch`. */
  readonly fetch?: AdobeSignLiveFetch;
  /** Defaults to `ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS`. */
  readonly timeoutMs?: number;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function readStringField(value: unknown, key: string): string | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

function readNestedString(value: unknown, parent: string, key: string): string | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const nested = (value as Record<string, unknown>)[parent];
  return readStringField(nested, key);
}

function readSourceOpenUrlCandidate(row: unknown): string | undefined {
  // The exact Adobe v6 field name for an agreement-view URL is
  // verification-pending; tolerate both documented spellings.
  return readStringField(row, 'viewURL') ?? readStringField(row, 'agreementViewUrl');
}

function normalizeSafeProviderErrorCode(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const normalized = raw.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > 64) return undefined;
  return /^[a-z0-9_-]+$/.test(normalized) ? normalized : undefined;
}

function readErrorCodeFromAdobeBody(body: unknown): string | undefined {
  if (body === null || typeof body !== 'object') return undefined;
  const asRecord = body as Record<string, unknown>;
  const error = asRecord.error;
  if (typeof error === 'string') return error;
  const code = asRecord.code;
  return typeof code === 'string' ? code : undefined;
}

function readProviderErrorFieldPresence(body: unknown): {
  readonly providerResponseHasErrorField: boolean;
  readonly providerResponseHasCodeField: boolean;
} {
  if (body === null || typeof body !== 'object') {
    return {
      providerResponseHasErrorField: false,
      providerResponseHasCodeField: false,
    };
  }
  const asRecord = body as Record<string, unknown>;
  return {
    providerResponseHasErrorField: Object.prototype.hasOwnProperty.call(asRecord, 'error'),
    providerResponseHasCodeField: Object.prototype.hasOwnProperty.call(asRecord, 'code'),
  };
}

const ADOBE_SEARCH_CURSOR_PREFIX = 'adobe-search-start-index:' as const;

function decodeSearchStartIndex(cursor: string | undefined): number | 'invalid' {
  if (cursor === undefined) return 0;
  if (!cursor.startsWith(ADOBE_SEARCH_CURSOR_PREFIX)) return 'invalid';
  const raw = cursor.slice(ADOBE_SEARCH_CURSOR_PREFIX.length);
  if (!/^\d+$/.test(raw)) return 'invalid';
  const parsed = Number.parseInt(raw, 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 'invalid';
}

function buildSearchRequestDiagnostics(url: string, body: Record<string, unknown>, method: string) {
  const parsed = new URL(url);
  const scope = body.scope;
  const scopeValues = Array.isArray(scope) ? scope.filter((s) => s === 'AGREEMENT_ASSETS') : [];
  const criteria = body.agreementAssetsCriteria;
  const criteriaObj =
    criteria !== null && typeof criteria === 'object'
      ? (criteria as Record<string, unknown>)
      : undefined;
  return {
    endpointHost: parsed.hostname,
    endpointPath: parsed.pathname,
    method,
    bodyTopLevelKeyCount: Object.keys(body).length,
    hasScopeField: Object.prototype.hasOwnProperty.call(body, 'scope'),
    scopeAgreementAssetsCount: scopeValues.length,
    hasAgreementAssetsCriteriaField: Object.prototype.hasOwnProperty.call(
      body,
      'agreementAssetsCriteria',
    ),
    agreementAssetsCriteriaHasPageSizeField:
      criteriaObj !== undefined && Object.prototype.hasOwnProperty.call(criteriaObj, 'pageSize'),
    agreementAssetsCriteriaHasStartIndexField:
      criteriaObj !== undefined && Object.prototype.hasOwnProperty.call(criteriaObj, 'startIndex'),
    agreementAssetsCriteriaHasStatusField:
      criteriaObj !== undefined && Object.prototype.hasOwnProperty.call(criteriaObj, 'status'),
    agreementAssetsCriteriaHasRoleField:
      criteriaObj !== undefined && Object.prototype.hasOwnProperty.call(criteriaObj, 'role'),
    agreementAssetsCriteriaHasTypeField:
      criteriaObj !== undefined && Object.prototype.hasOwnProperty.call(criteriaObj, 'type'),
    hasMatchingFiltersInfoField: Object.prototype.hasOwnProperty.call(body, 'matchingFiltersInfo'),
    hasAgreementOriginInfoField: false,
    hasRecipientStatusFilterField: false,
    hasPageSizeField: Object.prototype.hasOwnProperty.call(body, 'pageSize'),
    hasCursorField: Object.prototype.hasOwnProperty.call(body, 'cursor'),
    approvedStatusCount: 0,
  };
}

function buildMalformedSearchResponseDiagnostics(parsed: unknown) {
  const sanitizeTelemetryKey = (key: string): string => {
    const trimmed = key.trim().slice(0, 64);
    if (trimmed.length === 0) return 'empty_key';
    return trimmed.replace(/[^a-zA-Z0-9_.-]/g, '_');
  };

  const classifyValueType = (
    value: unknown,
  ): 'array' | 'object' | 'string' | 'number' | 'boolean' | 'null' | 'unknown' => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    switch (typeof value) {
      case 'object':
        return 'object';
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'unknown';
    }
  };

  const attachDeterministicShapeDiagnostics = (
    diagnostics: Record<string, unknown>,
    body: Record<string, unknown> | undefined,
  ) => {
    if (!body) {
      Object.defineProperties(diagnostics, {
        topLevelKeyNamesCsv: { value: '', enumerable: false },
        topLevelKeyTypesCsv: { value: '', enumerable: false },
        topLevelObjectChildKeyTypesCsv: { value: '', enumerable: false },
      });
      return diagnostics;
    }
    const topLevelEntries = Object.entries(body).slice(0, 16);
    const topLevelKeyNamesCsv = topLevelEntries
      .map(([k]) => sanitizeTelemetryKey(k))
      .sort()
      .join(',');
    const topLevelKeyTypesCsv = topLevelEntries
      .map(([k, v]) => `${sanitizeTelemetryKey(k)}:${classifyValueType(v)}`)
      .sort()
      .join(',');
    const topLevelObjectChildKeyTypes: string[] = [];
    for (const [key, value] of topLevelEntries) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) continue;
      const parent = sanitizeTelemetryKey(key);
      const childEntries = Object.entries(value as Record<string, unknown>).slice(0, 12);
      for (const [childKey, childValue] of childEntries) {
        topLevelObjectChildKeyTypes.push(
          `${parent}.${sanitizeTelemetryKey(childKey)}:${classifyValueType(childValue)}`,
        );
      }
      if (topLevelObjectChildKeyTypes.length >= 64) break;
    }
    Object.defineProperties(diagnostics, {
      topLevelKeyNamesCsv: { value: topLevelKeyNamesCsv, enumerable: false },
      topLevelKeyTypesCsv: { value: topLevelKeyTypesCsv, enumerable: false },
      topLevelObjectChildKeyTypesCsv: {
        value: topLevelObjectChildKeyTypes.slice(0, 64).sort().join(','),
        enumerable: false,
      },
    });
    return diagnostics;
  };

  if (parsed === null || typeof parsed !== 'object') {
    return attachDeterministicShapeDiagnostics(
      {
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
      undefined,
    );
  }
  const body = parsed as Record<string, unknown>;
  const page = body.page;
  const pageWasObject = page !== null && typeof page === 'object';
  const userAgreementList = body.userAgreementList;
  const hasUserAgreementListArray = Array.isArray(userAgreementList);
  const userAgreementListHasAtLeastOneItem =
    hasUserAgreementListArray && userAgreementList.length > 0;
  const firstUserAgreement = userAgreementListHasAtLeastOneItem ? userAgreementList[0] : undefined;
  const firstUserAgreementWasObject =
    firstUserAgreement !== null && typeof firstUserAgreement === 'object';
  const firstUserAgreementRecord = firstUserAgreementWasObject
    ? (firstUserAgreement as Record<string, unknown>)
    : undefined;
  const searchResult = body.searchResult;
  const searchResultWasObject = searchResult !== null && typeof searchResult === 'object';
  const searchResultRecord = searchResultWasObject
    ? (searchResult as Record<string, unknown>)
    : undefined;
  return attachDeterministicShapeDiagnostics(
    {
    bodyWasJsonObject: true,
    topLevelKeyCount: Object.keys(body).length,
    hasTopLevelAgreementsArray: Array.isArray(body.agreements),
    hasSearchAgreementsResponseField: Object.prototype.hasOwnProperty.call(
      body,
      'searchAgreementsResponse',
    ),
    hasNextCursorField: Object.prototype.hasOwnProperty.call(body, 'nextCursor'),
    hasPageField: Object.prototype.hasOwnProperty.call(body, 'page'),
    pageWasObject,
    pageHasNextCursorField:
      pageWasObject && Object.prototype.hasOwnProperty.call(page as Record<string, unknown>, 'nextCursor'),
    hasUserAgreementListField: Object.prototype.hasOwnProperty.call(body, 'userAgreementList'),
    hasUserAgreementListArray,
    userAgreementListHasAtLeastOneItem,
    firstUserAgreementWasObject,
    firstUserAgreementHasIdField:
      firstUserAgreementRecord !== undefined &&
      Object.prototype.hasOwnProperty.call(firstUserAgreementRecord, 'id'),
    firstUserAgreementHasNameField:
      firstUserAgreementRecord !== undefined &&
      Object.prototype.hasOwnProperty.call(firstUserAgreementRecord, 'name'),
    firstUserAgreementHasStatusField:
      firstUserAgreementRecord !== undefined &&
      Object.prototype.hasOwnProperty.call(firstUserAgreementRecord, 'status'),
    firstUserAgreementHasRecipientStatusField:
      firstUserAgreementRecord !== undefined &&
      Object.prototype.hasOwnProperty.call(firstUserAgreementRecord, 'recipientStatus'),
    hasAgreementAssetsField: Object.prototype.hasOwnProperty.call(body, 'agreementAssets'),
    hasAgreementAssetsArray: Array.isArray(body.agreementAssets),
    hasResultsField: Object.prototype.hasOwnProperty.call(body, 'results'),
    hasResultsArray: Array.isArray(body.results),
    hasSearchResultsField: Object.prototype.hasOwnProperty.call(body, 'searchResults'),
    hasSearchResultsArray: Array.isArray(body.searchResults),
    hasResultListField: Object.prototype.hasOwnProperty.call(body, 'resultList'),
    hasResultListArray: Array.isArray(body.resultList),
    hasPageInfoField: Object.prototype.hasOwnProperty.call(body, 'pageInfo'),
    hasTotalCountField: Object.prototype.hasOwnProperty.call(body, 'totalCount'),
    hasCurrentPageField: Object.prototype.hasOwnProperty.call(body, 'currentPage'),
    hasTotalPagesField: Object.prototype.hasOwnProperty.call(body, 'totalPages'),
    hasAgreementAssetListField: Object.prototype.hasOwnProperty.call(body, 'agreementAssetList'),
    hasAgreementAssetListArray: Array.isArray(body.agreementAssetList),
    hasAgreementAssetsListField: Object.prototype.hasOwnProperty.call(body, 'agreementAssetsList'),
    hasAgreementAssetsListArray: Array.isArray(body.agreementAssetsList),
    hasAgreementAssetSearchResultsField: Object.prototype.hasOwnProperty.call(
      body,
      'agreementAssetSearchResults',
    ),
    hasAgreementAssetSearchResultsArray: Array.isArray(body.agreementAssetSearchResults),
    hasAgreementAssetSearchResultListField: Object.prototype.hasOwnProperty.call(
      body,
      'agreementAssetSearchResultList',
    ),
    hasAgreementAssetSearchResultListArray: Array.isArray(body.agreementAssetSearchResultList),
    hasSearchResultField: Object.prototype.hasOwnProperty.call(body, 'searchResult'),
    searchResultWasObject,
    searchResultHasAgreementAssetsField:
      searchResultRecord !== undefined &&
      Object.prototype.hasOwnProperty.call(searchResultRecord, 'agreementAssets'),
    searchResultHasAgreementAssetsArray:
      searchResultRecord !== undefined && Array.isArray(searchResultRecord.agreementAssets),
    hasPagingInfoField: Object.prototype.hasOwnProperty.call(body, 'pagingInfo'),
    hasPaginationField: Object.prototype.hasOwnProperty.call(body, 'pagination'),
    hasPageDataField: Object.prototype.hasOwnProperty.call(body, 'pageData'),
    hasTotalHitsField: Object.prototype.hasOwnProperty.call(body, 'totalHits'),
    hasTotalRecordsField: Object.prototype.hasOwnProperty.call(body, 'totalRecords'),
    hasStartIndexField: Object.prototype.hasOwnProperty.call(body, 'startIndex'),
    hasPageSizeField: Object.prototype.hasOwnProperty.call(body, 'pageSize'),
    },
    body,
  );
}

function mapRow(row: unknown): AdobeSignSearchClientItem | undefined {
  const agreementId = readStringField(row, 'id');
  const agreementName = readStringField(row, 'name');
  const recipientStatus = readStringField(row, 'recipientStatus');
  if (!agreementId || !agreementName || !recipientStatus) return undefined;

  const senderDisplayName = readNestedString(row, 'senderInfo', 'name');
  const senderEmail = readNestedString(row, 'senderInfo', 'email');
  const createdAtUtc = readStringField(row, 'displayDate');
  const modifiedAtUtc = readStringField(row, 'lastUpdate');
  const expirationAtUtc = readStringField(row, 'expirationTime');
  const sourceOpenUrlCandidate = readSourceOpenUrlCandidate(row);

  return {
    agreementId,
    agreementName,
    recipientStatus,
    ...(senderDisplayName !== undefined ? { senderDisplayName } : {}),
    ...(senderEmail !== undefined ? { senderEmail } : {}),
    ...(createdAtUtc !== undefined ? { createdAtUtc } : {}),
    ...(modifiedAtUtc !== undefined ? { modifiedAtUtc } : {}),
    ...(expirationAtUtc !== undefined ? { expirationAtUtc } : {}),
    ...(sourceOpenUrlCandidate !== undefined ? { sourceOpenUrlCandidate } : {}),
  };
}

export function createAdobeSignLiveSearchClient(
  deps: AdobeSignLiveSearchClientDeps = {},
): IAdobeSignSearchClient {
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS;

  return {
    async search(input: AdobeSignSearchClientInput): Promise<AdobeSignSearchResult> {
      if (!isAllowedAdobeAccessPoint(input.apiAccessPoint)) {
        return { status: 'unreachable', reason: 'invalid-access-point' };
      }

      const startIndex = decodeSearchStartIndex(input.request.cursor);
      if (startIndex === 'invalid') {
        return { status: 'unreachable', reason: 'unknown' };
      }

      const url = `${trimTrailingSlash(input.apiAccessPoint)}${ADOBE_SIGN_AGREEMENT_SEARCH_PATH}`;
      const method = 'POST' as const;
      const body = {
        scope: ['AGREEMENT_ASSETS'],
        agreementAssetsCriteria: {
          pageSize: input.request.pageSize,
          startIndex,
        },
      };
      const searchRequestDiagnostics = buildSearchRequestDiagnostics(url, body, method);

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method,
          headers: {
            authorization: `Bearer ${input.accessToken}`,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (err: unknown) {
        const name = (err as { name?: string }).name;
        if (name === 'AbortError') {
          return { status: 'unreachable', reason: 'timeout', searchRequestDiagnostics };
        }
        return { status: 'unreachable', reason: 'network', searchRequestDiagnostics };
      } finally {
        clearTimeout(timeoutHandle);
      }

      if (response.status === 401 || response.status === 403) {
        return { status: 'unauthorized' };
      }
      if (response.status >= 500) {
        return {
          status: 'unreachable',
          reason: 'http-5xx',
          providerStatusCode: response.status,
          searchRequestDiagnostics,
        };
      }
      if (response.status === 429) {
        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch {
          parsed = undefined;
        }
        const providerErrorCode = normalizeSafeProviderErrorCode(readErrorCodeFromAdobeBody(parsed));
        const providerFieldPresence = readProviderErrorFieldPresence(parsed);
        return {
          status: 'unreachable',
          reason: 'rate-limited',
          providerStatusCode: 429,
          ...(providerErrorCode ? { providerErrorCode } : {}),
          ...providerFieldPresence,
          searchRequestDiagnostics,
        };
      }
      if (response.status >= 400) {
        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch {
          parsed = undefined;
        }
        const providerErrorCode = normalizeSafeProviderErrorCode(readErrorCodeFromAdobeBody(parsed));
        const providerFieldPresence = readProviderErrorFieldPresence(parsed);
        return {
          status: 'unreachable',
          reason: 'http-4xx',
          providerStatusCode: response.status,
          ...(providerErrorCode ? { providerErrorCode } : {}),
          ...providerFieldPresence,
          searchRequestDiagnostics,
        };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        return {
          status: 'unreachable',
          reason: 'malformed-response',
          searchRequestDiagnostics,
          malformedSearchResponseDiagnostics: buildMalformedSearchResponseDiagnostics(undefined),
        };
      }
      if (parsed === null || typeof parsed !== 'object') {
        return {
          status: 'unreachable',
          reason: 'malformed-response',
          searchRequestDiagnostics,
          malformedSearchResponseDiagnostics: buildMalformedSearchResponseDiagnostics(parsed),
        };
      }
      const rawAgreements = (parsed as Record<string, unknown>).agreements;
      if (!Array.isArray(rawAgreements)) {
        return {
          status: 'unreachable',
          reason: 'malformed-response',
          searchRequestDiagnostics,
          malformedSearchResponseDiagnostics: buildMalformedSearchResponseDiagnostics(parsed),
        };
      }

      const items: AdobeSignSearchClientItem[] = [];
      for (const row of rawAgreements) {
        const mapped = mapRow(row);
        if (mapped !== undefined) items.push(mapped);
      }

      return {
        status: 'ok',
        items,
      };
    },
  };
}
