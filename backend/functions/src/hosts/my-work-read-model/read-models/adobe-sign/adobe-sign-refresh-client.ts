/**
 * Adobe Sign refresh-client seam — B05 Prompt 04.
 *
 * Encapsulates the durable-store + Adobe-token-endpoint round trip used
 * by the token service to mint a fresh access token. The client is the
 * **only** module that touches encrypted refresh-token material in the
 * backend; everything above it sees an opaque
 * `AdobeSignEncryptedRefreshTokenRef` (Prompt 02 contract).
 *
 * The contract is intentionally normalized — successful results carry
 * only what the token service needs (access token + expiry + access
 * point + the updated encrypted reference). Failure results are closed
 * enums; raw Adobe response bodies, vendor error strings, and the
 * refresh token itself **must not** cross this boundary. This keeps
 * Adobe payload passthrough impossible and preserves the
 * "no token text in thrown/public errors" guarantee.
 *
 * No HTTP / durable-store implementation lives here — that is the
 * production token-store adapter selected by B05/B06 governance. Until
 * then, the deterministic test stub `createDeterministicMockRefreshClient`
 * is the only client wired in test / mock mode.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-refresh-client
 */

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type {
  AdobeSignEncryptedRefreshTokenRef,
  IAdobeSignGrantRecord,
} from './adobe-sign-grant-record.js';

export interface AdobeSignRefreshInput {
  readonly actorKey: AdobeSignActorKey;
  /** The current grant record — the client resolves the refresh ciphertext from its `encryptedRefreshTokenRef`. */
  readonly grant: IAdobeSignGrantRecord;
  /** Injected clock so this layer remains deterministic. */
  readonly now: Date;
}

export interface AdobeSignRefreshSuccess {
  readonly status: 'ok';
  /** Access token — backend-only. Never propagated to SPFx/browser surfaces. */
  readonly accessToken: string;
  /** ISO-8601 UTC absolute expiry — already adjusted from Adobe's relative `expires_in`. */
  readonly expiresAtUtc: string;
  /** Updated opaque reference to the (possibly rotated) refresh ciphertext. */
  readonly updatedEncryptedRefreshTokenRef: AdobeSignEncryptedRefreshTokenRef;
  /**
   * Scopes the refresh actually returned. Adobe may narrow scope between
   * the original grant and a subsequent refresh; the token service uses
   * this to keep the stored grant record honest.
   */
  readonly grantedScopes: readonly string[];
}

export type AdobeSignRefreshResult =
  | AdobeSignRefreshSuccess
  | {
      /**
       * The refresh ciphertext is no longer valid upstream (revoked, expired,
       * tenant policy change). Caller must transition the grant to
       * `requires-reauth` and surface `authorization-required` to consumers.
       */
      readonly status: 'invalid-grant';
    }
  | {
      /**
       * The Adobe token endpoint (or the ciphertext store fronting it)
       * could not be reached. Caller must surface `source-unavailable`
       * without mutating the grant state.
       */
      readonly status: 'unreachable';
      /** Closed enum; never a raw vendor body string. */
      readonly reason?:
        | 'network'
        | 'timeout'
        | 'http-4xx'
        | 'http-5xx'
        | 'store-unavailable'
        | 'malformed-response'
        | 'invalid-access-point'
        | 'unknown';
      readonly providerErrorCode?: string;
      readonly refreshRequestDiagnostics?: {
        readonly endpointHost?: string;
        readonly endpointPath?: string;
        readonly endpointSelectionMode?: string;
        readonly bodyFieldCount?: number;
        readonly hasGrantTypeField?: boolean;
        readonly hasRefreshTokenField?: boolean;
        readonly hasClientIdField?: boolean;
        readonly hasClientSecretField?: boolean;
      };
      readonly malformedResponseDiagnostics?: {
        readonly hasAccessToken?: boolean;
        readonly hasRefreshToken?: boolean;
        readonly hasExpiresIn?: boolean;
      };
    };

export interface IAdobeSignRefreshClient {
  refresh(input: AdobeSignRefreshInput): Promise<AdobeSignRefreshResult>;
}

// ---------------------------------------------------------------------------
// Deterministic test client — never auto-selected in production.
// ---------------------------------------------------------------------------

export type DeterministicRefreshScript = ReadonlyArray<AdobeSignRefreshResult>;

/**
 * Test client that returns the supplied scripted results in order.
 * Consuming past the end of the script throws so tests can detect
 * unexpected extra calls.
 */
export function createDeterministicMockRefreshClient(
  script: DeterministicRefreshScript,
): IAdobeSignRefreshClient & { readonly callCount: () => number } {
  let cursor = 0;
  const remaining = [...script];
  let calls = 0;
  return {
    async refresh(): Promise<AdobeSignRefreshResult> {
      calls++;
      if (cursor >= remaining.length) {
        throw new Error('ADOBE_SIGN_REFRESH_CLIENT mock exhausted');
      }
      return remaining[cursor++]!;
    },
    callCount: () => calls,
  };
}
