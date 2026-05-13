import { describe, expect, it } from 'vitest';

import { ADOBE_SIGN_QUEUE_AVAILABLE } from '@hbc/models/myWork/fixtures';

import {
  KNOWN_FIXTURE_AGREEMENT_TITLES,
  assertNoFixtureTitleLeakageOnBackendLive,
  detectFixtureTitleLeakage,
} from './myWorkReadModelDataPath.js';

const SHIPPED_TITLES = [
  'Master Services Agreement',
  'Subcontract Approval Packet',
  'Vendor Terms Acceptance',
  'Site Safety Acknowledgement',
  'Insurance Disclosure Form',
  'Signature Delegation Request',
] as const;

describe('KNOWN_FIXTURE_AGREEMENT_TITLES', () => {
  it('contains every shipped queue-available agreement title', () => {
    for (const title of SHIPPED_TITLES) {
      expect(KNOWN_FIXTURE_AGREEMENT_TITLES.has(title)).toBe(true);
    }
  });

  it('is derived from the live fixture (sanity: at least six titles)', () => {
    expect(KNOWN_FIXTURE_AGREEMENT_TITLES.size).toBeGreaterThanOrEqual(SHIPPED_TITLES.length);
  });
});

describe('detectFixtureTitleLeakage', () => {
  it('returns matching titles when items reuse fixture names', () => {
    const leaked = detectFixtureTitleLeakage(ADOBE_SIGN_QUEUE_AVAILABLE.data.items);
    expect([...leaked].sort()).toEqual([...SHIPPED_TITLES].sort());
  });

  it('returns an empty array when items use distinct real titles', () => {
    const leaked = detectFixtureTitleLeakage([
      { agreementName: 'Project Closeout Acceptance — Highland 41' },
      { agreementName: 'Change Order #12 — Suite 305' },
    ]);
    expect(leaked).toEqual([]);
  });

  it('returns an empty array on an empty list', () => {
    expect(detectFixtureTitleLeakage([])).toEqual([]);
  });
});

describe('assertNoFixtureTitleLeakageOnBackendLive', () => {
  it('does nothing for fixture-ui-review even with fixture titles', () => {
    expect(() =>
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: 'fixture-ui-review',
        items: ADOBE_SIGN_QUEUE_AVAILABLE.data.items,
      }),
    ).not.toThrow();
  });

  it('does nothing for backend-unavailable-fallback even with fixture titles', () => {
    expect(() =>
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: 'backend-unavailable-fallback',
        items: ADOBE_SIGN_QUEUE_AVAILABLE.data.items,
      }),
    ).not.toThrow();
  });

  it('does nothing when dataPath is undefined (unknown posture, not asserting)', () => {
    expect(() =>
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: undefined,
        items: ADOBE_SIGN_QUEUE_AVAILABLE.data.items,
      }),
    ).not.toThrow();
  });

  it('throws when backend-live items contain a known fixture title', () => {
    expect(() =>
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: 'backend-live',
        items: [{ agreementName: 'Master Services Agreement' }],
      }),
    ).toThrow(/fixture-title leakage on backend-live/);
  });

  it('does nothing when backend-live items use only distinct real titles', () => {
    expect(() =>
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: 'backend-live',
        items: [
          { agreementName: 'Real Production Agreement A' },
          { agreementName: 'Real Production Agreement B' },
        ],
      }),
    ).not.toThrow();
  });

  it('lists every offending title in the error message', () => {
    let captured: Error | undefined;
    try {
      assertNoFixtureTitleLeakageOnBackendLive({
        dataPath: 'backend-live',
        items: [
          { agreementName: 'Master Services Agreement' },
          { agreementName: 'Site Safety Acknowledgement' },
          { agreementName: 'Real Agreement' },
        ],
      });
    } catch (err) {
      captured = err as Error;
    }
    expect(captured).toBeDefined();
    expect(captured!.message).toContain('Master Services Agreement');
    expect(captured!.message).toContain('Site Safety Acknowledgement');
    expect(captured!.message).not.toContain('Real Agreement');
  });
});
