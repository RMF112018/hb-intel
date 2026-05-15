/**
 * Adobe Sign search-client seam — B05 Prompt 05.
 *
 * Encapsulates the bounded `POST v6/search` round trip used by the
 * action-queue adapter. Like the refresh-client seam, this is the **only**
 * module that may ever touch raw Adobe response bodies in production. The
 * contract is intentionally normalized:
 *
 *  - Successful results carry a closed `AdobeSignSearchClientItem[]` and
 *    an opaque `nextCursor` — never raw vendor JSON, never agreement
 *    detail beyond the action-queue projection.
 *  - Failure results are closed enums (`unauthorized`, `unreachable`) —
 *    no vendor error strings, no Adobe HTTP body fragments.
 *
 * The live HTTP client adapter that translates between this seam and the
 * Adobe `POST /api/rest/v6/search` request/response wire shape is selected
 * by B05/B06 governance. The Adobe request-body property names are
 * deliberately NOT settled in this seam — the live adapter will verify
 * them against current official Adobe documentation before coding. Until
 * then, the deterministic mock client (`createDeterministicMockSearchClient`)
 * is the only wired implementation.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client
 */

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { AdobeSignSearchRequest } from './adobe-sign-search-request.js';

export interface AdobeSignSearchClientInput {
  readonly actorKey: AdobeSignActorKey;
  readonly accessToken: string;
  readonly apiAccessPoint: string;
  readonly request: AdobeSignSearchRequest;
}

/**
 * Closed intermediate row shape the client emits. Deliberately omits
 * Adobe payload fields outside the B04 action-queue projection — no
 * participant lists, no document metadata, no security objects, no
 * raw vendor enums beyond `recipientStatus`. `recipientStatus` is typed
 * as `string` here because the live wire may include statuses outside
 * the six MVP user-action union; filtering and typing happens in the
 * adapter.
 */
export interface AdobeSignSearchClientItem {
  readonly agreementId: string;
  readonly agreementName: string;
  readonly recipientStatus: string;
  readonly senderDisplayName?: string;
  readonly senderEmail?: string;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  /**
   * Backend-derived agreement-view URL candidate for the row-level
   * "Open in Adobe Sign" CTA. The action-queue adapter evaluates this
   * against the HB/PCC URL-policy doctrine before populating the
   * sealed `MyWorkAdobeSignActionQueueItem.sourceOpenUrl` field — a
   * candidate is never forwarded blindly. Signing-endpoint URLs are
   * not eligible here (binding decision in B05 Prompt 06); the live
   * search client must surface an agreement-view URL only.
   */
  readonly sourceOpenUrlCandidate?: string;
}

