/**
 * Wave 4 / Prompt 06 — controlled-consumption guard (hardened).
 *
 * The PCC `src/api/` read-model boundary now hosts the Wave 4 mode/config
 * seam, the opt-in backend HTTP client, and the Project Home adapter
 * helper exception. Wave 4 / Prompt 05 wired Project Home through the
 * seam under explicit opt-in. Prompt 06 hardens the guard so future
 * changes cannot silently:
 *
 *   - introduce a new `fetch(` callsite anywhere in `src/api/**` or
 *     `src/tests/**` outside the backend HTTP client + its direct test;
 *   - import a forbidden runtime (Graph/PnP/Procore/auth/SP-HTTP) from
 *     anywhere in the SPFx app, including `src/api/**`;
 *   - regress the factory's `'fixture'` default to a backend default;
 *   - thread the read-model client to any non-Project-Home surface;
 *   - introduce a write-method literal (POST/PUT/PATCH/DELETE) in the
 *     backend HTTP client.
 *
 * Two scan modes are used:
 *
 *   1. **Comment-stripped (string literals preserved)** for import-source
 *      and forbidden-runtime path scans. Import paths live in string
 *      literals and must remain visible.
 *   2. **Comment+string-stripped (template `${...}` expressions
 *      preserved)** for identifier and `fetch(` callsite scans. The
 *      stripper is a char-by-char state machine that recognizes block
 *      comments, line comments, single/double/backtick strings, and
 *      regex literals. Static template text is stripped, but
 *      `${...}` expression bodies are preserved (recursively scanned),
 *      so `\`${fetch(url)}\`` still exposes a `fetch(` callsite while
 *      `\`expected fetch(...\`` (test message) does not.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve(__dirname, '..');
const API_DIR = resolve(SRC_ROOT, 'api');
const TESTS_DIR = resolve(SRC_ROOT, 'tests');
const SURFACES_DIR = resolve(SRC_ROOT, 'surfaces');
const SHELL_DIR = resolve(SRC_ROOT, 'shell');
const MOUNT_FILE = resolve(SRC_ROOT, 'mount.tsx');
const FACTORY_FILE = resolve(API_DIR, 'pccReadModelClientFactory.ts');
const BACKEND_CLIENT_FILE = resolve(API_DIR, 'pccBackendReadModelClient.ts');
const BACKEND_CLIENT_TEST_FILE = resolve(API_DIR, 'pccBackendReadModelClient.test.ts');
const ROUTER_FILE = resolve(SHELL_DIR, 'PccSurfaceRouter.tsx');
const PROJECT_HOME_ADAPTER_FILE = resolve(
  SURFACES_DIR,
  'projectHome',
  'projectHomeAdapter.ts',
);

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
  BACKEND_CLIENT_FILE,
  BACKEND_CLIENT_TEST_FILE,
]);

const FORBIDDEN_RUNTIME_IMPORT_PATHS = [
  '@pnp/sp',
  '@pnp/graph',
  '@microsoft/sp-pnp-js',
  '@microsoft/sp-http',
  '@hbc/auth/spfx',
  'msgraph',
  'graph.microsoft.com',
  'procore',
] as const;

const FORBIDDEN_API_RUNTIME_TOKENS = [
  'MSGraphClient',
  'GraphServiceClient',
  'sp.web',
  '_api/web',
  'ProcoreClient',
  'DocumentCrunchClient',
  'AdobeSignClient',
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

// ─────────────────────────────────────────────────────────────────────
// File walkers
// ─────────────────────────────────────────────────────────────────────

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

function listAllTsFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.vite') continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listAllTsFilesRecursive(full));
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Strippers
// ─────────────────────────────────────────────────────────────────────

/**
 * Strips block + line comments only. Preserves string literals so import
 * paths and other quoted content remain visible.
 */
function stripCommentsOnly(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
}

