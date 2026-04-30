/**
 * Wave 4 / Prompt 02 — controlled-consumption guard.
 *
 * Replaces the Wave 3 dormancy guard. The PCC `src/api/` read-model
 * boundary now hosts the Wave 4 mode/config seam (`createPccReadModelClient`,
 * `IPccReadModelConfig`, etc.). This guard admits exactly one non-api
 * consumer in Prompt 02 — a type-only `IPccReadModelConfig` import in
 * `src/mount.tsx` so `IPccMountConfig.readModel` can carry the config
 * forward. Every other surface, the shell, the router, `PccApp.tsx`,
 * and Project Home remain blocked from importing the API seam.
 *
 * Project Home consumption allowlisting is owned by Prompts 04
 * (adapter), 05 (wiring), and 06 (guard refinement). It is NOT in
 * scope for Prompt 02.
 *
 * Two scan modes, applied per assertion:
 *   - import-source / forbidden-runtime path scans → comment-stripped
 *     source (string literals preserved so import paths remain visible);
 *   - identifier and `fetch(` scans → comment- and string-stripped
 *     source (avoids false positives inside legitimate string data
 *     and guardrail comments).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve(__dirname, '..');
const API_DIR = resolve(SRC_ROOT, 'api');
const TESTS_DIR = resolve(SRC_ROOT, 'tests');
const MOUNT_FILE = resolve(SRC_ROOT, 'mount.tsx');
const FACTORY_FILE = resolve(API_DIR, 'pccReadModelClientFactory.ts');

const FORBIDDEN_API_IDENTIFIERS = [
  'IPccReadModelClient',
  'pccReadModelClient',
  'pccFixtureReadModelClient',
  'createPccFixtureReadModelClient',
  'createPccReadModelClient',
  'resolvePccReadModelConfig',
  'pccBackendReadModelClient',
  'createPccBackendReadModelClient',
] as const;

const FETCH_CALLSITE_ALLOWLIST = new Set<string>([
  resolve(__dirname, '..', 'api', 'pccBackendReadModelClient.ts'),
  resolve(__dirname, '..', 'api', 'pccBackendReadModelClient.test.ts'),
]);

const FORBIDDEN_RUNTIME_IMPORT_PATHS = [
  '@pnp/sp',
  '@pnp/graph',
  '@microsoft/sp-pnp-js',
  '@hbc/auth/spfx',
  'msgraph',
  'graph.microsoft.com',
  'procore',
] as const;

const ALLOWED_MOUNT_API_IMPORT_PATHS = new Set<string>([
  './api/pccReadModelClientFactory',
  './api/pccReadModelClientFactory.js',
]);

interface IImportStatement {
  readonly raw: string;
  readonly typeOnly: boolean;
  readonly clauseText: string;
  readonly path: string;
}

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

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
}

function stripCommentsAndStrings(src: string): string {
  return stripComments(src)
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``');
}

function extractImports(commentStripped: string): readonly IImportStatement[] {
  const out: IImportStatement[] = [];
  const re =
    /import\s+(type\s+)?([\s\S]*?)\s+from\s+(['"])([^'"]+)\3\s*;?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(commentStripped)) !== null) {
    out.push({
      raw: m[0]!,
      typeOnly: Boolean(m[1]),
      clauseText: m[2]!.trim(),
      path: m[4]!,
    });
  }
  return out;
}

function isApiImportPath(path: string): boolean {
  if (path.includes('src/api')) return true;
  return /^(\.{1,2})\/api(\/|$)/.test(path);
}

function namedImportSpecifiers(clauseText: string): readonly string[] {
  const braceMatch = clauseText.match(/\{([^}]*)\}/);
  if (!braceMatch) return [];
  return braceMatch[1]!
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const aliasIdx = s.search(/\s+as\s+/);
      return aliasIdx === -1 ? s : s.slice(0, aliasIdx).trim();
    });
}

interface IScannedFile {
  readonly path: string;
  readonly raw: string;
  readonly commentStripped: string;
  readonly tokenStripped: string;
  readonly imports: readonly IImportStatement[];
}

function scan(file: string): IScannedFile {
  const raw = readFileSync(file, 'utf8');
  const commentStripped = stripComments(raw);
  return {
    path: file,
    raw,
    commentStripped,
    tokenStripped: stripCommentsAndStrings(raw),
    imports: extractImports(commentStripped),
  };
}

describe('PCC api controlled-consumption guard (Wave 4 / Prompt 02)', () => {
  const files = listSourceFiles(SRC_ROOT).map(scan);

  it('finds non-api, non-test source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('factory seam exists and exports createPccReadModelClient', () => {
    expect(existsSync(FACTORY_FILE)).toBe(true);
    const factorySrc = readFileSync(FACTORY_FILE, 'utf8');
    expect(factorySrc.includes('export function createPccReadModelClient')).toBe(true);
  });

  it('only mount.tsx may import from src/api, and only as a type-only IPccReadModelConfig import', () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const imp of file.imports) {
        if (!isApiImportPath(imp.path)) continue;

        const isMount = file.path === MOUNT_FILE;
        if (!isMount) {
          offenders.push(
            `${file.path}: api import not allowed → ${imp.raw.trim()}`,
          );
          continue;
        }

        if (!imp.typeOnly) {
          offenders.push(
            `${file.path}: api import in mount.tsx must be type-only → ${imp.raw.trim()}`,
          );
          continue;
        }

        if (!ALLOWED_MOUNT_API_IMPORT_PATHS.has(imp.path)) {
          offenders.push(
            `${file.path}: mount.tsx api import path not on allowlist → ${imp.path}`,
          );
          continue;
        }

        const named = namedImportSpecifiers(imp.clauseText);
        if (named.length !== 1 || named[0] !== 'IPccReadModelConfig') {
          offenders.push(
            `${file.path}: mount.tsx may import only IPccReadModelConfig as type-only → ${imp.raw.trim()}`,
          );
          continue;
        }
      }
    }
    expect(
      offenders,
      `expected no api-import offenders, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  for (const identifier of FORBIDDEN_API_IDENTIFIERS) {
    it(`no non-api/non-test source file references identifier '${identifier}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        if (file.tokenStripped.includes(identifier)) {
          offenders.push(file.path);
        }
      }
      expect(
        offenders,
        `expected no offenders for '${identifier}', found: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }

  it('no non-api/non-test source file contains a fetch( callsite', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (/\bfetch\s*\(/.test(file.tokenStripped)) {
        offenders.push(file.path);
      }
    }
    expect(
      offenders,
      `expected no fetch( offenders, found: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('fetch( callsites in src/api/** are limited to the backend client allowlist', () => {
    const apiFiles: string[] = [];
    for (const name of readdirSync(API_DIR)) {
      const full = join(API_DIR, name);
      const stat = statSync(full);
      if (stat.isFile() && /\.(ts|tsx)$/.test(name)) {
        apiFiles.push(full);
      }
    }
    const offenders: string[] = [];
    for (const filePath of apiFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const tokenStripped = stripCommentsAndStrings(raw);
      if (/\bfetch\s*\(/.test(tokenStripped) && !FETCH_CALLSITE_ALLOWLIST.has(filePath)) {
        offenders.push(filePath);
      }
    }
    expect(
      offenders,
      `expected fetch( only in backend client allowlist, found offenders:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  for (const forbiddenPath of FORBIDDEN_RUNTIME_IMPORT_PATHS) {
    it(`no non-api/non-test source file imports forbidden runtime '${forbiddenPath}'`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        for (const imp of file.imports) {
          if (imp.path.includes(forbiddenPath)) {
            offenders.push(`${file.path}: ${imp.raw.trim()}`);
          }
        }
      }
      expect(
        offenders,
        `expected no forbidden-runtime offenders for '${forbiddenPath}', found:\n${offenders.join('\n')}`,
      ).toEqual([]);
    });
  }

  it('mount.tsx does not invoke the factory or any client constructor', () => {
    const mount = files.find((f) => basename(f.path) === 'mount.tsx');
    expect(mount, 'mount.tsx must be in scan scope').toBeDefined();
    if (!mount) return;
    for (const identifier of FORBIDDEN_API_IDENTIFIERS) {
      expect(
        mount.tokenStripped.includes(identifier),
        `mount.tsx must not reference ${identifier} in Prompt 02`,
      ).toBe(false);
    }
  });
});
