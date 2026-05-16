import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION,
  type MyWorkAdobeSignActionQueueItem,
  type MyWorkReadModelEnvelope,
  type MyWorkAdobeSignActionQueueReadModel,
} from '../index.js';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_EMPTY,
  ADOBE_SIGN_QUEUE_PARTIAL,
  ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
  ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
} from './adobeSignActionQueueReadModels.js';

const here = dirname(fileURLToPath(import.meta.url));
const moduleSource = readFileSync(join(here, 'adobeSignActionQueueReadModels.ts'), 'utf8');
const moduleSourceCode = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const ALL_QUEUE_FIXTURES: ReadonlyArray<
  readonly [string, MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>]
> = [
  ['ADOBE_SIGN_QUEUE_AVAILABLE', ADOBE_SIGN_QUEUE_AVAILABLE],
  ['ADOBE_SIGN_QUEUE_EMPTY', ADOBE_SIGN_QUEUE_EMPTY],
  ['ADOBE_SIGN_QUEUE_AVAILABLE_PAGED', ADOBE_SIGN_QUEUE_AVAILABLE_PAGED],
  ['ADOBE_SIGN_QUEUE_PARTIAL', ADOBE_SIGN_QUEUE_PARTIAL],
  ['ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED', ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED],
  ['ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED', ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED],
  ['ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED', ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED],
  ['ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE', ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE],
  ['ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE', ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE],
];

const DEGRADED_QUEUE_FIXTURES: ReadonlyArray<
  readonly [string, MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>, string]
> = [
  [
    'ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED',
    ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
    'configuration-required',
  ],
  [
    'ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED',
    ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
    'authorization-required',
  ],
  [
    'ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED',
    ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
    'principal-unresolved',
  ],
  [
    'ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE',
    ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
    'source-unavailable',
  ],
  [
    'ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE',
    ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
    'backend-unavailable',
  ],
];

describe('Adobe Sign queue fixtures — deterministic envelope stamping', () => {
  it('stamps every fixture with the B04 fixture timestamp and fixture mode', () => {
    expect(MY_WORK_FIXTURE_GENERATED_AT_UTC).toBe('2026-05-12T12:00:00.000Z');
    for (const [name, envelope] of ALL_QUEUE_FIXTURES) {
      expect(envelope.generatedAtUtc, name).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
      expect(envelope.mode, name).toBe('fixture');
      expect(envelope.readOnly, name).toBe(true);
      expect(envelope.data.moduleId, name).toBe('adobe-sign-action-queue');
      expect(envelope.data.freshness.generatedAtUtc, name).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
    }
  });
});

describe('Adobe Sign queue AVAILABLE fixture — six-status coverage', () => {
  it('contains exactly six items, one per actionable Adobe recipient status', () => {
    const items = ADOBE_SIGN_QUEUE_AVAILABLE.data.items;
    expect(items).toHaveLength(6);
    const observed = items.map((item) => item.adobeRecipientStatus).sort();
    const expected = [...ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES].sort();
    expect(observed).toEqual(expected);
  });

  it('maps every item requiredAction to the canonical Adobe-status mapping', () => {
    for (const item of ADOBE_SIGN_QUEUE_AVAILABLE.data.items) {
      expect(item.requiredAction).toBe(
        ADOBE_SIGN_STATUS_TO_REQUIRED_ACTION[item.adobeRecipientStatus],
      );
      expect(item.sourceSystem).toBe('adobe-sign');
      expect(item.itemId).toBe(`adobe-sign:${item.agreementId}`);
    }
  });

  it('includes resolver-capable, view-only, and unavailable handoff postures', () => {
    const postures = ADOBE_SIGN_QUEUE_AVAILABLE.data.items.map((item) => item.actionHandoff.posture);
    expect(postures).toContain('resolve-on-click');
    expect(postures).toContain('view-only');
    expect(postures).toContain('unavailable');
  });

  it('locks the AVAILABLE summary to the six-row breakdown with two expiring soon', () => {
    expect(ADOBE_SIGN_QUEUE_AVAILABLE.data.summary).toEqual({
      countBasis: 'returned-items',
      totalActionItemCount: 6,
      signatureCount: 1,
      approvalCount: 1,
      acceptanceCount: 1,
      acknowledgementCount: 1,
      formFillingCount: 1,
      delegationCount: 1,
      expiringSoonCount: 2,
    });
  });

  it('has exactly two items with expirationAtUtc within seven days of the fixture timestamp', () => {
    const cutoff = Date.parse('2026-05-19T12:00:00.000Z');
    const fixtureTime = Date.parse(MY_WORK_FIXTURE_GENERATED_AT_UTC);
    const expiringSoon = ADOBE_SIGN_QUEUE_AVAILABLE.data.items.filter((item) => {
      if (item.expirationAtUtc === undefined) return false;
      const t = Date.parse(item.expirationAtUtc);
      return t >= fixtureTime && t <= cutoff;
    });
    expect(expiringSoon).toHaveLength(2);
  });

  it('omits sourceOpenUrl on exactly one populated item without forcing partial state', () => {
    const withoutUrl = ADOBE_SIGN_QUEUE_AVAILABLE.data.items.filter(
      (item) => item.sourceOpenUrl === undefined,
    );
    expect(withoutUrl).toHaveLength(1);
    expect(ADOBE_SIGN_QUEUE_AVAILABLE.sourceStatus).toBe('available');
    const warningCodes = ADOBE_SIGN_QUEUE_AVAILABLE.warnings.map((w) => w.code);
    expect(warningCodes).not.toContain('source-open-url-omitted');
    expect(warningCodes).not.toContain('partial-source-data');
  });
});

