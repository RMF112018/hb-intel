/**
 * hb-intel-homepage package-effectiveness guard.
 *
 * Asserts the version-authority model documented in
 * `docs/how-to/verify-hb-intel-homepage-sppkg.md`: the solution
 * version, feature version, and HbHomepage webpart manifest version
 * must all agree. A local edit that bumps one without the others will
 * fail here before it can ship.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../../../../..');
const PACKAGE_SOLUTION = resolve(
  ROOT,
  'apps/hb-homepage/config/package-solution.json',
);
const WEBPART_MANIFEST = resolve(
  ROOT,
  'apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json',
);

interface PackageSolution {
  solution: {
    version: string;
    features: Array<{ version: string }>;
  };
}

interface WebpartManifest {
  version: string;
}

describe('hb-intel-homepage version authority', () => {
  const solution = JSON.parse(readFileSync(PACKAGE_SOLUTION, 'utf8')) as PackageSolution;
  const manifest = JSON.parse(readFileSync(WEBPART_MANIFEST, 'utf8')) as WebpartManifest;

  it('solution.version and features[0].version are identical', () => {
    expect(solution.solution.version).toBe(solution.solution.features[0].version);
  });

  it('HbHomepageWebPart.manifest.json::version matches solution.version', () => {
    expect(manifest.version).toBe(solution.solution.version);
  });

  it('the authoritative solution.version uses the SPFx 4-part schema', () => {
    expect(solution.solution.version).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  });
});
