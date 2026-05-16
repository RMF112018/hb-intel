import { isAllowedAdobeAccessPoint } from './adobe-sign-live-oauth-service.js';

export type AdobeSignActionHandoffPolicyReason =
  | 'invalid-url'
  | 'scheme-blocked'
  | 'host-not-approved';

export type AdobeSignActionHandoffPolicyDecision =
  | { readonly status: 'allowed'; readonly redirectUrl: string }
  | { readonly status: 'rejected'; readonly reason: AdobeSignActionHandoffPolicyReason };

export function evaluateAdobeSignActionHandoff(
  candidateUrl: string,
): AdobeSignActionHandoffPolicyDecision {
  let parsed: URL;
  try {
    parsed = new URL(candidateUrl);
  } catch {
    return { status: 'rejected', reason: 'invalid-url' };
  }

  if (parsed.protocol !== 'https:') {
    return { status: 'rejected', reason: 'scheme-blocked' };
  }

  if (!isAllowedAdobeAccessPoint(parsed.origin)) {
    return { status: 'rejected', reason: 'host-not-approved' };
  }

  return { status: 'allowed', redirectUrl: candidateUrl };
}
