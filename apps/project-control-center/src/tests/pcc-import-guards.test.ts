import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = resolve(__dirname, '..');

const FORBIDDEN_HOMEPAGE = [
  '@hbc/ui-kit/homepage',
  '@hbc/homepage-launcher',
  'apps/hb-homepage',
  'HbcHomepageSectionShell',
  'HbcHomepageActionRow',
  'HbcHomepageMetadataRow',
  'HbcSignatureHeroSurface',
  'HbcCommandSurface',
  'HbcLauncherSurface',
  'HbcDiscoverySurface',
  'HbcEditorialSurface',
  'HbcOperationalSurface',
  'HbcSafetyHomepageSurface',
  'HbcPeopleCultureSurface',
  'HbcProjectSpotlightSurface',
  'HbcNewsroomSurface',
  'HbcPriorityRailSurface',
];

const FORBIDDEN_LIVE_INTEGRATIONS = [
  '@hbc/auth',
  'bootstrapSpfxAuth',
  'resolveSpfxPermissions',
  '@pnp/sp',
  '@microsoft/sp-http',
  '@microsoft/microsoft-graph-client',
  'procoreApi',
  'procore-sdk',
];

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'tests') continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Strip line comments, block comments, and string/template literals from a
 * source file before scanning. Keeps imports and identifiers intact.
 * Mirrors the pattern from the source-scan-guard memory: scan code, not prose.
 */
function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code';
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (mode === 'code') {
      if (c === '/' && next === '/') {
        mode = 'line';
        i += 2;
        continue;
      }
      if (c === '/' && next === '*') {
        mode = 'block';
        i += 2;
        continue;
      }
      if (c === "'") {
        mode = 'single';
        i += 1;
        continue;
      }
      if (c === '"') {
        mode = 'double';
        i += 1;
        continue;
      }
      if (c === '`') {
        mode = 'template';
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
    if (mode === 'line') {
      if (c === '\n') {
        out += '\n';
        mode = 'code';
      }
      i += 1;
      continue;
    }
    if (mode === 'block') {
      if (c === '*' && next === '/') {
        mode = 'code';
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }
    if (mode === 'single' || mode === 'double' || mode === 'template') {
      const closer = mode === 'single' ? "'" : mode === 'double' ? '"' : '`';
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === closer) {
        mode = 'code';
      }
      i += 1;
      continue;
    }
  }
  return out;
}

describe('PCC import guards', () => {
  const files = listSourceFiles(SRC_ROOT);

  it('finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const forbidden of FORBIDDEN_HOMEPAGE) {
    it(`does not import or reference '${forbidden}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const stripped = stripCommentsAndStrings(readFileSync(file, 'utf8'));
        if (stripped.includes(forbidden)) {
          offenders.push(file);
        }
      }
      expect(offenders, `expected no offenders for '${forbidden}', found: ${offenders.join(', ')}`).toEqual([]);
    });
  }

  for (const forbidden of FORBIDDEN_LIVE_INTEGRATIONS) {
    it(`does not import or reference '${forbidden}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const stripped = stripCommentsAndStrings(readFileSync(file, 'utf8'));
        if (stripped.includes(forbidden)) {
          offenders.push(file);
        }
      }
      expect(offenders, `expected no offenders for '${forbidden}', found: ${offenders.join(', ')}`).toEqual([]);
    });
  }
});
