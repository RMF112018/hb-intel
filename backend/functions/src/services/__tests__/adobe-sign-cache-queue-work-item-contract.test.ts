import { describe, expect, it } from 'vitest';

import { ADOBE_SIGN_CACHE_REFRESH_SCOPES } from '../adobe-sign-cache/cache-list-descriptors.js';
import {
  ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS,
  ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS,
  ADOBE_SIGN_CACHE_WORK_ITEM_TYPES,
  assertAdobeSignCacheWorkItem,
  buildAdobeSignCacheWorkItem,
  validateAdobeSignCacheWorkItem,
} from '../adobe-sign-cache/queue-work-item-contract.js';

const NOW_DATE = new Date('2026-05-19T12:00:00.000Z');
const FIXED_UUID = '00000000-0000-4000-8000-000000000001';
const DEPS = {
  now: () => NOW_DATE,
  randomUUID: () => FIXED_UUID,
};

const BASE_VALID = {
  workItemId: FIXED_UUID,
  workItemType: 'ManualUserRefresh' as const,
  correlationId: 'corr-1',
  requestedAtUtc: '2026-05-19T12:00:00.000Z',
  adobeActorKey: 'actor-1',
  refreshScope: 'UserWide' as const,
};

describe('closed-enum tuple membership', () => {
  it('exposes the seven canonical work-item types in order', () => {
    expect(ADOBE_SIGN_CACHE_WORK_ITEM_TYPES).toEqual([
      'InitialHydration',
      'EnsureUserWebhook',
      'VerifyUserWebhook',
      'WebhookAgreementRefresh',
      'ManualUserRefresh',
      'ReconciliationUserRefresh',
    ]);
  });

  it('exposes the five canonical requested-by reasons in order', () => {
    expect(ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS).toEqual([
      'oauth-callback',
      'webhook',
      'user',
      'timer',
      'repair-endpoint',
    ]);
  });

  it('exposes the seven prohibited field names', () => {
    expect(ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS).toEqual([
      'accessToken',
      'refreshToken',
      'authorizationCode',
      'clientSecret',
      'rawWebhookPayload',
      'signingUrl',
      'actionUrl',
    ]);
  });
});

describe('validateAdobeSignCacheWorkItem — happy paths', () => {
  it.each(ADOBE_SIGN_CACHE_WORK_ITEM_TYPES.map((t) => [t]))(
    'accepts work-item type %s with required fields and a valid refreshScope',
    (workItemType) => {
      const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, workItemType });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.workItem.workItemType).toBe(workItemType);
    },
  );

  it('accepts every refresh scope', () => {
    for (const scope of ADOBE_SIGN_CACHE_REFRESH_SCOPES) {
      const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, refreshScope: scope });
      expect(result.ok).toBe(true);
    }
  });

  it('accepts every requestedBy reason', () => {
    for (const requestedBy of ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS) {
      const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, requestedBy });
      expect(result.ok).toBe(true);
    }
  });

  it('accepts every optional field together (full payload)', () => {
    const result = validateAdobeSignCacheWorkItem({
      ...BASE_VALID,
      workItemType: 'WebhookAgreementRefresh',
      refreshScope: 'AgreementTargeted',
      userPrincipalNameNormalized: 'user@example.com',
      subscriptionKey: 'sub-1',
      adobeWebhookId: 'wh-1',
      providerEventId: 'evt-1',
      providerEventType: 'AGREEMENT_ACTION_COMPLETED',
      agreementId: 'agr-1',
      providerEventOccurredAtUtc: '2026-05-19T11:59:00.000Z',
      bodyHashSha256: 'abc123',
      requestedBy: 'webhook',
    });
    expect(result.ok).toBe(true);
  });
});

