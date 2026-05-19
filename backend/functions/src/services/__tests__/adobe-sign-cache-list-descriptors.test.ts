import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_CACHE_FRESHNESS_STATES,
  ADOBE_SIGN_CACHE_HYDRATION_STATES,
  ADOBE_SIGN_CACHE_PROJECTION_BUCKETS,
  ADOBE_SIGN_CACHE_REFRESH_SCOPES,
  ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
  ADOBE_SIGN_CACHE_SYNC_RUN_TYPES,
  ADOBE_SIGN_CACHED_SOURCE_STATUSES,
  ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES,
  ADOBE_SIGN_WEBHOOK_REMOTE_STATES,
  ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES,
  ADOBE_SIGN_WEBHOOK_SCOPES,
  ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_GOVERNANCE,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_HOST_SITE_URL,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_TITLES,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
  getMyDashboardAdobeSignCacheListHostSiteUrl,
} from '../adobe-sign-cache/cache-list-descriptors.js';
import type { IListDefinition } from '../sharepoint-service.js';

function fieldOf(descriptor: IListDefinition, internalName: string) {
  return descriptor.fields.find((entry) => entry.internalName === internalName);
}

describe('Adobe Sign cache — multi-list descriptor barrel', () => {
  it('locks host site URL and accessor to MyDashboard', () => {
    expect(MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_HOST_SITE_URL).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard',
    );
    expect(getMyDashboardAdobeSignCacheListHostSiteUrl()).toBe(
      MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_HOST_SITE_URL,
    );
  });

  it('exposes exactly the four cache lists in canonical order', () => {
    expect(MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS).toHaveLength(4);
    expect(MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_TITLES).toEqual([
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
    ]);
  });

  it('locks the canonical SharePoint list titles', () => {
    expect(MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE).toBe('MyDashboardAdobeSignUserCache');
    expect(MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE).toBe(
      'MyDashboardAdobeSignAgreementProjectionCache',
    );
    expect(MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE).toBe(
      'MyDashboardAdobeSignWebhookSubscriptions',
    );
    expect(MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE).toBe('MyDashboardAdobeSignSyncRuns');
  });

  it('declares governance posture: not hidden, broken inheritance, backend-only', () => {
    expect(MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_GOVERNANCE).toEqual({
      hidden: false,
      breakPermissionInheritance: true,
      runtimeReadModel: 'backend-only',
    });
  });

  it('uses template 100 for every list', () => {
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      expect(descriptor.template).toBe(100);
      expect(descriptor.description.length).toBeGreaterThan(0);
    }
  });
});

