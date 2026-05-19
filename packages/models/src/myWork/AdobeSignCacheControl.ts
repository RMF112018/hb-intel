/**
 * My Work — Adobe Sign cache control contracts (B05.15).
 *
 * SPFx-visible DTOs for the queue-backed enqueue endpoints introduced by
 * the Adobe Sign webhook-backed projection cache program:
 *
 *   - manual user refresh    (`POST /api/my-work/me/adobe-sign/cache/refresh`)
 *   - webhook ensure         (`POST /api/my-work/me/adobe-sign/webhooks/ensure`)
 *
 * Both routes accept the request synchronously, write a typed work item
 * to the Azure Storage Queue, and return an accepted-response envelope
 * containing the externally observable work-item type and a backend
 * correlation identifier. The full seven-member queue work-item type set
 * is an internal backend concern (owned by Prompt 03); only the two
 * externally enqueueable types are surfaced here.
 *
 * Contract-only: no fetch, queue client, or worker behavior lives here.
 *
 * @module myWork/AdobeSignCacheControl
 */

export const ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES = [
  'ManualUserRefresh',
  'EnsureUserWebhook',
] as const;

export type AdobeSignCacheWorkItemPublicType =
  (typeof ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES)[number];

export interface MyWorkAdobeSignCacheWorkAcceptedResponse {
  readonly status: 'accepted';
  readonly workItemType: AdobeSignCacheWorkItemPublicType;
  readonly correlationId: string;
}
