import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveBackendArtifactIdentity } from './backend-version.js';

/**
 * Lock-in guards for deployment proof and operator readiness.
 *
 * Covers four surfaces:
 *   - D1: commitSha shape — either exactly "unknown" or a 40-char lowercase
 *         hex string, so `/api/health` artifact identity cannot be misread.
 *   - D2: buildTimestamp shape — either exactly "unknown" or a canonical
 *         ISO-8601 UTC string (ms precision with "Z" suffix).
 *   - D3: both health route handlers emit `Cache-Control: no-store, max-age=0`
 *         and `Content-Type: application/json` so artifact proof cannot be
 *         staled by intermediate caches.
 *   - D4: the deploy workflow matches the Flex Consumption One Deploy posture
 *         — `Azure/functions-action@v1` used; no `WEBSITE_RUN_FROM_PACKAGE`;
 *         three identity env stamps present; post-deploy parity probe wired.
 *
 * See audit report
 * `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/17-Deployment-Proof-And-Operator-Readiness.md`.
 */

const ENV_KEYS = [
  'HBC_FUNCTIONS_BUILD_VERSION',
  'HBC_FUNCTIONS_BUILD_SHA',
  'HBC_FUNCTIONS_BUILD_TIMESTAMP',
] as const;

const COMMIT_SHA_SHAPE = /^[0-9a-f]{40}$/;
const ISO_UTC_SHAPE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

function readSource(relativePath: string): string {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

describe('Deployment proof — D1 commitSha shape (impossible to misread)', () => {
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (snapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = snapshot[key];
      }
    }
  });

  it('D1.a: unset env → "unknown"', () => {
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.b: empty-string env → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = '';
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.c: whitespace-only env → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = '   \t\n';
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.d: valid 40-char lowercase hex passes through unchanged', () => {
    const valid = 'c621aee82bc9ec0dc0434225726b83a632ace5c7';
    process.env.HBC_FUNCTIONS_BUILD_SHA = valid;
    expect(resolveBackendArtifactIdentity().commitSha).toBe(valid);
  });

  it('D1.e: uppercase 40-char hex is normalized to lowercase', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = 'C621AEE82BC9EC0DC0434225726B83A632ACE5C7';
    expect(resolveBackendArtifactIdentity().commitSha).toBe(
      'c621aee82bc9ec0dc0434225726b83a632ace5c7',
    );
  });

  it('D1.f: 7-char truncation (short SHA) → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = 'c621aee';
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.g: non-hex characters → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = 'not-a-sha-at-all-just-some-random-text!!';
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.h: 41-char input → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_SHA = 'c621aee82bc9ec0dc0434225726b83a632ace5c7a';
    expect(resolveBackendArtifactIdentity().commitSha).toBe('unknown');
  });

  it('D1.i: returned commitSha always matches shape invariant', () => {
    for (const candidate of [
      undefined,
      '',
      '   ',
      'c621aee82bc9ec0dc0434225726b83a632ace5c7',
      'C621AEE82BC9EC0DC0434225726B83A632ACE5C7',
      'c621aee',
      'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    ]) {
      if (candidate === undefined) delete process.env.HBC_FUNCTIONS_BUILD_SHA;
      else process.env.HBC_FUNCTIONS_BUILD_SHA = candidate;
      const { commitSha } = resolveBackendArtifactIdentity();
      const ok = commitSha === 'unknown' || COMMIT_SHA_SHAPE.test(commitSha);
      expect(
        ok,
        `commitSha must be "unknown" or match ${COMMIT_SHA_SHAPE}; got ${JSON.stringify(commitSha)} from env ${JSON.stringify(candidate)}`,
      ).toBe(true);
    }
  });
});

