import { describe, expect, it } from 'vitest';
import { MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS } from '@hbc/models/myWork';

import {
  computeAdobeSignCacheProjectionKey,
  deriveRecipientActionKeyForActionQueue,
  deriveRecipientActionKeyForRecentCompletion,
  RECIPIENT_ACTION_KEY_DEFAULT,
} from '../adobe-sign-cache/projection-key.js';

const ACTOR = 'tenant-1::oid-avery';

describe('computeAdobeSignCacheProjectionKey', () => {
  it('composes the canonical actor::agreement::recipientActionKey string', () => {
    expect(
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: ACTOR,
        agreementId: 'agr-1',
        recipientActionKey: 'signature',
      }),
    ).toBe('tenant-1::oid-avery::agr-1::signature');
  });

  it('uses RECIPIENT_ACTION_KEY_DEFAULT for the agreement-grain case', () => {
    expect(
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: ACTOR,
        agreementId: 'agr-1',
        recipientActionKey: RECIPIENT_ACTION_KEY_DEFAULT,
      }),
    ).toBe('tenant-1::oid-avery::agr-1::__DEFAULT__');
  });

  it('throws RangeError for empty / whitespace inputs', () => {
    expect(() =>
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: '',
        agreementId: 'agr-1',
        recipientActionKey: 'signature',
      }),
    ).toThrow(RangeError);
    expect(() =>
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: ACTOR,
        agreementId: '   ',
        recipientActionKey: 'signature',
      }),
    ).toThrow(RangeError);
    expect(() =>
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: ACTOR,
        agreementId: 'agr-1',
        recipientActionKey: '' as unknown as 'signature',
      }),
    ).toThrow(RangeError);
  });

  it('rejects inputs with leading / trailing whitespace (caller must trim)', () => {
    expect(() =>
      computeAdobeSignCacheProjectionKey({
        adobeActorKey: ' tenant-1::oid-avery ',
        agreementId: 'agr-1',
        recipientActionKey: 'signature',
      }),
    ).toThrow(RangeError);
  });

  it('is case-sensitive (no implicit normalization)', () => {
    const lower = computeAdobeSignCacheProjectionKey({
      adobeActorKey: 'tenant-1::oid-avery',
      agreementId: 'agr-1',
      recipientActionKey: 'signature',
    });
    const upper = computeAdobeSignCacheProjectionKey({
      adobeActorKey: 'TENANT-1::OID-AVERY',
      agreementId: 'agr-1',
      recipientActionKey: 'signature',
    });
    expect(lower).not.toBe(upper);
  });

  it('is idempotent: same inputs → same key', () => {
    const k1 = computeAdobeSignCacheProjectionKey({
      adobeActorKey: ACTOR,
      agreementId: 'agr-1',
      recipientActionKey: 'approval',
    });
    const k2 = computeAdobeSignCacheProjectionKey({
      adobeActorKey: ACTOR,
      agreementId: 'agr-1',
      recipientActionKey: 'approval',
    });
    expect(k1).toBe(k2);
  });
});

describe('deriveRecipientActionKeyForActionQueue', () => {
  it.each(MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS.map((a) => [a] as const))(
    'returns the locked required-action value verbatim: %s',
    (action) => {
      expect(deriveRecipientActionKeyForActionQueue({ requiredAction: action })).toBe(action);
    },
  );

  it('throws RangeError for unknown requiredAction value', () => {
    expect(() =>
      deriveRecipientActionKeyForActionQueue({
        requiredAction: 'mystery-action' as never,
      }),
    ).toThrow(RangeError);
  });
});

describe('deriveRecipientActionKeyForRecentCompletion', () => {
  it('always returns RECIPIENT_ACTION_KEY_DEFAULT', () => {
    expect(deriveRecipientActionKeyForRecentCompletion({ agreementId: 'agr-1' })).toBe(
      RECIPIENT_ACTION_KEY_DEFAULT,
    );
    expect(deriveRecipientActionKeyForRecentCompletion({ agreementId: 'agr-9999' })).toBe(
      RECIPIENT_ACTION_KEY_DEFAULT,
    );
  });
});
