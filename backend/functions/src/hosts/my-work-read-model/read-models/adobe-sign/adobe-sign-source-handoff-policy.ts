/**
 * Adobe Sign source-handoff URL policy adapter — B05 Prompt 06.
 *
 * Thin Adobe-specific wrapper around the canonical HB/PCC URL-policy
 * evaluator exported from `@hbc/models/pcc`
 * (`evaluateExternalUrlPolicy`). This module does NOT reimplement the
 * doctrine — it forwards each candidate row-level Adobe Sign agreement
 * URL into the canonical evaluator under the `'adobe-sign'` system key,
 * and translates the evaluator's `IEvaluateExternalUrlPolicyResult` into
 * a small allowed / omitted / rejected decision the action-queue adapter
 * consumes.
 *
 * Binding rules (inherited from the canonical evaluator):
 *
 *   - HTTPS only (`scheme-blocked` otherwise).
 *   - No localhost / 0.0.0.0 / RFC 1918 / IPv6 loopback hosts
 *     (`host-blocked-local`).
 *   - No credential-like query parameter names — `token`, `secret`,
 *     `password`, `key`, `code`, `sig`, `signature`, `access_token`,
 *     `refresh_token`, `client_secret`, etc.
 *     (`query-contains-credential-like-parameter`).
 *   - Approved host rules when `approvedDomainPolicy` is configured
 *     (`host-not-approved` otherwise).
 *   - Structured reason codes from `UrlPolicyReasonCode`.
 *   - No thrown parser failures — malformed input is reported as
 *     `'invalid-url'`. This module preserves that guarantee.
 *
 * The adapter never carries SPFx-supplied URLs into this evaluator;
 * candidates originate from a backend-derived agreement-view URL on
 * the search-client item. Signing-endpoint URLs are not eligible row
 * targets and must never be supplied here (binding decision in
 * Prompt 06).
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy
 */

import {
  evaluateExternalUrlPolicy,
  type IExternalUrlPolicyRule,
  type UrlPolicyReasonCode,
} from '@hbc/models/pcc';

const ADOBE_SIGN_SYSTEM_KEY = 'adobe-sign';
const ADOBE_SIGN_ROW_LINK_TYPE = 'agreement-row-open';

export interface AdobeSignSourceHandoffPolicyConfig {
  /**
   * Optional approved-domain rules. When omitted, any URL that passes
   * the scheme / host / query checks is allowed. When provided, the
   * candidate host must match one of these rules.
   */
  readonly approvedDomainPolicy?: readonly IExternalUrlPolicyRule[];
  /** When true, every candidate URL is rejected as `custom-link-requires-approval`. */
  readonly requiresApproval?: boolean;
}

export type AdobeSignSourceHandoffPolicyDecision =
  | { readonly status: 'allowed'; readonly sourceOpenUrl: string }
  | { readonly status: 'omitted' }
  | { readonly status: 'rejected'; readonly reason: UrlPolicyReasonCode };

function isPresentCandidate(candidate: string | undefined): candidate is string {
  return typeof candidate === 'string' && candidate.length > 0;
}

/**
 * Evaluate a backend-supplied Adobe Sign agreement-view URL candidate.
 * Returns `omitted` when no candidate was supplied, `allowed` when the
 * canonical policy passes, and `rejected` with the structured reason
 * code when policy fails. Never throws.
 */
export function evaluateAdobeSignSourceHandoff(
  candidateUrl: string | undefined,
  config?: AdobeSignSourceHandoffPolicyConfig,
): AdobeSignSourceHandoffPolicyDecision {
  if (!isPresentCandidate(candidateUrl)) {
    return { status: 'omitted' };
  }

  const decision = evaluateExternalUrlPolicy({
    candidateUrl,
    systemKey: ADOBE_SIGN_SYSTEM_KEY,
    linkType: ADOBE_SIGN_ROW_LINK_TYPE,
    ...(config?.approvedDomainPolicy !== undefined
      ? { approvedDomainPolicy: config.approvedDomainPolicy }
      : {}),
    ...(config?.requiresApproval !== undefined
      ? { requiresApproval: config.requiresApproval }
      : {}),
  });

  if (decision.isAllowed) {
    return { status: 'allowed', sourceOpenUrl: candidateUrl };
  }
  return { status: 'rejected', reason: decision.reason };
}