describe('Deployment proof — D2 buildTimestamp shape (impossible to misread)', () => {
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (snapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = snapshot[key];
      }
    }
  });

  it('D2.a: unset env → "unknown"', () => {
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe('unknown');
  });

  it('D2.b: empty-string env → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe('unknown');
  });

  it('D2.c: whitespace-only env → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = ' \t';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe('unknown');
  });

  it('D2.d: canonical ISO-8601 UTC passes through unchanged', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '2026-04-23T12:00:00.000Z';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe(
      '2026-04-23T12:00:00.000Z',
    );
  });

  it('D2.e: ISO-8601 without milliseconds is normalized to ms form', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '2026-04-23T12:00:00Z';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe(
      '2026-04-23T12:00:00.000Z',
    );
  });

  it('D2.f: ISO-8601 with offset is normalized to UTC Z form', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '2026-04-23T14:00:00.000+02:00';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe(
      '2026-04-23T12:00:00.000Z',
    );
  });

  it('D2.g: garbage string → "unknown"', () => {
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = 'not-a-date';
    expect(resolveBackendArtifactIdentity().buildTimestamp).toBe('unknown');
  });

  it('D2.h: returned buildTimestamp always matches shape invariant', () => {
    for (const candidate of [
      undefined,
      '',
      '   ',
      '2026-04-23T12:00:00.000Z',
      '2026-04-23T12:00:00Z',
      '2026-04-23T14:00:00.000+02:00',
      'not-a-date',
      'yesterday',
    ]) {
      if (candidate === undefined) delete process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP;
      else process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = candidate;
      const { buildTimestamp } = resolveBackendArtifactIdentity();
      const ok = buildTimestamp === 'unknown' || ISO_UTC_SHAPE.test(buildTimestamp);
      expect(
        ok,
        `buildTimestamp must be "unknown" or match ${ISO_UTC_SHAPE}; got ${JSON.stringify(buildTimestamp)} from env ${JSON.stringify(candidate)}`,
      ).toBe(true);
    }
  });
});

describe('Deployment proof — D3 health handlers emit no-store cache headers', () => {
  const HEALTH_HANDLERS: ReadonlyArray<{ role: string; relativePath: string }> = [
    {
      role: 'anonymous /api/health',
      relativePath: '../functions/health/index.ts',
    },
    {
      role: 'admin-gated /api/health/ready',
      relativePath: '../functions/health/ready.ts',
    },
  ];

  it.each(HEALTH_HANDLERS)(
    'D3 [$role]: $relativePath response sets Cache-Control: no-store and Content-Type: application/json',
    ({ role, relativePath }) => {
      const source = readSource(relativePath);
      expect(
        source,
        `${role} handler at ${relativePath} must emit Cache-Control header in response init`,
      ).toMatch(/['"`]Cache-Control['"`]\s*:\s*['"`][^'"`]*no-store[^'"`]*['"`]/);
      expect(
        source,
        `${role} handler at ${relativePath} must emit Content-Type: application/json in response init`,
      ).toMatch(/['"`]Content-Type['"`]\s*:\s*['"`]application\/json['"`]/);
    },
  );
});

describe('Deployment proof — D4 deploy workflow matches Flex Consumption One Deploy posture', () => {
  const WORKFLOW_RELATIVE = '../../../../.github/workflows/main_hb-intel-function-app.yml';

  function readWorkflow(): string {
    return readFileSync(resolve(import.meta.dirname, WORKFLOW_RELATIVE), 'utf8');
  }

  it('D4.a: workflow uses Azure/functions-action@v1 (One Deploy, Flex-compatible)', () => {
    expect(readWorkflow()).toMatch(/Azure\/functions-action@v1/);
  });

  it('D4.b: workflow does NOT set WEBSITE_RUN_FROM_PACKAGE (Flex-incompatible; Consumption-only)', () => {
    expect(readWorkflow()).not.toMatch(/WEBSITE_RUN_FROM_PACKAGE/);
  });

  it('D4.c: workflow stamps HBC_FUNCTIONS_BUILD_VERSION', () => {
    expect(readWorkflow()).toMatch(/HBC_FUNCTIONS_BUILD_VERSION/);
  });

  it('D4.d: workflow stamps HBC_FUNCTIONS_BUILD_SHA', () => {
    expect(readWorkflow()).toMatch(/HBC_FUNCTIONS_BUILD_SHA/);
  });

  it('D4.e: workflow stamps HBC_FUNCTIONS_BUILD_TIMESTAMP', () => {
    expect(readWorkflow()).toMatch(/HBC_FUNCTIONS_BUILD_TIMESTAMP/);
  });

  it('D4.f: workflow wires the post-deploy parity proof', () => {
    expect(readWorkflow()).toMatch(/verify-functions-live-parity\.ts/);
  });
});