/**
 * Char-by-char stripper.
 *
 * - Strips block + line comments.
 * - Strips single-quoted, double-quoted strings.
 * - Strips backtick template literal STATIC text, but preserves
 *   `${...}` expression bodies (recursively processed in code mode).
 * - Strips regex literals (with character-class awareness).
 * - Preserves all other code characters.
 *
 * Regex-vs-division disambiguation: `/` opens a regex literal iff the
 * previous emitted non-whitespace character is not an identifier char,
 * `)`, or `]`.
 */
function stripCommentsAndStringsRobust(src: string): string {
  return stripCodeRange(src, 0, src.length).result;
}

interface IStripResult {
  readonly result: string;
  readonly consumed: number;
}

function lastNonWhitespace(emitted: string): string {
  for (let k = emitted.length - 1; k >= 0; k--) {
    const ch = emitted[k]!;
    if (!/\s/.test(ch)) return ch;
  }
  return '';
}

function isRegexContext(emittedSoFar: string): boolean {
  const prev = lastNonWhitespace(emittedSoFar);
  if (prev === '') return true;
  return !/[\w$)\]]/.test(prev);
}

function eatRegexLiteral(src: string, i: number, end: number): number {
  // src[i] === '/'
  let p = i + 1;
  let inClass = false;
  while (p < end) {
    const ch = src[p]!;
    if (ch === '\\') {
      p += 2;
      continue;
    }
    if (inClass) {
      if (ch === ']') inClass = false;
    } else {
      if (ch === '[') inClass = true;
      else if (ch === '/') break;
    }
    p++;
  }
  p++; // skip closing /
  while (p < end && /[a-z]/.test(src[p] ?? '')) p++;
  return p;
}

function stripCodeRange(src: string, start: number, end: number): IStripResult {
  let out = '';
  let i = start;
  while (i < end) {
    const c = src[i]!;
    const next = src[i + 1];

    if (c === '/' && next === '*') {
      const blockEnd = src.indexOf('*/', i + 2);
      out += ' ';
      i = blockEnd === -1 || blockEnd >= end ? end : blockEnd + 2;
      continue;
    }
    if (c === '/' && next === '/') {
      const lineEnd = src.indexOf('\n', i + 2);
      i = lineEnd === -1 || lineEnd >= end ? end : lineEnd;
      continue;
    }
    if (c === "'" || c === '"') {
      out += c + c;
      i++;
      while (i < end && src[i] !== c) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '\n') break;
        i++;
      }
      i++;
      continue;
    }
    if (c === '`') {
      out += '`';
      i++;
      const tmpl = stripTemplateRange(src, i, end);
      out += tmpl.result; // includes closing backtick
      i += tmpl.consumed;
      continue;
    }
    if (c === '/' && isRegexContext(out)) {
      out += '//';
      i = eatRegexLiteral(src, i, end);
      continue;
    }
    out += c;
    i++;
  }
  return { result: out, consumed: i - start };
}

function stripTemplateRange(src: string, start: number, end: number): IStripResult {
  // Inside a template literal's static text. Strip plain chars; on `${` switch
  // to expression mode (preserving expression contents through stripCodeRange);
  // emit the closing backtick when found.
  let out = '';
  let i = start;
  while (i < end) {
    const c = src[i]!;
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '`') {
      out += '`';
      return { result: out, consumed: i + 1 - start };
    }
    if (c === '$' && src[i + 1] === '{') {
      out += '${';
      i += 2;
      const expr = stripExpressionBody(src, i, end);
      out += expr.result;
      i += expr.consumed;
      // expr.consumed includes the trailing '}'
      continue;
    }
    // Static template text — strip
    i++;
  }
  // Unterminated template; return what we have
  return { result: out, consumed: i - start };
}

