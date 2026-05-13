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
      readonly reason?: 'network' | 'http-5xx' | 'unknown';
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
