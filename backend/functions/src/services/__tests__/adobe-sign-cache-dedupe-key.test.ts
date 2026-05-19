import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { computeAdobeSignWebhookDedupeKey } from '../adobe-sign-cache/dedupe-key.js';

function expectedHashFromComponents(components: readonly string[]): string {
  return createHash('sha256').update(components.join('|'), 'utf8').digest('hex');
}

describe('computeAdobeSignWebhookDedupeKey — providerEventId path', () => {
  it('returns the trimmed providerEventId when present', () => {
    expect(
      computeAdobeSignWebhookDedupeKey({
        providerEventId: '  evt-42  ',
        subscriptionKey: 'sub-1',
      }),
    ).toBe('evt-42');
  });

  it('does not invoke the SHA-256 fallback when providerEventId is non-empty', () => {
    // Same providerEventId regardless of other inputs → same key.
    const a = computeAdobeSignWebhookDedupeKey({
      providerEventId: 'evt-1',
      subscriptionKey: 'sub-a',
      providerEventType: 'TYPE_A',
    });
    const b = computeAdobeSignWebhookDedupeKey({
      providerEventId: 'evt-1',
      subscriptionKey: 'sub-DIFFERENT',
      providerEventType: 'TYPE_DIFFERENT',
    });
    expect(a).toBe('evt-1');
    expect(b).toBe('evt-1');
  });
});

describe('computeAdobeSignWebhookDedupeKey — SHA-256 fallback path', () => {
  it('falls back to the SHA-256 hash when providerEventId is missing', () => {
    const key = computeAdobeSignWebhookDedupeKey({
      subscriptionKey: 'sub-1',
      providerEventType: 'AGREEMENT_SIGNED',
      agreementId: 'agr-1',
      providerEventOccurredAtUtc: '2026-05-19T12:00:00.000Z',
      bodyHashSha256: 'abc',
    });
    expect(key).toBe(
      expectedHashFromComponents([
        'sub-1',
        'AGREEMENT_SIGNED',
        'agr-1',
        '2026-05-19T12:00:00.000Z',
        'abc',
      ]),
    );
  });

  it('falls back to the SHA-256 hash when providerEventId is whitespace-only', () => {
    const a = computeAdobeSignWebhookDedupeKey({
      providerEventId: '   ',
      subscriptionKey: 'sub-1',
      providerEventType: 'AGREEMENT_SIGNED',
    });
    expect(a).toBe(expectedHashFromComponents(['sub-1', 'AGREEMENT_SIGNED', '', '', '']));
  });

  it('produces a deterministic hash — same inputs always yield the same key', () => {
    const input = {
      subscriptionKey: 'sub-1',
      providerEventType: 'AGREEMENT_SIGNED',
      agreementId: 'agr-1',
      providerEventOccurredAtUtc: '2026-05-19T12:00:00.000Z',
    };
    const k1 = computeAdobeSignWebhookDedupeKey(input);
    const k2 = computeAdobeSignWebhookDedupeKey(input);
    expect(k1).toBe(k2);
    expect(k1).toHaveLength(64); // hex SHA-256
  });

  it('produces different hashes when any contributing field differs', () => {
    const base = {
      subscriptionKey: 'sub-1',
      providerEventType: 'TYPE_A',
      agreementId: 'agr-1',
      providerEventOccurredAtUtc: '2026-05-19T12:00:00.000Z',
      bodyHashSha256: 'h1',
    };
    const k0 = computeAdobeSignWebhookDedupeKey(base);
    const variants = [
      { ...base, subscriptionKey: 'sub-2' },
      { ...base, providerEventType: 'TYPE_B' },
      { ...base, agreementId: 'agr-2' },
      { ...base, providerEventOccurredAtUtc: '2026-05-19T12:00:01.000Z' },
      { ...base, bodyHashSha256: 'h2' },
    ];
    for (const variant of variants) {
      expect(computeAdobeSignWebhookDedupeKey(variant)).not.toBe(k0);
    }
  });

  it('renders missing optional components as empty between pipes for structural stability', () => {
    // Two different inputs that map to the same component tuple must hash identically.
    const a = computeAdobeSignWebhookDedupeKey({ subscriptionKey: 'sub-1' });
    const b = computeAdobeSignWebhookDedupeKey({
      subscriptionKey: 'sub-1',
      providerEventType: '',
      agreementId: undefined,
      providerEventOccurredAtUtc: '',
      bodyHashSha256: undefined,
    });
    expect(a).toBe(b);
    expect(a).toBe(expectedHashFromComponents(['sub-1', '', '', '', '']));
  });
});