describe('Adobe Sign queue EMPTY fixture', () => {
  it('exposes an empty items array with all summary counts at zero', () => {
    expect(ADOBE_SIGN_QUEUE_EMPTY.sourceStatus).toBe('available');
    expect(ADOBE_SIGN_QUEUE_EMPTY.data.items).toEqual([]);
    const summary = ADOBE_SIGN_QUEUE_EMPTY.data.summary;
    expect(summary.totalActionItemCount).toBe(0);
    expect(summary.signatureCount).toBe(0);
    expect(summary.approvalCount).toBe(0);
    expect(summary.acceptanceCount).toBe(0);
    expect(summary.acknowledgementCount).toBe(0);
    expect(summary.formFillingCount).toBe(0);
    expect(summary.delegationCount).toBe(0);
    expect(summary.expiringSoonCount).toBe(0);
    expect(summary.countBasis).toBe('returned-items');
    expect(ADOBE_SIGN_QUEUE_EMPTY.data.pagination).toEqual({
      pageSize: 25,
      hasMore: false,
    });
  });
});

describe('Adobe Sign queue AVAILABLE_PAGED fixture', () => {
  it('returns the first three items with hasMore and an opaque next cursor', () => {
    expect(ADOBE_SIGN_QUEUE_AVAILABLE_PAGED.sourceStatus).toBe('available');
    expect(ADOBE_SIGN_QUEUE_AVAILABLE_PAGED.data.items).toHaveLength(3);
    expect(ADOBE_SIGN_QUEUE_AVAILABLE_PAGED.data.items).toEqual(
      ADOBE_SIGN_QUEUE_AVAILABLE.data.items.slice(0, 3),
    );
    expect(ADOBE_SIGN_QUEUE_AVAILABLE_PAGED.data.pagination).toEqual({
      pageSize: 3,
      hasMore: true,
      nextCursor: 'cursor-page-2',
    });
  });
});

describe('Adobe Sign queue PARTIAL fixture', () => {
  it('returns a well-formed subset of the six items with the partial-source-data warning', () => {
    expect(ADOBE_SIGN_QUEUE_PARTIAL.sourceStatus).toBe('partial');
    expect(ADOBE_SIGN_QUEUE_PARTIAL.warnings).toEqual([{ code: 'partial-source-data' }]);
    expect(ADOBE_SIGN_QUEUE_PARTIAL.data.items).toHaveLength(3);
    for (const item of ADOBE_SIGN_QUEUE_PARTIAL.data.items) {
      expect(item.itemId.length).toBeGreaterThan(0);
      expect(item.agreementId.length).toBeGreaterThan(0);
      expect(item.agreementName.length).toBeGreaterThan(0);
      expect(item.sourceSystem).toBe('adobe-sign');
    }
    expect(ADOBE_SIGN_QUEUE_PARTIAL.data.summary.totalActionItemCount).toBe(3);
  });
});

describe('Adobe Sign queue degraded fixtures', () => {
  it.each(DEGRADED_QUEUE_FIXTURES)(
    '%s carries an empty payload, a matching warning code, and unknown freshness',
    (name, envelope, sourceStatus) => {
      expect(envelope.sourceStatus, name).toBe(sourceStatus);
      expect(envelope.warnings, name).toEqual([{ code: sourceStatus }]);
      expect(envelope.data.items, name).toEqual([]);
      expect(envelope.data.summary.totalActionItemCount, name).toBe(0);
      expect(envelope.data.pagination, name).toEqual({
        pageSize: 25,
        hasMore: false,
      });
      expect(envelope.data.freshness.state, name).toBe('unknown');
    },
  );
});

describe('Adobe Sign queue fixtures — determinism and contract purity', () => {
  it('contains no non-deterministic time or randomness primitives', () => {
    for (const needle of ['Math.random', 'Date.now', 'new Date(']) {
      expect(moduleSourceCode).not.toContain(needle);
    }
  });

  it('contains no runtime fetch, OAuth, or provider primitives', () => {
    const forbidden = ['fetch(', 'axios', 'msal', '@pnp/', 'pnpjs', 'oauth', 'getToken'];
    for (const needle of forbidden) {
      expect(moduleSourceCode.toLowerCase()).not.toContain(needle.toLowerCase());
    }
  });

  it('imports only from the sibling models barrel, never from app/backend/feature surfaces', () => {
    const forbiddenPaths = [
      "from 'apps/",
      "from 'backend/",
      "from 'packages/features/",
      "from '@hbc/my-work-feed",
      "from '@hbc/sharepoint-docs",
    ];
    for (const needle of forbiddenPaths) {
      expect(moduleSourceCode).not.toContain(needle);
    }
  });

  it('does not mutate items between repeated reads of the same fixture', () => {
    const first = ADOBE_SIGN_QUEUE_AVAILABLE.data.items;
    const second = ADOBE_SIGN_QUEUE_AVAILABLE.data.items;
    expect(first).toBe(second);
    const observedItem: MyWorkAdobeSignActionQueueItem = first[0]!;
    expect(observedItem).toBe(second[0]);
  });
});
