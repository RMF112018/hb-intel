/**
 * Static no-runtime / no-mutation source-scan guard for the host-scoped PCC
 * read-model provider area (Phase 3 / Wave 3 / Prompt 04).
 *
 * Implementation under audit lives at
 * `backend/functions/src/hosts/pcc-read-model/`. Tests live under
 * `src/services/__tests__/` because the backend vitest unit-project glob
 * does not currently cover host-scoped test paths and Prompt 04 is
 * forbidden from modifying `vitest.config.ts`.
 *
 * Pattern adapted from `packages/models/src/pcc/NoRuntimeImports.test.ts`.
 * To avoid false positives in comments and string literals, this test
 * strips block comments, line comments, and string-literal contents from
 * each source file before scanning executable code; the import-specifier
 * pass scans the *original* line so the from-clause string is preserved.
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PCC_HOST_DIR = fileURLToPath(
  new URL('../../hosts/pcc-read-model/', import.meta.url),
);

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /['"]@pnp\//,
  /['"]@microsoft\/microsoft-graph-client['"]/,
  /['"]procore-sdk['"]/,
  /['"]procore/i,
  /['"]@microsoft\/sp-/,
  /['"]@azure\//,
  /['"]axios['"]/,
  /['"]node-fetch['"]/,
];

const FORBIDDEN_EXECUTABLE_TOKENS: readonly string[] = [
  'MSGraphClient',
  'GraphServiceClient',
  'sp.web',
  '_api/web',
  'ProcoreClient',
  'DocumentCrunchClient',
  'AdobeSignClient',
  'provision',
  'executeRepair',
  'permissionMutate',
  'writeBack',
  'mirror',
];

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      listSourceFiles(full, acc);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  const n = source.length;
  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < n && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
      i++;
      out += '""';
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

describe('PCC backend host stays free of runtime imports and mutation verbs', () => {
  const files = listSourceFiles(PCC_HOST_DIR);

  it('discovers at least one source file under the host directory', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('no source file imports SPFx, PnP, Azure SDK, HTTP clients, Procore, or Microsoft Graph', () => {
    const offenders: Array<{ file: string; line: string }> = [];
    for (const file of files) {
      const contents = readFileSync(file, 'utf8');
      for (const rawLine of contents.split('\n')) {
        const line = rawLine.trim();
        if (!line.startsWith('import') && !line.startsWith('export') && !line.includes('from ')) {
          continue;
        }
        for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
          if (pattern.test(line)) {
            offenders.push({ file, line });
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('executable code contains no forbidden runtime/mutation tokens', () => {
    const offenders: Array<{ file: string; token: string }> = [];
    for (const file of files) {
      const stripped = stripCommentsAndStrings(readFileSync(file, 'utf8'));
      for (const token of FORBIDDEN_EXECUTABLE_TOKENS) {
        if (stripped.includes(token)) {
          offenders.push({ file, token });
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
