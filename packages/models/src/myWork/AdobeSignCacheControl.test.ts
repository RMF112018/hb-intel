import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES,
  type AdobeSignCacheWorkItemPublicType,
  type MyWorkAdobeSignCacheWorkAcceptedResponse,
} from './AdobeSignCacheControl.js';

describe('Adobe Sign cache control — public work-item type vocabulary', () => {
  it('exposes the externally enqueueable work-item types in order', () => {
    expect(ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES).toEqual([
      'ManualUserRefresh',
      'EnsureUserWebhook',
    ]);
    expect(ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES).toHaveLength(2);
  });

  it('excludes backend-only work-item types from the public vocabulary', () => {
    const backendOnly = [
      'InitialHydration',
      'VerifyUserWebhook',
      'WebhookAgreementRefresh',
      'ReconciliationUserRefresh',
    ];
    for (const type of backendOnly) {
      expect((ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES as readonly string[]).includes(type)).toBe(
        false,
      );
    }
  });
});

describe('Adobe Sign cache control — accepted-response shape', () => {
  it('accepts an accepted-response for a manual refresh enqueue', () => {
    const response: MyWorkAdobeSignCacheWorkAcceptedResponse = {
      status: 'accepted',
      workItemType: 'ManualUserRefresh',
      correlationId: 'corr-1234',
    };
    expect(response.status).toBe('accepted');
    expect(response.workItemType).toBe('ManualUserRefresh');
    expect(response.correlationId).toBe('corr-1234');
  });

  it('accepts an accepted-response for a webhook-ensure enqueue', () => {
    const response: MyWorkAdobeSignCacheWorkAcceptedResponse = {
      status: 'accepted',
      workItemType: 'EnsureUserWebhook',
      correlationId: 'corr-5678',
    };
    expect(response.workItemType).toBe('EnsureUserWebhook');
  });

  it('binds workItemType to the public work-item vocabulary', () => {
    for (const workItemType of ADOBE_SIGN_CACHE_WORK_ITEM_PUBLIC_TYPES) {
      const typed: AdobeSignCacheWorkItemPublicType = workItemType;
      const response: MyWorkAdobeSignCacheWorkAcceptedResponse = {
        status: 'accepted',
        workItemType: typed,
        correlationId: `corr-${typed}`,
      };
      expect(response.workItemType).toBe(workItemType);
    }
  });
});