describe('Adobe Sign cache — choice vocabularies', () => {
  it('CacheHydrationState matches the locked five-state vocabulary', () => {
    expect([...ADOBE_SIGN_CACHE_HYDRATION_STATES]).toEqual([
      'NotStarted',
      'Hydrating',
      'Ready',
      'RefreshPending',
      'Failed',
    ]);
  });

  it('CachedSourceStatus matches the MyWork source-status vocabulary (B04)', () => {
    expect([...ADOBE_SIGN_CACHED_SOURCE_STATUSES]).toEqual([
      'available',
      'partial',
      'configuration-required',
      'authorization-required',
      'principal-unresolved',
      'source-unavailable',
      'backend-unavailable',
    ]);
  });

  it('FreshnessState aligns with the Prompt 01 widened MyWorkFreshnessState (Fresh / Aging / Stale / Unknown)', () => {
    expect([...ADOBE_SIGN_CACHE_FRESHNESS_STATES]).toEqual([
      'Fresh',
      'Aging',
      'Stale',
      'Unknown',
    ]);
  });

  it('ProjectionBucket matches the locked three-bucket vocabulary', () => {
    expect([...ADOBE_SIGN_CACHE_PROJECTION_BUCKETS]).toEqual([
      'PendingAction',
      'RecentCompletion',
      'Inactive',
    ]);
  });

  it('SyncOutcome matches the locked four-outcome vocabulary', () => {
    expect([...ADOBE_SIGN_CACHE_SYNC_OUTCOMES]).toEqual(['Success', 'Partial', 'Failure', 'Skipped']);
  });

  it('WebhookScope is locked to USER only for MVP', () => {
    expect([...ADOBE_SIGN_WEBHOOK_SCOPES]).toEqual(['USER']);
  });

  it('WebhookResourceFamily is locked to AGREEMENT only for MVP', () => {
    expect([...ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES]).toEqual(['AGREEMENT']);
  });

  it('WebhookRemoteState matches the locked four-state vocabulary', () => {
    expect([...ADOBE_SIGN_WEBHOOK_REMOTE_STATES]).toEqual([
      'Active',
      'Inactive',
      'Missing',
      'Unknown',
    ]);
  });

  it('WebhookLocalProcessingState matches the locked five-state vocabulary', () => {
    expect([...ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES]).toEqual([
      'Active',
      'IgnoredAfterDisconnect',
      'RemoteDeactivationFailed',
      'Suspended',
      'Orphaned',
    ]);
  });

  it('WebhookVerificationOutcome matches the locked four-outcome vocabulary', () => {
    expect([...ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES]).toEqual([
      'Success',
      'NotFound',
      'Mismatch',
      'Failure',
    ]);
  });

  it('SyncRunType matches the locked six-type vocabulary', () => {
    expect([...ADOBE_SIGN_CACHE_SYNC_RUN_TYPES]).toEqual([
      'InitialHydration',
      'WebhookRefresh',
      'ManualRefresh',
      'Reconciliation',
      'EnsureWebhook',
      'VerifyWebhook',
    ]);
  });

  it('RefreshScope matches the locked three-scope vocabulary', () => {
    expect([...ADOBE_SIGN_CACHE_REFRESH_SCOPES]).toEqual([
      'AgreementTargeted',
      'UserWide',
      'SubscriptionOnly',
    ]);
  });
});

describe('Adobe Sign cache — UserCache list', () => {
  const descriptor = MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR;

  it('locks list identity and field count', () => {
    expect(descriptor.title).toBe(MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE);
    expect(descriptor.fields).toHaveLength(25);
  });

  it('declares AdobeActorKey as the unique + indexed primary key', () => {
    const adobeActorKey = fieldOf(descriptor, 'AdobeActorKey');
    expect(adobeActorKey?.type).toBe('Text');
    expect(adobeActorKey?.required).toBe(true);
    expect(adobeActorKey?.indexed).toBe(true);
    expect(adobeActorKey?.unique).toBe(true);
  });

  it('declares the locked indexed-field set', () => {
    const indexed = descriptor.fields.filter((f) => f.indexed).map((f) => f.internalName).sort();
    expect(indexed).toEqual(
      [
        'AdobeActorKey',
        'UserPrincipalNameNormalized',
        'IsActive',
        'FreshnessState',
        'NextReconciliationDueUtc',
      ].sort(),
    );
  });

  it('binds CacheHydrationState / CachedSourceStatus / FreshnessState choices to the shared vocabularies', () => {
    expect(fieldOf(descriptor, 'CacheHydrationState')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_HYDRATION_STATES,
    ]);
    expect(fieldOf(descriptor, 'CachedSourceStatus')?.choices).toEqual([
      ...ADOBE_SIGN_CACHED_SOURCE_STATUSES,
    ]);
    expect(fieldOf(descriptor, 'FreshnessState')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_FRESHNESS_STATES,
    ]);
  });

  it('declares AdobeActorKey as the only unique-enforced field on this list', () => {
    const unique = descriptor.fields.filter((f) => f.unique).map((f) => f.internalName);
    expect(unique).toEqual(['AdobeActorKey']);
  });
});

