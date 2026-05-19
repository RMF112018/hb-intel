/**
 * My Dashboard | Adobe Sign cache — webhook event dedupe-key computation
 * (B05.15 Prompt 03).
 *
 * Provider event IDs are the canonical dedupe identifier when present.
 * When Adobe does not stamp a provider event id on the notification, the
 * receiver MUST fall back to a deterministic hash of the subscription /
 * event-type / agreement / timestamp / body-hash tuple so duplicate
 * notifications still collapse to a single queue work item.
 *
 * Pure function — no I/O, no clock, no randomness. Same inputs → same
 * output across runs (load-bearing for the dedupe table's first-event-wins
 * semantics).
 *
 * @module services/adobe-sign-cache/dedupe-key
 */

import { createHash } from 'node:crypto';

export interface ComputeAdobeSignWebhookDedupeKeyInput {
  readonly providerEventId?: string;
  readonly subscriptionKey: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly providerEventOccurredAtUtc?: string;
  readonly bodyHashSha256?: string;
}

function trimOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Compute the deterministic dedupe key for an Adobe Sign webhook event.
 *
 * - When `providerEventId` is a non-empty trimmed string, return it verbatim
 *   (Adobe stamps a globally unique identifier; we don't second-guess it).
 * - Otherwise, return the hex SHA-256 of the pipe-joined tuple
 *   `subscriptionKey | providerEventType | agreementId | providerEventOccurredAtUtc | bodyHashSha256`,
 *   with each component trimmed and missing components rendered as the empty
 *   string between pipes (so the field order is structurally stable and
 *   small differences across components produce different hashes).
 */
export function computeAdobeSignWebhookDedupeKey(
  input: ComputeAdobeSignWebhookDedupeKeyInput,
): string {
  const providerEventId = trimOrEmpty(input.providerEventId);
  if (providerEventId.length > 0) {
    return providerEventId;
  }
  const composite = [
    trimOrEmpty(input.subscriptionKey),
    trimOrEmpty(input.providerEventType),
    trimOrEmpty(input.agreementId),
    trimOrEmpty(input.providerEventOccurredAtUtc),
    trimOrEmpty(input.bodyHashSha256),
  ].join('|');
  return createHash('sha256').update(composite, 'utf8').digest('hex');
}
