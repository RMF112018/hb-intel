/**
 * Adobe Sign principal-resolution result — B05 Prompt 02 Lane B.
 *
 * Discriminated union describing the outcome of resolving an
 * authenticated actor into an Adobe Sign personal-queue principal.
 * Route handlers and the read-model provider use this to decide whether
 * to issue an outbound Adobe Sign call, surface an authorization prompt,
 * report a configuration gap, or degrade gracefully when Adobe is down.
 *
 * Mapping to `MyWorkReadModelSourceStatus`:
 *   - `resolved`                → `'available'`
 *   - `authorization-required`  → `'authorization-required'`
 *   - `principal-unresolved`    → `'principal-unresolved'`
 *   - `configuration-required`  → `'configuration-required'`
 *   - `source-unavailable`      → `'source-unavailable'`
 *
 * No route handlers / Adobe HTTP calls / grant-store reads are
 * implemented here — this is the contract only. Later prompts add the
 * resolver implementation that consumes the actor normalizer + config
 * gate + (future) grant-store adapter.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolution
 */

import type { MyWorkReadModelSourceStatus } from '@hbc/models/myWork';

import type {
  AdobeSignActorRejectionReason,
  AdobeSignDelegatedActor,
} from './adobe-sign-actor-normalizer.js';
import type {
  AdobeSignGrantPublicProjection,
  AdobeSignGrantState,
} from './adobe-sign-grant-record.js';
import type { AdobeSignOAuthConfigKey } from './adobe-sign-config.js';

export const ADOBE_SIGN_PRINCIPAL_RESOLUTION_STATUSES = [
  'resolved',
  'authorization-required',
  'principal-unresolved',
  'configuration-required',
  'source-unavailable',
] as const;

export type AdobeSignPrincipalResolutionStatus =
  (typeof ADOBE_SIGN_PRINCIPAL_RESOLUTION_STATUSES)[number];

export interface AdobeSignResolvedPrincipal {
  readonly actor: AdobeSignDelegatedActor;
  readonly adobeApiAccessPoint: string;
  readonly adobeWebAccessPoint: string;
  readonly grantedScopes: readonly string[];
  readonly grantState: AdobeSignGrantState;
}

export type AdobeSignAuthorizationRequiredReason =
  | 'no-grant-found'
  | 'grant-revoked'
  | 'grant-expired'
  | 'grant-requires-reauth';

export type AdobeSignSourceUnavailableReason =
  | 'token-store-unavailable'
  | 'adobe-unreachable'
  | 'grant-refresh-failed';

export type AdobeSignPrincipalResolutionResult =
  | {
      readonly status: 'resolved';
      readonly principal: AdobeSignResolvedPrincipal;
      /** Public grant projection for diagnostic UI; never carries token material. */
      readonly grantPublic: AdobeSignGrantPublicProjection;
    }
  | {
      readonly status: 'authorization-required';
      readonly actor: AdobeSignDelegatedActor;
      readonly reason: AdobeSignAuthorizationRequiredReason;
    }
  | {
      readonly status: 'principal-unresolved';
      /** The rejected actor input is preserved when available (e.g. app-only). */
      readonly actor?: AdobeSignDelegatedActor;
      readonly reason: AdobeSignActorRejectionReason | 'unknown';
    }
  | {
      readonly status: 'configuration-required';
      readonly missingKeys: readonly AdobeSignOAuthConfigKey[];
      /** True when the only gap is the durable store selection. */
      readonly pendingStoreSelection: boolean;
    }
  | {
      readonly status: 'source-unavailable';
      readonly reason: AdobeSignSourceUnavailableReason;
    };

/**
 * Map a resolution status to the `MyWorkReadModelSourceStatus` value the
 * read-model envelope should carry when this resolution gates the
 * outbound source call. Mapping is total — every status maps.
 */
export function toMyWorkSourceStatus(
  status: AdobeSignPrincipalResolutionStatus,
): MyWorkReadModelSourceStatus {
  switch (status) {
    case 'resolved':
      return 'available';
    case 'authorization-required':
      return 'authorization-required';
    case 'principal-unresolved':
      return 'principal-unresolved';
    case 'configuration-required':
      return 'configuration-required';
    case 'source-unavailable':
      return 'source-unavailable';
  }
}