function stripExpressionBody(src: string, start: number, end: number): IStripResult {
  // Code mode with brace tracking. Returns when the matching '}' is consumed.
  let out = '';
  let i = start;
  let depth = 0;
  while (i < end) {
    const c = src[i]!;
    const next = src[i + 1];

    if (c === '/' && next === '*') {
      const blockEnd = src.indexOf('*/', i + 2);
      out += ' ';
      i = blockEnd === -1 || blockEnd >= end ? end : blockEnd + 2;
      continue;
    }
    if (c === '/' && next === '/') {
      const lineEnd = src.indexOf('\n', i + 2);
      i = lineEnd === -1 || lineEnd >= end ? end : lineEnd;
      continue;
    }
    if (c === "'" || c === '"') {
      out += c + c;
      i++;
      while (i < end && src[i] !== c) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === '\n') break;
        i++;
      }
      i++;
      continue;
    }
    if (c === '`') {
      out += '`';
      i++;
      const tmpl = stripTemplateRange(src, i, end);
      out += tmpl.result;
      i += tmpl.consumed;
      continue;
    }
    if (c === '/' && isRegexContext(out)) {
      out += '//';
      i = eatRegexLiteral(src, i, end);
      continue;
    }
    if (c === '{') {
      depth++;
      out += '{';
      i++;
      continue;
    }
    if (c === '}') {
      if (depth === 0) {
        return { result: out, consumed: i + 1 - start };
      }
      depth--;
      out += '}';
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return { result: out, consumed: i - start };
}

