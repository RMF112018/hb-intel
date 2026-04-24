import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SAFETY_ACCEPTED_BACKEND_ORIGIN,
  SAFETY_EXPECTED_API_AUDIENCE,
  SAFETY_PACKAGE_VERSION,
  SAFETY_WEBPART_MANIFEST_ID,
  governedSafetyBinding,
} from '../runtime/governedRuntimeBinding.js';

const repoRoot = resolve(__dirname, '../../../..');

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, rel), 'utf-8')) as T;
}

describe('governedRuntimeBinding — single source of truth', () => {
  it('manifest id matches SafetyWebPart.manifest.json id field', () => {
    const manifest = readJson<{ id: string }>(
      'apps/safety/src/webparts/safety/SafetyWebPart.manifest.json',
    );
    expect(SAFETY_WEBPART_MANIFEST_ID).toBe(manifest.id);
  });

  it('package version matches package-solution.json solution.version', () => {
    const pkgSolution = readJson<{ solution: { version: string } }>(
      'apps/safety/config/package-solution.json',
    );
    expect(SAFETY_PACKAGE_VERSION).toBe(pkgSolution.solution.version);
  });

  it('manifest and package-solution versions are equal (deploy invariant)', () => {
    const manifest = readJson<{ version: string }>(
      'apps/safety/src/webparts/safety/SafetyWebPart.manifest.json',
    );
    const pkgSolution = readJson<{ solution: { version: string } }>(
      'apps/safety/config/package-solution.json',
    );
    expect(manifest.version).toBe(pkgSolution.solution.version);
  });

  it('accepted backend origin comes from config/runtime-binding.json (not derived)', () => {
    const binding = readJson<{ acceptedBackendOrigin: string }>(
      'apps/safety/config/runtime-binding.json',
    );
    expect(SAFETY_ACCEPTED_BACKEND_ORIGIN).toBe(binding.acceptedBackendOrigin);
  });

  it('expected API audience comes from config/runtime-binding.json', () => {
    const binding = readJson<{ expectedApiAudience: string }>(
      'apps/safety/config/runtime-binding.json',
    );
    expect(SAFETY_EXPECTED_API_AUDIENCE).toBe(binding.expectedApiAudience);
  });

  it('governedSafetyBinding() surfaces all governed fields', () => {
    const binding = governedSafetyBinding();
    expect(binding.manifestId).toBe(SAFETY_WEBPART_MANIFEST_ID);
    expect(binding.packageVersion).toBe(SAFETY_PACKAGE_VERSION);
    expect(binding.acceptedBackendOrigin).toBe(SAFETY_ACCEPTED_BACKEND_ORIGIN);
    expect(binding.expectedApiAudience).toBe(SAFETY_EXPECTED_API_AUDIENCE);
    expect(binding.hostedGuidOverlayFingerprint).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
    expect(typeof binding.buildSha).toBe('string');
    expect(typeof binding.buildTimestamp).toBe('string');
  });
});

describe('governed constants are not duplicated elsewhere in the app', () => {
  const FILES = [
    'apps/safety/src/mount.tsx',
    'apps/safety/src/webparts/safety/SafetyWebPart.tsx',
    'apps/safety/src/runtime/safetyRuntimeContract.ts',
  ];

  it('no file redeclares SAFETY_WEBPART_MANIFEST_ID or SAFETY_PACKAGE_VERSION as a local const', () => {
    for (const rel of FILES) {
      const source = readFileSync(resolve(repoRoot, rel), 'utf-8');
      // A local declaration would be `const SAFETY_WEBPART_MANIFEST_ID = ` or
      // `SAFETY_PACKAGE_VERSION = ` not preceded by `import`. We detect the
      // pattern without the import prefix.
      expect(source).not.toMatch(/^const SAFETY_WEBPART_MANIFEST_ID\s*=/m);
      expect(source).not.toMatch(/^const SAFETY_PACKAGE_VERSION\s*=/m);
      // Similarly no static class-level declaration.
      expect(source).not.toMatch(/private static readonly SAFETY_MANIFEST_ID/);
      expect(source).not.toMatch(/private static readonly SAFETY_PACKAGE_VERSION/);
    }
  });
});