describe('validateAdobeSignCacheWorkItem — rejections', () => {
  it.each(ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS.map((f) => [f]))(
    'rejects payload carrying prohibited field %s — before any other validation',
    (prohibited) => {
      const payload: Record<string, unknown> = { ...BASE_VALID, [prohibited]: 'leaked-value' };
      const result = validateAdobeSignCacheWorkItem(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe(`prohibited-field:${prohibited}`);
    },
  );

  it('rejects when the input is not an object', () => {
    expect(validateAdobeSignCacheWorkItem(null).ok).toBe(false);
    expect(validateAdobeSignCacheWorkItem('a string').ok).toBe(false);
    expect(validateAdobeSignCacheWorkItem([]).ok).toBe(false);
  });

  it('rejects unknown workItemType', () => {
    const result = validateAdobeSignCacheWorkItem({
      ...BASE_VALID,
      workItemType: 'BogusType',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-workItemType');
  });

  it('rejects unknown refreshScope', () => {
    const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, refreshScope: 'World' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-refreshScope');
  });

  it('rejects unknown requestedBy', () => {
    const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, requestedBy: 'mystery' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-requestedBy');
  });

  it.each([
    ['workItemId', 'missing-workItemId'],
    ['correlationId', 'missing-correlationId'],
    ['adobeActorKey', 'missing-adobeActorKey'],
  ])('rejects empty %s', (field, expectedReason) => {
    const result = validateAdobeSignCacheWorkItem({ ...BASE_VALID, [field]: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe(expectedReason);
  });

  it('rejects non-ISO requestedAtUtc', () => {
    const result = validateAdobeSignCacheWorkItem({
      ...BASE_VALID,
      requestedAtUtc: 'last Tuesday',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-requestedAtUtc');
  });

  it('rejects non-ISO providerEventOccurredAtUtc when present', () => {
    const result = validateAdobeSignCacheWorkItem({
      ...BASE_VALID,
      providerEventOccurredAtUtc: 'nope',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid-providerEventOccurredAtUtc');
  });

  it('rejects empty-string optional fields when present', () => {
    expect(
      validateAdobeSignCacheWorkItem({ ...BASE_VALID, subscriptionKey: '' }).ok,
    ).toBe(false);
  });
});

describe('assertAdobeSignCacheWorkItem', () => {
  it('does not throw for a valid work item', () => {
    expect(() => assertAdobeSignCacheWorkItem(BASE_VALID)).not.toThrow();
  });

  it('throws with the reason embedded in the message', () => {
    expect(() => assertAdobeSignCacheWorkItem({ ...BASE_VALID, workItemType: 'Bogus' })).toThrow(
      /invalid-workItemType/,
    );
  });
});

describe('buildAdobeSignCacheWorkItem', () => {
  it('fills workItemId via deps.randomUUID and requestedAtUtc via deps.now', () => {
    const workItem = buildAdobeSignCacheWorkItem(
      {
        workItemType: 'ManualUserRefresh',
        correlationId: 'corr-1',
        adobeActorKey: 'actor-1',
        refreshScope: 'UserWide',
      },
      DEPS,
    );
    expect(workItem.workItemId).toBe(FIXED_UUID);
    expect(workItem.requestedAtUtc).toBe(NOW_DATE.toISOString());
  });

  it('propagates every optional input field through validation', () => {
    const workItem = buildAdobeSignCacheWorkItem(
      {
        workItemType: 'WebhookAgreementRefresh',
        correlationId: 'corr-2',
        adobeActorKey: 'actor-2',
        refreshScope: 'AgreementTargeted',
        userPrincipalNameNormalized: 'user@example.com',
        subscriptionKey: 'sub-2',
        adobeWebhookId: 'wh-2',
        providerEventId: 'evt-2',
        providerEventType: 'AGREEMENT_SIGNED',
        agreementId: 'agr-2',
        providerEventOccurredAtUtc: '2026-05-19T11:00:00.000Z',
        bodyHashSha256: 'def456',
        requestedBy: 'webhook',
      },
      DEPS,
    );
    expect(workItem).toMatchObject({
      providerEventId: 'evt-2',
      providerEventType: 'AGREEMENT_SIGNED',
      agreementId: 'agr-2',
      requestedBy: 'webhook',
    });
  });

  it('throws when caller supplies an unknown refreshScope (caught at validation)', () => {
    expect(() =>
      buildAdobeSignCacheWorkItem(
        {
          workItemType: 'ManualUserRefresh',
          correlationId: 'corr-3',
          adobeActorKey: 'actor-3',
          // @ts-expect-error — intentional: testing the runtime guard
          refreshScope: 'Galactic',
        },
        DEPS,
      ),
    ).toThrow(/invalid-refreshScope/);
  });
});
