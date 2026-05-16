/**
 * Internal Adobe Sign runtime diagnostics contracts.
 *
 * These types are for operator diagnostics only and must never carry
 * secrets, actor identifiers, tokens, or OAuth artifacts.
 */
import type { AdobeSignSearchIntent } from './adobe-sign-search-request.js';

export type AdobeSignRuntimeDiagnosticEventName =
  | 'adobe-sign-runtime-failure'
  | 'adobeSign.read.principalResolution.result'
  | 'adobeSign.read.tokenAcquisition.result'
  | 'adobeSign.read.refresh.result'
  | 'adobeSign.read.search.result'
  | 'adobeSign.read.actionQueue.result'
  | 'adobeSign.read.recentCompletions.result';

export type AdobeSignTableStoreOperation =
  | 'find-grant'
  | 'upsert-grant'
  | 'mark-reauthorization-required'
  | 'mark-revoked'
  | 'put-ciphertext'
  | 'get-ciphertext'
  | 'delete-ciphertext';

export type AdobeSignTableStoreStage =
  | 'ensure-table'
  | 'create-table'
  | 'get-entity'
  | 'upsert-entity'
  | 'delete-entity'
  | 'map-entity';

export type AdobeSignRuntimeErrorClass =
  | 'auth-forbidden'
  | 'auth-unauthorized'
  | 'credential-unavailable'
  | 'table-not-found'
  | 'resource-not-found'
  | 'timeout'
  | 'network'
  | 'sdk-rejected'
  | 'invalid-input'
  | 'unknown';

