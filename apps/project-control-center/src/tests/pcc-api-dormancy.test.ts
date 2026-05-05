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
const PROJECT_HOME_ADAPTER_FILE = resolve(SURFACES_DIR, 'projectHome', 'projectHomeAdapter.ts');
const PROJECT_READINESS_ADAPTER_FILE = resolve(
  SURFACES_DIR,
  'projectReadiness',
  'projectReadinessAdapter.ts',
);
// Wave 13 / Prompt 13E — shared Procore surface adapter consumed by
// every PCC core surface that surfaces Procore-derived signals.
const PROCORE_SURFACE_ADAPTER_FILE = resolve(SRC_ROOT, 'viewModels', 'procoreSurfaceAdapter.ts');
// Wave 99 / Prompt 04B — unified lifecycle adapter seam shares a single
// internal cardState helper so the api/ pure-helper allowlist only needs
// ONE narrow entry for this directory's eight adapters.
const UNIFIED_LIFECYCLE_CARDSTATE_FILE = resolve(
  SURFACES_DIR,
  'unifiedLifecycle',
  'unifiedLifecycleCardState.ts',
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

const FETCH_CALLSITE_ALLOWLIST = new Set<string>([BACKEND_CLIENT_FILE, BACKEND_CLIENT_TEST_FILE]);

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

/**
 * Wave 6 / Prompt 07 — workspace-wide mutation / execution identifiers.
 *
 * The SPFx app must never declare or call any of these identifiers — they
 * imply imperative side-effects (permission mutation, approval/workflow
 * execution, SharePoint group mutation, Teams membership mutation,
 * provisioning, Site Health repair) that the read-model / preview surfaces
 * are not authorized to perform. The list is **identifier-form only**
 * (camelCase function/method names) so legitimate UI prose, type names,
 * and persona names cannot trip the scan after comments+strings stripping.
 * Generic words like `group`, `team`, `member`, `permission`, `approve`,
 * `reject` are intentionally excluded.
 */
const FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS = [
  // Permission mutation
  'grantPermission',
  'revokePermission',
  'mutatePermission',
  'mutatePermissions',
  'assignPermission',
  'removePermission',
  // Approval / workflow execution
  'executeApproval',
  'executeWorkflow',
  'submitApproval',
  'persistApproval',
  'persistRejection',
  'persistDecision',
  'runApprovalWorkflow',
  // SharePoint group mutation
  'addUserToGroup',
  'removeUserFromGroup',
  'addToGroup',
  'removeFromGroup',
  'mutateGroup',
  // Teams membership mutation
  'addTeamMember',
  'removeTeamMember',
  'addChannelMember',
  'removeChannelMember',
  'joinTeam',
  'leaveTeam',
  // Provisioning execution
  'provisionSite',
  'provisionTenant',
  'applySiteTemplate',
  'runProvisioning',
  'executeProvisioning',
  // Site Health repair execution
  'runRepair',
  'executeRepair',
  'applyRepair',
  'repairExecutor',
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
    description: 'projectHomeAdapter.ts value-import mapPccSourceStatusToPreviewState (Prompt 04)',
  },
  {
    file: PROJECT_READINESS_ADAPTER_FILE,
    typeOnly: false,
    sourcePaths: new Set([
      '../../api/pccReadModelStateMapping',
      '../../api/pccReadModelStateMapping.js',
    ]),
    namedSpecifiers: new Set(['mapPccSourceStatusToPreviewState']),
    description:
      'projectReadinessAdapter.ts value-import mapPccSourceStatusToPreviewState (Wave 8 / Prompt 05)',
  },
  {
    file: UNIFIED_LIFECYCLE_CARDSTATE_FILE,
    typeOnly: false,
    sourcePaths: new Set([
      '../../api/pccReadModelStateMapping',
      '../../api/pccReadModelStateMapping.js',
    ]),
    namedSpecifiers: new Set(['mapPccSourceStatusToPreviewState']),
    description:
      'unifiedLifecycleCardState.ts value-import mapPccSourceStatusToPreviewState (Wave 99 / Prompt 04B) — single helper for the unified lifecycle adapter seam',
  },
  {
    file: PROCORE_SURFACE_ADAPTER_FILE,
    typeOnly: false,
    sourcePaths: new Set(['../api/pccReadModelStateMapping', '../api/pccReadModelStateMapping.js']),
    namedSpecifiers: new Set(['mapPccSourceStatusToPreviewState']),
    description:
      'procoreSurfaceAdapter.ts value-import mapPccSourceStatusToPreviewState (Wave 13 / Prompt 13E) — pure preview-state mapping helper',
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
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
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
  const re = /import\s+(type\s+)?([\s\S]*?)\s+from\s+(['"])([^'"]+)\3\s*;?/g;
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
          offenders.push(`${file.path}: api import not allowed → ${imp.raw.trim()}`);
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
    expect(offenders, `expected no api-import offenders, found:\n${offenders.join('\n')}`).toEqual(
      [],
    );
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
          // Wave 13 / Prompt 13E — anchored vendor-token guard. Forbidden
          // runtime paths are external package specifiers; relative
          // imports (`./` / `../`) and root-anchored imports (`/`) point
          // at internal modules and must not match a vendor substring
          // (e.g., the local `viewModels/procoreSurfaceAdapter` module).
          if (imp.path.startsWith('./') || imp.path.startsWith('../') || imp.path.startsWith('/')) {
            continue;
          }
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
    const apiTsFiles = listAllTsFilesRecursive(API_DIR).filter((f) => !/\.test\.(ts|tsx)$/.test(f));
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
    const apiTsFiles = listAllTsFilesRecursive(API_DIR).filter((f) => !/\.test\.(ts|tsx)$/.test(f));
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

  it('no PCC source file imports HbcPriorityRail directly (Wave 5 — no UI-kit priority rail reuse)', () => {
    const offenders: string[] = [];
    const allTsFiles = listAllTsFilesRecursive(SRC_ROOT);
    for (const filePath of allTsFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const commentStripped = stripCommentsOnly(raw);
      const imports = extractImports(commentStripped);
      for (const imp of imports) {
        if (imp.path.includes('HbcPriorityRail')) {
          offenders.push(`${filePath}: ${imp.raw.trim()}`);
        }
      }
    }
    expect(
      offenders,
      `expected no PCC source file to import HbcPriorityRail, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('no PCC source file references the HbcPriorityRail identifier in code (Wave 5)', () => {
    const offenders: string[] = [];
    const allTsFiles = listAllTsFilesRecursive(SRC_ROOT);
    for (const filePath of allTsFiles) {
      const raw = readFileSync(filePath, 'utf8');
      const tokenStripped = stripCommentsAndStringsRobust(raw);
      if (/\bHbcPriorityRail\w*/.test(tokenStripped)) {
        offenders.push(filePath);
      }
    }
    expect(
      offenders,
      `expected no PCC source file to reference HbcPriorityRail in code, found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('PccSurfaceRouter threads readModelClient to exactly five surfaces (project-home + team-and-access + documents + project-readiness + approvals)', () => {
    // Wave 8 / Prompt 05 added the project-readiness surface as a
    // read-model consumer (Project Readiness Center framework shell
    // driven by the project-readiness envelope). Wave 14 / Prompt 05
    // adds the approvals surface as the fifth read-model consumer
    // (Approvals / Checkpoints composite read-model). The dormancy
    // guard now allows exactly five JSX prop usages.
    expect(existsSync(ROUTER_FILE)).toBe(true);
    const raw = readFileSync(ROUTER_FILE, 'utf8');
    // Use comments-only stripping. The robust comment+string stripper
    // treats the JSX self-close `/>` as a regex literal and elides
    // content between the first `/>` and the next `/`, which would hide
    // subsequent `readModelClient={...}` JSX props.
    const commentStripped = stripCommentsOnly(raw);
    const matches = commentStripped.match(/readModelClient\s*=\s*\{/g) ?? [];
    expect(
      matches.length,
      'expected exactly five JSX prop usages `readModelClient={...}` in PccSurfaceRouter (project-home + team-and-access + documents + project-readiness + approvals)',
    ).toBe(5);

    // Set-equality assertion: the surfaces that receive the
    // readModelClient must equal exactly the five-surface set above.
    const consumerCases = Array.from(
      commentStripped.matchAll(
        /case\s+(['"])(project-home|team-and-access|documents|project-readiness|approvals)\1\s*:\s*[\s\S]*?readModelClient\s*=\s*\{/g,
      ),
      (m) => m[2] as string,
    );
    expect(
      consumerCases.slice().sort(),
      'PccSurfaceRouter readModelClient consumer set must equal exactly [approvals, documents, project-home, project-readiness, team-and-access]',
    ).toEqual(['approvals', 'documents', 'project-home', 'project-readiness', 'team-and-access']);
  });

  it.each(FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS)(
    'no PCC source file declares or calls mutation/execution identifier %s (Wave 6 / Prompt 07)',
    (identifier) => {
      const allTsFiles = listAllTsFilesRecursive(SRC_ROOT).filter(
        (f) => !/\.test\.(ts|tsx)$/.test(f),
      );
      const offenders: string[] = [];
      for (const filePath of allTsFiles) {
        const raw = readFileSync(filePath, 'utf8');
        const tokenStripped = stripCommentsAndStringsRobust(raw);
        if (tokenStripped.includes(identifier)) {
          offenders.push(filePath);
        }
      }
      expect(
        offenders,
        `expected no PCC source file to declare or call mutation/execution identifier '${identifier}', found:\n${offenders.join('\n')}`,
      ).toEqual([]);
    },
  );

  it('pccBackendReadModelClient.ts adds zero new direct `fetch(` callsites in Wave 6 / Prompt 06', () => {
    expect(existsSync(BACKEND_CLIENT_FILE)).toBe(true);
    const raw = readFileSync(BACKEND_CLIENT_FILE, 'utf8');
    const tokenStripped = stripCommentsAndStringsRobust(raw);
    // The backend client routes all HTTP via the captured `fetchImpl`
    // wrapper (`fetchImpl(url, ...)`) — no literal `\bfetch\s*\(` callsite
    // exists. `getTeamAccess` must reuse this wrapper and not introduce a
    // new direct `fetch(` callsite. Asserting zero literal `\bfetch\s*\(`
    // matches is the strongest invariant available without re-reading the
    // workspace-wide fetch allowlist.
    const matches = tokenStripped.match(/\bfetch\s*\(/g) ?? [];
    expect(
      matches.length,
      'pccBackendReadModelClient.ts must add no direct `fetch(` callsite. `getTeamAccess` must reuse the existing internal `fetchImpl` wrapper.',
    ).toBe(0);
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
      expect(mount.tokenStripped.includes(banned), `mount.tsx must not reference ${banned}`).toBe(
        false,
      );
    }

    expect(/\bfetch\s*\(/.test(mount.tokenStripped), 'mount.tsx must not call fetch(').toBe(false);

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
