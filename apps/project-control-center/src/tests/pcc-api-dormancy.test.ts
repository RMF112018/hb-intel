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

interface IApiImportRule {
  readonly file: string;
  readonly typeOnly: boolean;
  readonly sourcePaths: ReadonlySet<string>;
  readonly namedSpecifiers: ReadonlySet<string>;
  readonly description: string;
}

const PROJECT_HOME_ADAPTER_FILE = resolve(
  SRC_ROOT,
  'surfaces',
  'projectHome',
  'projectHomeAdapter.ts',
);

const API_IMPORT_RULES: readonly IApiImportRule[] = [
  {
    file: MOUNT_FILE,
    typeOnly: true,
    sourcePaths: new Set(ALLOWED_MOUNT_API_IMPORT_PATHS),
    namedSpecifiers: new Set(['IPccReadModelConfig']),
    description: 'mount.tsx type-only IPccReadModelConfig (Prompt 02)',
  },
  {
    file: MOUNT_FILE,
    typeOnly: false,
    sourcePaths: new Set(ALLOWED_MOUNT_API_IMPORT_PATHS),
    namedSpecifiers: new Set(['createPccReadModelClient']),
    description: 'mount.tsx value-import createPccReadModelClient (Prompt 05)',
  },
  {
    file: PROJECT_HOME_ADAPTER_FILE,
    typeOnly: false,
    sourcePaths: new Set([
      '../../api/pccReadModelStateMapping',
      '../../api/pccReadModelStateMapping.js',
    ]),
    namedSpecifiers: new Set(['mapPccSourceStatusToPreviewState']),
    description:
      'projectHomeAdapter.ts value-import mapPccSourceStatusToPreviewState (Prompt 04)',
  },
];

function rulesForFile(filePath: string): readonly IApiImportRule[] {
  return API_IMPORT_RULES.filter((entry) => entry.file === filePath);
}

interface IIdentifierException {
  readonly identifier: string;
  readonly file: string;
  readonly description: string;
}

const IDENTIFIER_EXCEPTIONS: readonly IIdentifierException[] = [
  {
    identifier: 'createPccReadModelClient',
    file: MOUNT_FILE,
    description: 'mount.tsx invokes the factory entry point (Prompt 05)',
  },
];

function isIdentifierExceptionAllowed(identifier: string, filePath: string): boolean {
  return IDENTIFIER_EXCEPTIONS.some(
    (entry) => entry.identifier === identifier && entry.file === filePath,
  );
}

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

  it('non-api/non-test src/api imports are limited to the narrow per-file allowlist', () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const imp of file.imports) {
        if (!isApiImportPath(imp.path)) continue;

        const candidates = rulesForFile(file.path);
        if (candidates.length === 0) {
          offenders.push(
            `${file.path}: api import not allowed → ${imp.raw.trim()}`,
          );
          continue;
        }

        const named = namedImportSpecifiers(imp.clauseText);
        const matched = candidates.some(
          (rule) =>
            rule.typeOnly === imp.typeOnly &&
            rule.sourcePaths.has(imp.path) &&
            named.length > 0 &&
            named.every((id) => rule.namedSpecifiers.has(id)),
        );

        if (!matched) {
          const ruleSummaries = candidates.map((c) => `  - ${c.description}`).join('\n');
          offenders.push(
            `${file.path}: api import did not match any allowed rule → ${imp.raw.trim()}\n  typeOnly=${imp.typeOnly}, path=${imp.path}, named=${JSON.stringify(named)}\n${ruleSummaries}`,
          );
        }
      }
    }
    expect(
      offenders,
      `expected no api-import offenders, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  for (const identifier of FORBIDDEN_API_IDENTIFIERS) {
    it(`no non-api/non-test source file references identifier '${identifier}' (except narrow allowlist)`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        if (!file.tokenStripped.includes(identifier)) continue;
        if (isIdentifierExceptionAllowed(identifier, file.path)) continue;
        offenders.push(file.path);
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

  it('mount.tsx may invoke only createPccReadModelClient and no other client/factory constructor or fetch (Prompt 05)', () => {
    const mount = files.find((f) => basename(f.path) === 'mount.tsx');
    expect(mount, 'mount.tsx must be in scan scope').toBeDefined();
    if (!mount) return;

    expect(
      mount.tokenStripped.includes('createPccReadModelClient'),
      'mount.tsx is expected to reference createPccReadModelClient (the factory entry point)',
    ).toBe(true);

    const mountForbidden = [
      'IPccReadModelClient',
      'pccReadModelClient',
      'pccFixtureReadModelClient',
      'createPccFixtureReadModelClient',
      'pccBackendReadModelClient',
      'createPccBackendReadModelClient',
      'resolvePccReadModelConfig',
    ];
    for (const banned of mountForbidden) {
      expect(
        mount.tokenStripped.includes(banned),
        `mount.tsx must not reference ${banned}`,
      ).toBe(false);
    }

    expect(
      /\bfetch\s*\(/.test(mount.tokenStripped),
      'mount.tsx must not call fetch(',
    ).toBe(false);

    for (const imp of mount.imports) {
      for (const forbidden of FORBIDDEN_RUNTIME_IMPORT_PATHS) {
        expect(
          imp.path.includes(forbidden),
          `mount.tsx must not import forbidden runtime '${forbidden}' (got: ${imp.raw.trim()})`,
        ).toBe(false);
      }
    }
  });
});