export interface AdobeSignRuntimeDiagnosticProperties {
  readonly operation?: AdobeSignTableStoreOperation;
  readonly stage?: AdobeSignTableStoreStage;
  readonly errorClass?: AdobeSignRuntimeErrorClass;
  readonly statusCode?: number;
  readonly sdkCode?: string;
  readonly tableName?: string;
  readonly endpointHost?: string;
  readonly status?: string;
  readonly reason?: string;
  readonly providerStatusCode?: number;
  readonly providerErrorCode?: string;
  readonly refreshEndpointHost?: string;
  readonly refreshEndpointPath?: string;
  readonly refreshEndpointSelectionMode?: string;
  readonly refreshBodyFieldCount?: number;
  readonly refreshHasGrantTypeField?: boolean;
  readonly refreshHasRefreshTokenField?: boolean;
  readonly refreshHasClientIdField?: boolean;
  readonly refreshHasClientSecretField?: boolean;
  readonly refreshMalformedHasAccessToken?: boolean;
  readonly refreshMalformedHasRefreshToken?: boolean;
  readonly refreshMalformedHasExpiresIn?: boolean;
  readonly searchEndpointHost?: string;
  readonly searchEndpointPath?: string;
  readonly searchMethod?: string;
  readonly searchBodyTopLevelKeyCount?: number;
  readonly searchQueryIntent?: AdobeSignSearchIntent;
  readonly searchHasScopeField?: boolean;
  readonly searchScopeAgreementAssetsCount?: number;
  readonly searchHasAgreementAssetsCriteriaField?: boolean;
  readonly searchAgreementAssetsCriteriaHasPageSizeField?: boolean;
  readonly searchAgreementAssetsCriteriaHasStartIndexField?: boolean;
  readonly searchAgreementAssetsCriteriaHasStatusField?: boolean;
  readonly searchAgreementAssetsCriteriaHasRoleField?: boolean;
  readonly searchAgreementAssetsCriteriaHasTypeField?: boolean;
  readonly searchHasMatchingFiltersInfoField?: boolean;
  readonly searchHasAgreementOriginInfoField?: boolean;
  readonly searchHasRecipientStatusFilterField?: boolean;
  readonly searchHasPageSizeField?: boolean;
  readonly searchHasCursorField?: boolean;
  readonly searchApprovedStatusCount?: number;
  readonly searchAgreementAssetsCriteriaAgreementTypeCount?: number;
  readonly searchAgreementAssetsCriteriaSignedStatusCount?: number;
  readonly searchAgreementAssetsCriteriaHasModifiedDateField?: boolean;
  readonly searchAgreementAssetsCriteriaModifiedDateHasRangeField?: boolean;
  readonly searchAgreementAssetsCriteriaModifiedDateRangeHasLowerBoundField?: boolean;
  readonly searchAgreementAssetsCriteriaModifiedDateRangeHasUpperBoundField?: boolean;
  readonly searchAgreementAssetsCriteriaHasSortByField?: boolean;
  readonly searchAgreementAssetsCriteriaHasSortOrderField?: boolean;
  readonly searchMalformedBodyWasJsonObject?: boolean;
  readonly searchMalformedTopLevelKeyCount?: number;
  readonly searchMalformedHasTopLevelAgreementsArray?: boolean;
  readonly searchMalformedHasSearchAgreementsResponseField?: boolean;
  readonly searchMalformedHasNextCursorField?: boolean;
  readonly searchMalformedHasPageField?: boolean;
  readonly searchMalformedPageWasObject?: boolean;
  readonly searchMalformedPageHasNextCursorField?: boolean;
  readonly searchMalformedHasUserAgreementListField?: boolean;
  readonly searchMalformedHasUserAgreementListArray?: boolean;
  readonly searchMalformedUserAgreementListHasAtLeastOneItem?: boolean;
  readonly searchMalformedFirstUserAgreementWasObject?: boolean;
  readonly searchMalformedFirstUserAgreementHasIdField?: boolean;
  readonly searchMalformedFirstUserAgreementHasNameField?: boolean;
  readonly searchMalformedFirstUserAgreementHasStatusField?: boolean;
  readonly searchMalformedFirstUserAgreementHasRecipientStatusField?: boolean;
  readonly searchMalformedHasAgreementAssetsField?: boolean;
  readonly searchMalformedHasAgreementAssetsArray?: boolean;
  readonly searchMalformedHasResultsField?: boolean;
  readonly searchMalformedHasResultsArray?: boolean;
  readonly searchMalformedHasSearchResultsField?: boolean;
  readonly searchMalformedHasSearchResultsArray?: boolean;
  readonly searchMalformedHasResultListField?: boolean;
  readonly searchMalformedHasResultListArray?: boolean;
  readonly searchMalformedHasPageInfoField?: boolean;
  readonly searchMalformedHasTotalCountField?: boolean;
  readonly searchMalformedHasCurrentPageField?: boolean;
  readonly searchMalformedHasTotalPagesField?: boolean;
  readonly searchMalformedHasAgreementAssetListField?: boolean;
  readonly searchMalformedHasAgreementAssetListArray?: boolean;
  readonly searchMalformedHasAgreementAssetsListField?: boolean;
  readonly searchMalformedHasAgreementAssetsListArray?: boolean;
  readonly searchMalformedHasAgreementAssetSearchResultsField?: boolean;
  readonly searchMalformedHasAgreementAssetSearchResultsArray?: boolean;
  readonly searchMalformedHasAgreementAssetSearchResultListField?: boolean;
  readonly searchMalformedHasAgreementAssetSearchResultListArray?: boolean;
  readonly searchMalformedHasSearchResultField?: boolean;
  readonly searchMalformedSearchResultWasObject?: boolean;
  readonly searchMalformedSearchResultHasAgreementAssetsField?: boolean;
  readonly searchMalformedSearchResultHasAgreementAssetsArray?: boolean;
  readonly searchMalformedHasPagingInfoField?: boolean;
  readonly searchMalformedHasPaginationField?: boolean;
  readonly searchMalformedHasPageDataField?: boolean;
  readonly searchMalformedHasTotalHitsField?: boolean;
  readonly searchMalformedHasTotalRecordsField?: boolean;
  readonly searchMalformedHasStartIndexField?: boolean;
  readonly searchMalformedHasPageSizeField?: boolean;
  readonly searchMalformedTopLevelKeyNamesCsv?: string;
  readonly searchMalformedTopLevelKeyTypesCsv?: string;
  readonly searchMalformedTopLevelObjectChildKeyTypesCsv?: string;
  readonly searchProviderResponseHasErrorField?: boolean;
  readonly searchProviderResponseHasCodeField?: boolean;
  readonly sourceStatus?: string;
  readonly resultStage?: AdobeSignActionQueueResultStage | AdobeSignRecentCompletionsResultStage;
  readonly warningCodes?: readonly string[];
  readonly itemCount?: number;
  readonly hasMore?: boolean;
  readonly windowDays?: 30;
  readonly durationMs?: number;
}

