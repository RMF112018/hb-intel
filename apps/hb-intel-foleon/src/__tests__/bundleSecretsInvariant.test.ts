/**
 * Build-bundle secrets invariant.
 *
 * Proves that the SPFx IIFE bundle shipped by this package carries no
 * Foleon OAuth credentials, no Foleon API hostnames, and no baked-in
 * Authorization headers. Required by Prompt 03: "Keep Foleon API
 * client credentials server-side only" + "Secret handling proof: no
 * Foleon secrets in SPFx bundle."
 *
 * The bundle is produced by `pnpm --filter @hbc/spfx-hb-intel-foleon
 * build` (`tsc --noEmit && vite build`). The test will build the
 * bundle on demand when it is missing, so the verification remains
 * self-contained.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(__dirname, '..', '..');
const BUNDLE_PATH = resolve(PACKAGE_ROOT, 'dist', 'hb-intel-foleon-app.js');

// Tokens that must never appear in the shipped bundle.
const SECRET_PATTERNS: ReadonlyArray<{ label: string; needle: string | RegExp }> = [
  { label: 'Foleon client-secret env var', needle: 'FOLEON_CLIENT_SECRET' },
  { label: 'Foleon client-secret (lowercase)', needle: 'foleon_client_secret' },
  { label: 'Foleon API key env var', needle: 'FOLEON_API_KEY' },
  { label: 'Foleon API key (lowercase)', needle: 'foleon_api_key' },
  { label: 'Foleon OAuth token endpoint', needle: '/oauth/token' },
  { label: 'Foleon API host (api.foleon.com)', needle: 'api.foleon.com' },
  { label: 'Foleon REST API prefix', needle: 'foleon.com/api' },
  { label: 'baked-in Bearer auth header', needle: /Authorization"?\s*:\s*"?Bearer\s+[A-Za-z0-9]/i },
];

describe('Foleon SPFx bundle — secrets invariant', () => {
  let bundle = '';

  beforeAll(() => {
    if (!existsSync(BUNDLE_PATH)) {
      // Build on demand so CI and local both work. `tsc --noEmit` runs
      // first (fast); Vite build is deterministic.
      execSync('pnpm --filter @hbc/spfx-hb-intel-foleon build', {
        stdio: 'pipe',
        cwd: resolve(PACKAGE_ROOT, '..', '..'),
      });
    }
    expect(existsSync(BUNDLE_PATH)).toBe(true);
    bundle = readFileSync(BUNDLE_PATH, 'utf8');
    expect(bundle.length).toBeGreaterThan(0);
  }, 120_000);

  it('the shipped bundle exists and is non-empty', () => {
    const stats = statSync(BUNDLE_PATH);
    expect(stats.size).toBeGreaterThan(0);
  });

  for (const { label, needle } of SECRET_PATTERNS) {
    it(`does not contain: ${label}`, () => {
      const found =
        needle instanceof RegExp ? needle.test(bundle) : bundle.includes(needle);
      expect(
        found,
        `Bundle must not contain "${String(needle)}" (${label}). Any Foleon API auth must be server-side only.`,
      ).toBe(false);
    });
  }

  it('contains only the governed Foleon viewer host (reader allowlist)', () => {
    // The only Foleon hostname that may appear is the default reader
    // viewer origin embedded in DEFAULT_FOLEON_ORIGINS. Any other host
    // in the `.foleon.com` family would imply either a leaked custom
    // tenant subdomain or a direct client-side API call — both are
    // violations of the launch-scope ADR.
    const hostnames = new Set<string>();
    const regex = /([a-z0-9-]+\.)*foleon\.com/gi;
    for (const match of bundle.matchAll(regex)) {
      hostnames.add(match[0].toLowerCase());
    }
    const allowed = new Set(['viewer.us.foleon.com']);
    const unexpected = [...hostnames].filter((h) => !allowed.has(h));
    expect(
      unexpected,
      `Unexpected Foleon host(s) in SPFx bundle: ${unexpected.join(', ')}`,
    ).toEqual([]);
  });
});
