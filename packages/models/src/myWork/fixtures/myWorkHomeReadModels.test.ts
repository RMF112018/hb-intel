import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { MyWorkHomeReadModel, MyWorkReadModelEnvelope } from '../index.js';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
} from './adobeSignActionQueueReadModels.js';

import {
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
  MY_WORK_HOME_CONFIGURATION_REQUIRED,
  MY_WORK_HOME_EMPTY,
  MY_WORK_HOME_PARTIAL,
  MY_WORK_HOME_PRINCIPAL_UNRESOLVED,
  MY_WORK_HOME_SOURCE_UNAVAILABLE,
} from './myWorkHomeReadModels.js';

const here = dirname(fileURLToPath(import.meta.url));
const moduleSource = readFileSync(join(here, 'myWorkHomeReadModels.ts'), 'utf8');
const moduleSourceCode = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const ALL_HOME_FIXTURES: ReadonlyArray<
  readonly [string, MyWorkReadModelEnvelope<MyWorkHomeReadModel>]
> = [
  ['MY_WORK_HOME_AVAILABLE', MY_WORK_HOME_AVAILABLE],
  ['MY_WORK_HOME_EMPTY', MY_WORK_HOME_EMPTY],
  ['MY_WORK_HOME_PARTIAL', MY_WORK_HOME_PARTIAL],
  ['MY_WORK_HOME_CONFIGURATION_REQUIRED', MY_WORK_HOME_CONFIGURATION_REQUIRED],
  ['MY_WORK_HOME_AUTHORIZATION_REQUIRED', MY_WORK_HOME_AUTHORIZATION_REQUIRED],
  ['MY_WORK_HOME_PRINCIPAL_UNRESOLVED', MY_WORK_HOME_PRINCIPAL_UNRESOLVED],
  ['MY_WORK_HOME_SOURCE_UNAVAILABLE', MY_WORK_HOME_SOURCE_UNAVAILABLE],
  ['MY_WORK_HOME_BACKEND_UNAVAILABLE', MY_WORK_HOME_BACKEND_UNAVAILABLE],
];

const DEGRADED_HOME_FIXTURES: ReadonlyArray<
  readonly [string, MyWorkReadModelEnvelope<MyWorkHomeReadModel>, string]
> = [
  [
    'MY_WORK_HOME_CONFIGURATION_REQUIRED',
    MY_WORK_HOME_CONFIGURATION_REQUIRED,
    'configuration-required',
  ],
  [
    'MY_WORK_HOME_AUTHORIZATION_REQUIRED',
    MY_WORK_HOME_AUTHORIZATION_REQUIRED,
    'authorization-required',
  ],
  ['MY_WORK_HOME_PRINCIPAL_UNRESOLVED', MY_WORK_HOME_PRINCIPAL_UNRESOLVED, 'principal-unresolved'],
  ['MY_WORK_HOME_SOURCE_UNAVAILABLE', MY_WORK_HOME_SOURCE_UNAVAILABLE, 'source-unavailable'],
  ['MY_WORK_HOME_BACKEND_UNAVAILABLE', MY_WORK_HOME_BACKEND_UNAVAILABLE, 'backend-unavailable'],
];

describe('My Work home fixtures — deterministic envelope stamping', () => {
  it('stamps every home envelope with the fixture timestamp, fixture mode, and the canonical actor', () => {
    for (const [name, envelope] of ALL_HOME_FIXTURES) {
      expect(envelope.generatedAtUtc, name).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
      expect(envelope.mode, name).toBe('fixture');
      expect(envelope.readOnly, name).toBe(true);
      expect(envelope.data.actor, name).toEqual({
        displayName: 'Avery Project Lead',
        principalName: 'avery.lead@hb.example.com',
        hbcUserId: 'hb-user-fixture-1',
      });
      expect(envelope.data.adobeSignActionQueue.previewItemLimit, name).toBe(5);
      expect(envelope.data.sourceReadiness, name).toHaveLength(1);
      expect(envelope.data.sourceReadiness[0]!.sourceSystem, name).toBe('adobe-sign');
    }
  });
});

describe('My Work home AVAILABLE fixture', () => {
  it('surfaces six action items and the first five queue items as preview items', () => {
    expect(MY_WORK_HOME_AVAILABLE.sourceStatus).toBe('available');
    expect(MY_WORK_HOME_AVAILABLE.warnings).toEqual([]);
    expect(MY_WORK_HOME_AVAILABLE.data.summary.totalActionItemCount).toBe(6);
    expect(MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.previewItems).toHaveLength(5);
    expect(MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.previewItems).toEqual(
      ADOBE_SIGN_QUEUE_AVAILABLE.data.items.slice(0, 5),
    );
    expect(MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.summary).toEqual(
      ADOBE_SIGN_QUEUE_AVAILABLE.data.summary,
    );
    expect(MY_WORK_HOME_AVAILABLE.data.sourceReadiness[0]!.sourceStatus).toBe('available');
  });
});

describe('My Work home EMPTY fixture', () => {
  it('reports zero action items and an empty queue projection without warnings', () => {
    expect(MY_WORK_HOME_EMPTY.sourceStatus).toBe('available');
    expect(MY_WORK_HOME_EMPTY.warnings).toEqual([]);
    expect(MY_WORK_HOME_EMPTY.data.summary.totalActionItemCount).toBe(0);
    expect(MY_WORK_HOME_EMPTY.data.adobeSignActionQueue.previewItems).toEqual([]);
    expect(MY_WORK_HOME_EMPTY.data.adobeSignActionQueue.summary.totalActionItemCount).toBe(0);
    expect(MY_WORK_HOME_EMPTY.data.sourceReadiness[0]!.sourceStatus).toBe('available');
  });
});

describe('My Work home PARTIAL fixture', () => {
  it('carries three action items, the partial warning, and the matching readiness state', () => {
    expect(MY_WORK_HOME_PARTIAL.sourceStatus).toBe('partial');
    expect(MY_WORK_HOME_PARTIAL.warnings).toEqual([{ code: 'partial-source-data' }]);
    expect(MY_WORK_HOME_PARTIAL.data.summary.totalActionItemCount).toBe(3);
    expect(MY_WORK_HOME_PARTIAL.data.adobeSignActionQueue.previewItems).toHaveLength(3);
    expect(MY_WORK_HOME_PARTIAL.data.sourceReadiness[0]!.sourceStatus).toBe('partial');
    expect(MY_WORK_HOME_PARTIAL.data.sourceReadiness[0]!.warnings).toEqual([
      { code: 'partial-source-data' },
    ]);
  });
});

describe('My Work home degraded fixtures', () => {
  it.each(DEGRADED_HOME_FIXTURES)(
    '%s zeroes the projection and aligns the readiness warning with the envelope source status',
    (name, envelope, sourceStatus) => {
      expect(envelope.sourceStatus, name).toBe(sourceStatus);
      expect(envelope.warnings, name).toEqual([{ code: sourceStatus }]);
      expect(envelope.data.summary.totalActionItemCount, name).toBe(0);
      expect(envelope.data.adobeSignActionQueue.previewItems, name).toEqual([]);
      expect(envelope.data.adobeSignActionQueue.summary.totalActionItemCount, name).toBe(0);
      expect(envelope.data.sourceReadiness[0]!.sourceStatus, name).toBe(sourceStatus);
      expect(envelope.data.sourceReadiness[0]!.warnings, name).toEqual([{ code: sourceStatus }]);
    },
  );
});

describe('My Work home fixtures — determinism and contract purity', () => {
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

  it('imports only from the sibling fixtures file and the models barrel', () => {
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
});