export type AdobeSignActionQueueResultStage =
  | 'principal-resolution'
  | 'token-acquisition'
  | 'search'
  | 'mapped-results';

export type AdobeSignRecentCompletionsResultStage =
  | 'principal-resolution'
  | 'token-acquisition'
  | 'search'
  | 'mapped-results';

export interface AdobeSignRuntimeDiagnosticReporter {
  trackAdobeSignRuntimeEvent(
    name: AdobeSignRuntimeDiagnosticEventName,
    properties: AdobeSignRuntimeDiagnosticProperties,
  ): void;
}

export interface AdobeSignRuntimeErrorDiagnostic extends AdobeSignRuntimeDiagnosticProperties {}

export class AdobeSignRuntimeDiagnosticError extends Error {
  constructor(
    public readonly diagnostic: AdobeSignRuntimeErrorDiagnostic,
    cause?: unknown,
  ) {
    super('adobe-sign-runtime-diagnostic-error');
    this.name = 'AdobeSignRuntimeDiagnosticError';
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

interface ErrorLike {
  statusCode?: number;
  code?: string;
  message?: string;
  name?: string;
}

const messageContains = (message: string, patterns: readonly string[]): boolean => {
  const lower = message.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
};

export function classifyAdobeSignRuntimeError(error: unknown): {
  readonly errorClass: AdobeSignRuntimeErrorClass;
  readonly statusCode?: number;
  readonly sdkCode?: string;
} {
  const raw = (error ?? {}) as ErrorLike;
  const statusCode = typeof raw.statusCode === 'number' ? raw.statusCode : undefined;
  const sdkCode = typeof raw.code === 'string' ? raw.code : undefined;
  const message = typeof raw.message === 'string' ? raw.message : '';
  const name = typeof raw.name === 'string' ? raw.name : '';
  const signal = `${name} ${message}`.toLowerCase();

  if (statusCode === 401) return { errorClass: 'auth-unauthorized', statusCode, sdkCode };
  if (statusCode === 403) return { errorClass: 'auth-forbidden', statusCode, sdkCode };
  if (statusCode === 404) return { errorClass: 'resource-not-found', statusCode, sdkCode };

  if (
    messageContains(signal, [
      'credentialunavailableerror',
      'failed to retrieve a token',
      'managed identity',
      'environmentcredential',
      'defaultazurecredential failed',
      'workloadidentitycredential',
    ])
  ) {
    return { errorClass: 'credential-unavailable', statusCode, sdkCode };
  }

  if (messageContains(signal, ['timeout', 'timed out', 'etimedout', 'requesttimeout'])) {
    return { errorClass: 'timeout', statusCode, sdkCode };
  }

  if (
    messageContains(signal, [
      'enotfound',
      'econnrefused',
      'econnreset',
      'socket hang up',
      'network',
      'fetch failed',
      'getaddrinfo',
    ])
  ) {
    return { errorClass: 'network', statusCode, sdkCode };
  }

  if (messageContains(signal, ['invalid', 'malformed', 'bad request'])) {
    return { errorClass: 'invalid-input', statusCode, sdkCode };
  }

  if (statusCode !== undefined || sdkCode !== undefined) {
    return { errorClass: 'sdk-rejected', statusCode, sdkCode };
  }

  return { errorClass: 'unknown' };
}

export function resolveSafeTableEndpointHost(endpoint: string | undefined): string | undefined {
  if (typeof endpoint !== 'string' || endpoint.trim().length === 0) return undefined;
  if (!endpoint.startsWith('http')) return undefined;
  try {
    return new URL(endpoint).host;
  } catch {
    return undefined;
  }
}