describe('Adobe Sign cache — AgreementProjectionCache list', () => {
  const descriptor = MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR;

  it('locks list identity and field count', () => {
    expect(descriptor.title).toBe(
      MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
    );
    expect(descriptor.fields).toHaveLength(37);
  });

  it('declares ProjectionKey as the unique + indexed primary key', () => {
    const key = fieldOf(descriptor, 'ProjectionKey');
    expect(key?.unique).toBe(true);
    expect(key?.indexed).toBe(true);
    expect(key?.required).toBe(true);
  });

  it('declares the locked indexed-field set', () => {
    const indexed = descriptor.fields.filter((f) => f.indexed).map((f) => f.internalName).sort();
    expect(indexed).toEqual(
      [
        'ProjectionKey',
        'AdobeActorKey',
        'UserPrincipalNameNormalized',
        'AgreementId',
        'ProjectionBucket',
        'SortDateUtc',
        'IsActiveProjection',
        'FreshnessState',
      ].sort(),
    );
  });

  it('uses URL type for SourceOpenUrl', () => {
    expect(fieldOf(descriptor, 'SourceOpenUrl')?.type).toBe('URL');
  });

  it('binds ProjectionBucket / ActionHandoffPosture / FreshnessState / LastSyncOutcome choices', () => {
    expect(fieldOf(descriptor, 'ProjectionBucket')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_PROJECTION_BUCKETS,
    ]);
    expect(fieldOf(descriptor, 'ActionHandoffPosture')?.choices).toEqual([
      'ResolveOnClick',
      'ViewOnly',
      'Unavailable',
    ]);
    expect(fieldOf(descriptor, 'FreshnessState')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_FRESHNESS_STATES,
    ]);
    expect(fieldOf(descriptor, 'LastSyncOutcome')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
    ]);
  });
});

describe('Adobe Sign cache — WebhookSubscriptions list', () => {
  const descriptor = MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_DESCRIPTOR;

  it('locks list identity and field count', () => {
    expect(descriptor.title).toBe(MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE);
    expect(descriptor.fields).toHaveLength(19);
  });

  it('declares SubscriptionKey as the unique + indexed primary key', () => {
    const key = fieldOf(descriptor, 'SubscriptionKey');
    expect(key?.unique).toBe(true);
    expect(key?.indexed).toBe(true);
    expect(key?.required).toBe(true);
  });

  it('makes WebhookUrl a required URL field', () => {
    const url = fieldOf(descriptor, 'WebhookUrl');
    expect(url?.type).toBe('URL');
    expect(url?.required).toBe(true);
  });

  it('declares the locked indexed-field set', () => {
    const indexed = descriptor.fields.filter((f) => f.indexed).map((f) => f.internalName).sort();
    expect(indexed).toEqual(
      [
        'SubscriptionKey',
        'AdobeActorKey',
        'UserPrincipalNameNormalized',
        'AdobeWebhookId',
        'LocalProcessingState',
        'NextVerificationDueUtc',
        'IsManagedByHbIntel',
      ].sort(),
    );
  });
});

describe('Adobe Sign cache — SyncRuns list', () => {
  const descriptor = MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_DESCRIPTOR;

  it('locks list identity and field count', () => {
    expect(descriptor.title).toBe(MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE);
    expect(descriptor.fields).toHaveLength(21);
  });

  it('declares RunId as the unique + indexed primary key', () => {
    const key = fieldOf(descriptor, 'RunId');
    expect(key?.unique).toBe(true);
    expect(key?.indexed).toBe(true);
    expect(key?.required).toBe(true);
  });

  it('binds RunType / RefreshScope / Outcome choices', () => {
    expect(fieldOf(descriptor, 'RunType')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_SYNC_RUN_TYPES,
    ]);
    expect(fieldOf(descriptor, 'RefreshScope')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_REFRESH_SCOPES,
    ]);
    expect(fieldOf(descriptor, 'Outcome')?.choices).toEqual([
      ...ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
    ]);
  });

  it('declares the locked indexed-field set', () => {
    const indexed = descriptor.fields.filter((f) => f.indexed).map((f) => f.internalName).sort();
    expect(indexed).toEqual(
      ['RunId', 'CorrelationId', 'RunType', 'AdobeActorKey', 'StartedUtc', 'Outcome'].sort(),
    );
  });
});

describe('Adobe Sign cache — multi-list uniqueness invariants', () => {
  it('every list has exactly one unique-enforced field, indexed', () => {
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      const unique = descriptor.fields.filter((f) => f.unique);
      expect(unique).toHaveLength(1);
      expect(unique[0]?.indexed).toBe(true);
      expect(unique[0]?.required).toBe(true);
    }
  });

  it('no list redeclares the SharePoint built-in Title column', () => {
    for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
      expect(descriptor.fields.find((f) => f.internalName === 'Title')).toBeUndefined();
    }
  });
});