export type AdobeSignSearchResult =
  | {
      readonly status: 'ok';
      readonly items: readonly AdobeSignSearchClientItem[];
      /** Opaque continuation token — forwarded to the adapter without parsing. */
      readonly nextCursor?: string;
    }
  | {
      /**
       * Adobe rejected the access token (e.g. revoked upstream, scope
       * mismatch). Adapter surfaces `authorization-required`.
       */
      readonly status: 'unauthorized';
    }
  | {
      /**
       * Adobe search endpoint could not be reached or returned a 5xx /
       * transport-level failure. Adapter surfaces `source-unavailable`.
       */
      readonly status: 'unreachable';
      readonly reason?:
        | 'network'
        | 'timeout'
        | 'http-4xx'
        | 'http-5xx'
        | 'rate-limited'
        | 'malformed-response'
        | 'invalid-access-point'
        | 'unknown';
      readonly providerStatusCode?: number;
      readonly providerErrorCode?: string;
      readonly providerResponseHasErrorField?: boolean;
      readonly providerResponseHasCodeField?: boolean;
      readonly searchRequestDiagnostics?: {
        readonly endpointHost?: string;
        readonly endpointPath?: string;
        readonly method?: string;
        readonly bodyTopLevelKeyCount?: number;
        readonly hasScopeField?: boolean;
        readonly scopeAgreementAssetsCount?: number;
        readonly hasAgreementAssetsCriteriaField?: boolean;
        readonly agreementAssetsCriteriaHasPageSizeField?: boolean;
        readonly agreementAssetsCriteriaHasStartIndexField?: boolean;
        readonly agreementAssetsCriteriaHasStatusField?: boolean;
        readonly agreementAssetsCriteriaHasRoleField?: boolean;
        readonly agreementAssetsCriteriaHasTypeField?: boolean;
        readonly hasMatchingFiltersInfoField?: boolean;
        readonly hasAgreementOriginInfoField?: boolean;
        readonly hasRecipientStatusFilterField?: boolean;
        readonly hasPageSizeField?: boolean;
        readonly hasCursorField?: boolean;
        readonly approvedStatusCount?: number;
      };
      readonly malformedSearchResponseDiagnostics?: {
        readonly hasTopLevelAgreementsArray?: boolean;
        readonly hasSearchAgreementsResponseField?: boolean;
        readonly hasNextCursorField?: boolean;
        readonly bodyWasJsonObject?: boolean;
        readonly topLevelKeyCount?: number;
        readonly hasPageField?: boolean;
        readonly pageWasObject?: boolean;
        readonly pageHasNextCursorField?: boolean;
        readonly hasUserAgreementListField?: boolean;
        readonly hasUserAgreementListArray?: boolean;
        readonly userAgreementListHasAtLeastOneItem?: boolean;
        readonly firstUserAgreementWasObject?: boolean;
        readonly firstUserAgreementHasIdField?: boolean;
        readonly firstUserAgreementHasNameField?: boolean;
        readonly firstUserAgreementHasStatusField?: boolean;
        readonly firstUserAgreementHasRecipientStatusField?: boolean;
        readonly hasAgreementAssetsField?: boolean;
        readonly hasAgreementAssetsArray?: boolean;
        readonly hasResultsField?: boolean;
        readonly hasResultsArray?: boolean;
        readonly hasSearchResultsField?: boolean;
        readonly hasSearchResultsArray?: boolean;
        readonly hasResultListField?: boolean;
        readonly hasResultListArray?: boolean;
        readonly hasPageInfoField?: boolean;
        readonly hasTotalCountField?: boolean;
        readonly hasCurrentPageField?: boolean;
        readonly hasTotalPagesField?: boolean;
        readonly hasAgreementAssetListField?: boolean;
        readonly hasAgreementAssetListArray?: boolean;
        readonly hasAgreementAssetsListField?: boolean;
        readonly hasAgreementAssetsListArray?: boolean;
        readonly hasAgreementAssetSearchResultsField?: boolean;
        readonly hasAgreementAssetSearchResultsArray?: boolean;
        readonly hasAgreementAssetSearchResultListField?: boolean;
        readonly hasAgreementAssetSearchResultListArray?: boolean;
        readonly hasSearchResultField?: boolean;
        readonly searchResultWasObject?: boolean;
        readonly searchResultHasAgreementAssetsField?: boolean;
        readonly searchResultHasAgreementAssetsArray?: boolean;
        readonly hasPagingInfoField?: boolean;
        readonly hasPaginationField?: boolean;
        readonly hasPageDataField?: boolean;
        readonly hasTotalHitsField?: boolean;
        readonly hasTotalRecordsField?: boolean;
        readonly hasStartIndexField?: boolean;
        readonly hasPageSizeField?: boolean;
      };
    };

export interface IAdobeSignSearchClient {
  search(input: AdobeSignSearchClientInput): Promise<AdobeSignSearchResult>;
}

// ---------------------------------------------------------------------------
// Deterministic test client — never auto-selected in production.
// ---------------------------------------------------------------------------

export type DeterministicSearchScript = ReadonlyArray<AdobeSignSearchResult>;

export interface DeterministicMockSearchClient extends IAdobeSignSearchClient {
  readonly callCount: () => number;
  readonly capturedInputs: () => readonly AdobeSignSearchClientInput[];
}

/**
 * Test client that returns the supplied scripted results in order and
 * captures each input for later assertion. Consuming past the end of the
 * script throws so tests can detect unexpected extra calls.
 */
export function createDeterministicMockSearchClient(
  script: DeterministicSearchScript,
): DeterministicMockSearchClient {
  const remaining = [...script];
  const captured: AdobeSignSearchClientInput[] = [];
  let cursor = 0;
  let calls = 0;
  return {
    async search(input) {
      calls++;
      captured.push(input);
      if (cursor >= remaining.length) {
        throw new Error('ADOBE_SIGN_SEARCH_CLIENT mock exhausted');
      }
      return remaining[cursor++]!;
    },
    callCount: () => calls,
    capturedInputs: () => captured.slice(),
  };
}