// ─────────────────────────────────────────────────────────────────────
// Import extraction
// ─────────────────────────────────────────────────────────────────────

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
  const commentStripped = stripCommentsOnly(raw);
  return {
    path: file,
    raw,
    commentStripped,
    tokenStripped: stripCommentsAndStringsRobust(raw),
    imports: extractImports(commentStripped),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

describe('stripCommentsAndStringsRobust — stripper smoke tests (Wave 4 / Prompt 06)', () => {
  it('strips block comments containing fetch(', () => {
    const out = stripCommentsAndStringsRobust('const x = 1; /* fetch(u) */ const y = 2;');
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('strips line comments containing fetch(', () => {
    const out = stripCommentsAndStringsRobust('const x = 1; // fetch(u)\nconst y = 2;');
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('strips single-quoted strings containing fetch(', () => {
    const out = stripCommentsAndStringsRobust("const m = 'fetch(callsite)';");
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('strips double-quoted strings containing fetch(', () => {
    const out = stripCommentsAndStringsRobust('const m = "fetch(callsite)";');
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('strips regex literals containing fetch(', () => {
    const out = stripCommentsAndStringsRobust('if (/\\bfetch\\s*\\(/.test(s)) {}');
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('strips regex literals with character classes containing backtick and slash', () => {
    const out = stripCommentsAndStringsRobust(
      'const re = /`(?:\\\\.|[^`\\\\])*`/g; const r = re.test(input);',
    );
    expect(out.includes('re.test(input)')).toBe(true);
  });

  it('strips static template-literal text containing fetch(', () => {
    const out = stripCommentsAndStringsRobust('const m = `expected fetch(callsite)`;');
    expect(/\bfetch\s*\(/.test(out)).toBe(false);
  });

  it('PRESERVES fetch( inside template ${...} expression bodies', () => {
    const out = stripCommentsAndStringsRobust('const x = `${fetch(url)}`;');
    expect(/\bfetch\s*\(/.test(out)).toBe(true);
  });

  it('preserves bare code fetch(', () => {
    const out = stripCommentsAndStringsRobust('const r = fetch(url);');
    expect(/\bfetch\s*\(/.test(out)).toBe(true);
  });

  it('handles nested template ${...} containing another template literal', () => {
    const out = stripCommentsAndStringsRobust('const x = `outer ${`inner ${fetch(u)}`}`;');
    expect(/\bfetch\s*\(/.test(out)).toBe(true);
  });

  it('strips division operator without confusing it for a regex', () => {
    const out = stripCommentsAndStringsRobust('const half = total / count;');
    expect(out.includes('half')).toBe(true);
    expect(out.includes('total')).toBe(true);
  });
});

describe('PCC api controlled-consumption guard (Wave 4 / Prompts 02/04/05/06)', () => {
  const files = listSourceFiles(SRC_ROOT).map(scan);

  it('finds non-api, non-test source files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('factory seam exists and exports createPccReadModelClient', () => {
    expect(existsSync(FACTORY_FILE)).toBe(true);
    const factorySrc = readFileSync(FACTORY_FILE, 'utf8');
    expect(factorySrc.includes('export function createPccReadModelClient')).toBe(true);
  });

  it('factory default mode is `fixture` at the source level', () => {
    const factorySrc = readFileSync(FACTORY_FILE, 'utf8');
    const stripped = stripCommentsOnly(factorySrc);
    expect(
      /readModelMode\s*:\s*[^,\n]*\?\?\s*'fixture'/.test(stripped),
      "expected `readModelMode: input?.readModelMode ?? 'fixture'` (or close) in pccReadModelClientFactory.ts",
    ).toBe(true);
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

  it('fetch( callsites are limited to the backend client allowlist (recursive across src/**)', () => {
    const allTsFiles = listAllTsFilesRecursive(SRC_ROOT);
    const offenders: string[] = [];
    for (const filePath of allTsFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const tokenStripped = stripCommentsAndStringsRobust(raw);
      if (/\bfetch\s*\(/.test(tokenStripped) && !FETCH_CALLSITE_ALLOWLIST.has(filePath)) {
        offenders.push(filePath);
      }
    }
    expect(
      offenders,
      `expected fetch( only in backend client allowlist (${[...FETCH_CALLSITE_ALLOWLIST].join(', ')}), found offenders:\n${offenders.join('\n')}`,
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

  it('no src/api/** runtime file imports a forbidden runtime path', () => {
    const apiTsFiles = listAllTsFilesRecursive(API_DIR).filter(
      (f) => !/\.test\.(ts|tsx)$/.test(f),
    );
    const offenders: string[] = [];
    for (const filePath of apiTsFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const commentStripped = stripCommentsOnly(raw);
      const imports = extractImports(commentStripped);
      for (const imp of imports) {
        for (const forbidden of FORBIDDEN_RUNTIME_IMPORT_PATHS) {
          if (imp.path.includes(forbidden)) {
            offenders.push(`${filePath}: ${imp.raw.trim()}`);
          }
        }
      }
    }
    expect(
      offenders,
      `expected no forbidden-runtime imports in src/api/**, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('no src/api/** runtime file references a forbidden runtime token', () => {
    const apiTsFiles = listAllTsFilesRecursive(API_DIR).filter(
      (f) => !/\.test\.(ts|tsx)$/.test(f),
    );
    const offenders: string[] = [];
    for (const filePath of apiTsFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const tokenStripped = stripCommentsAndStringsRobust(raw);
      for (const token of FORBIDDEN_API_RUNTIME_TOKENS) {
        if (tokenStripped.includes(token)) {
          offenders.push(`${filePath}: token '${token}'`);
        }
      }
    }
    expect(
      offenders,
      `expected no forbidden runtime tokens in src/api/**, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('backend HTTP client uses only GET — no POST/PUT/PATCH/DELETE method literals', () => {
    expect(existsSync(BACKEND_CLIENT_FILE)).toBe(true);
    const raw = readFileSync(BACKEND_CLIENT_FILE, 'utf8');
    const commentStripped = stripCommentsOnly(raw);
    expect(
      commentStripped.includes("'GET'"),
      'backend client must declare a GET method literal',
    ).toBe(true);
    for (const banned of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(
        commentStripped.includes(`'${banned}'`),
        `backend client must not contain method literal '${banned}'`,
      ).toBe(false);
    }
  });

  it('PccSurfaceRouter threads readModelClient to exactly one surface (Project Home only)', () => {
    expect(existsSync(ROUTER_FILE)).toBe(true);
    const raw = readFileSync(ROUTER_FILE, 'utf8');
    const tokenStripped = stripCommentsAndStringsRobust(raw);
    const matches = tokenStripped.match(/readModelClient\s*=\s*\{/g) ?? [];
    expect(
      matches.length,
      'expected exactly one JSX prop usage `readModelClient={...}` in PccSurfaceRouter (Project Home branch only)',
    ).toBe(1);
  });

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
