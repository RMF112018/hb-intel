import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  MY_WORK_FIXTURE_GENERATED_AT_UTC,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_BACKEND_UNAVAILABLE,
} from '@hbc/models/myWork/fixtures';

import { createMyWorkFixtureReadModelClient } from './myWorkFixtureReadModelClient.js';

const here = dirname(fileURLToPath(import.meta.url));
const moduleSource = readFileSync(join(here, 'myWorkFixtureReadModelClient.ts'), 'utf8');
const moduleSourceCode = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('My Work fixture read-model client — default posture', () => {
  it('returns the AVAILABLE home envelope with the deterministic fixture timestamp', async () => {
    const client = createMyWorkFixtureReadModelClient();
    const envelope = await client.getMyWorkHome();
    expect(envelope).toEqual({
      ...MY_WORK_HOME_AVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the AVAILABLE queue envelope when no cursor is supplied', async () => {
    const client = createMyWorkFixtureReadModelClient();
    const envelope = await client.getAdobeSignActionQueue();
    expect(envelope).toEqual({
      ...ADOBE_SIGN_QUEUE_AVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the AVAILABLE queue envelope when only pageSize is supplied without a cursor', async () => {
    const client = createMyWorkFixtureReadModelClient();
    const envelope = await client.getAdobeSignActionQueue({ pageSize: 10 });
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.pagination.hasMore).toBe(false);
  });
});

describe('My Work fixture read-model client — backend-unavailable posture', () => {
  it('returns the BACKEND_UNAVAILABLE home envelope', async () => {
    const client = createMyWorkFixtureReadModelClient({
      simulateBackendUnavailable: true,
    });
    const envelope = await client.getMyWorkHome();
    expect(envelope).toEqual({
      ...MY_WORK_HOME_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('returns the BACKEND_UNAVAILABLE queue envelope regardless of cursor', async () => {
    const client = createMyWorkFixtureReadModelClient({
      simulateBackendUnavailable: true,
    });
    const withoutCursor = await client.getAdobeSignActionQueue();
    const withCursor = await client.getAdobeSignActionQueue({
      cursor: 'cursor-page-2',
    });
    expect(withoutCursor).toEqual({
      ...ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
    expect(withCursor).toEqual({
      ...ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });
});

describe('My Work fixture read-model client — paged cursor handling', () => {
  it('returns the AVAILABLE_PAGED queue envelope when a non-empty cursor is provided', async () => {
    const client = createMyWorkFixtureReadModelClient();
    const envelope = await client.getAdobeSignActionQueue({
      cursor: 'cursor-page-2',
    });
    expect(envelope).toEqual({
      ...ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
      generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    });
  });

  it('ignores an empty-string cursor and returns the AVAILABLE queue envelope', async () => {
    const client = createMyWorkFixtureReadModelClient();
    const envelope = await client.getAdobeSignActionQueue({ cursor: '' });
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.pagination.hasMore).toBe(false);
  });
});

describe('My Work fixture read-model client — clock override', () => {
  it('stamps the supplied now() timestamp on the top-level envelope only', async () => {
    const client = createMyWorkFixtureReadModelClient({
      now: () => '2030-01-01T00:00:00.000Z',
    });
    const home = await client.getMyWorkHome();
    const queue = await client.getAdobeSignActionQueue();
    expect(home.generatedAtUtc).toBe('2030-01-01T00:00:00.000Z');
    expect(queue.generatedAtUtc).toBe('2030-01-01T00:00:00.000Z');
    expect(queue.data.freshness.generatedAtUtc).toBe(MY_WORK_FIXTURE_GENERATED_AT_UTC);
  });
});

describe('My Work fixture read-model client — contract purity', () => {
  it('contains no HTTP or auth primitives in source', () => {
    const forbidden = ['fetch(', 'Authorization', 'Bearer', 'msal', 'pnpjs', 'oauth', 'getToken'];
    for (const needle of forbidden) {
      expect(moduleSourceCode.toLowerCase()).not.toContain(needle.toLowerCase());
    }
  });

  it('imports only from @hbc/models/myWork and sibling client files', () => {
    const forbiddenPaths = [
      "from 'apps/",
      "from 'backend/",
      "from 'packages/features/",
      "from '@hbc/my-work-feed",
      "from '@hbc/sharepoint-docs",
      "from '@hbc/auth",
    ];
    for (const needle of forbiddenPaths) {
      expect(moduleSourceCode).not.toContain(needle);
    }
  });
});
