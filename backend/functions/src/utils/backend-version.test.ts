import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveBackendArtifactIdentity } from './backend-version.js';

const ENV_KEYS = [
  'HBC_FUNCTIONS_BUILD_VERSION',
  'HBC_FUNCTIONS_BUILD_SHA',
  'HBC_FUNCTIONS_BUILD_TIMESTAMP',
] as const;

describe('resolveBackendArtifactIdentity', () => {
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

  it('resolves version from @hbc/functions package.json when no env override is set', () => {
    const identity = resolveBackendArtifactIdentity();
    expect(typeof identity.version).toBe('string');
    expect(identity.version.length).toBeGreaterThan(0);
    expect(identity.version).not.toBe('unknown');
  });

  it('prefers env overrides over package.json for every field', () => {
    const VALID_SHA = 'c621aee82bc9ec0dc0434225726b83a632ace5c7';
    process.env.HBC_FUNCTIONS_BUILD_VERSION = '99.999.999';
    process.env.HBC_FUNCTIONS_BUILD_SHA = VALID_SHA;
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '2026-04-23T12:00:00.000Z';
    const identity = resolveBackendArtifactIdentity();
    expect(identity.version).toBe('99.999.999');
    expect(identity.commitSha).toBe(VALID_SHA);
    expect(identity.buildTimestamp).toBe('2026-04-23T12:00:00.000Z');
  });

  it('ignores empty/whitespace env overrides and falls back correctly', () => {
    process.env.HBC_FUNCTIONS_BUILD_VERSION = '   ';
    process.env.HBC_FUNCTIONS_BUILD_SHA = '';
    process.env.HBC_FUNCTIONS_BUILD_TIMESTAMP = '\t';
    const identity = resolveBackendArtifactIdentity();
    // version falls back to package.json
    expect(identity.version).not.toBe('');
    expect(identity.version).not.toBe('unknown');
    // commitSha and buildTimestamp have no package-level fallback → 'unknown'
    expect(identity.commitSha).toBe('unknown');
    expect(identity.buildTimestamp).toBe('unknown');
  });
});
