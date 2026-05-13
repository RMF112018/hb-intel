/**
 * Adobe Sign search-request builder — B05 Prompt 05.
 *
 * Builds a bounded, backend-internal request envelope for the Adobe Sign
 * agreement search seam. The recipient-status filter is locked to the six
 * MVP user-action statuses sealed by B04; callers may not override it.
 * Page size is clamped to a documented window so an SPFx caller can never
 * coerce the adapter into an unbounded scan. The opaque `cursor` string is
 * forwarded as-is — this layer never parses it.
 *
 * No Adobe-vendor wire-shape property names are baked into this builder.
 * The live HTTP client owns the request-body translation; until then this
 * shape is the contract the action-queue adapter consumes against the
 * deterministic mock search client.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request
 */

import {
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  type AdobeSignActionableRecipientStatus,
} from '@hbc/models/myWork';

export const ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE = 25;
export const ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE = 1;
export const ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE = 100;

export interface AdobeSignSearchRequestInput {
  readonly pageSize?: number;
  readonly cursor?: string;
}

export interface AdobeSignSearchRequest {
  /** Frozen at the builder boundary — always the six MVP user-action statuses. */
  readonly approvedStatuses: readonly AdobeSignActionableRecipientStatus[];
  readonly pageSize: number;
  readonly cursor?: string;
}

function clampPageSize(input: number | undefined): number {
  if (input === undefined || !Number.isFinite(input)) {
    return ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE;
  }
  const integral = Math.trunc(input);
  if (integral < ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE) return ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE;
  if (integral > ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE) return ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE;
  return integral;
}

export function buildAdobeSignSearchRequest(
  input: AdobeSignSearchRequestInput = {},
): AdobeSignSearchRequest {
  const pageSize = clampPageSize(input.pageSize);
  const request: AdobeSignSearchRequest = {
    approvedStatuses: ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
    pageSize,
    ...(input.cursor !== undefined ? { cursor: input.cursor } : {}),
  };
  return request;
}
