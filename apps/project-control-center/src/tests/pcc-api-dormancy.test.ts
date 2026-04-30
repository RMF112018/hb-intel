/**
 * Wave 3 / Prompt 06 — runtime-cutover guard.
 *
 * The `src/api/` PCC read-model client boundary is intentionally
 * dormant in Wave 3. No app entry point, mount, shell, or surface
 * file may import from it; doing so would constitute a silent
 * runtime cutover away from the fixture-driven default.
 *
 * This test scans every non-api source file under
 * `apps/project-control-center/src/**` (excluding tests and the api
 * directory itself) and asserts there are no imports or usages of:
 *
 *   - the api directory or barrel
 *   - the client interface or factory function
 *   - the fixture client implementation
 *
 * If a future prompt is authorized to wire a client at mount, this
 * test must be updated as part of that prompt's reviewed scope.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = resolve(__dirname, '..');
const API_DIR = resolve(SRC_ROOT, 'api');
const TESTS_DIR = resolve(SRC_ROOT, 'tests');

const FORBIDDEN_API_REFERENCES = [
  'src/api',
  './api',
  '../api',
  'pccReadModelClient',
  'pccFixtureReadModelClient',
  'createPccFixtureReadModelClient',
  'IPccReadModelClient',
] as const;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (full === API_DIR || full === TESTS_DIR) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('PCC api dormancy guard', () => {
  const files = listSourceFiles(SRC_ROOT);

  it('finds non-api, non-test source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const forbidden of FORBIDDEN_API_REFERENCES) {
    it(`no non-api/non-test source file references '${forbidden}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const source = readFileSync(file, 'utf8');
        if (source.includes(forbidden)) {
          offenders.push(file);
        }
      }
      expect(
        offenders,
        `expected no api-reference offenders for '${forbidden}', found: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }
});
