import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const PCC_HOST_DIR = fileURLToPath(new URL('./', import.meta.url));

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /['"]@pnp\//,
  /['"]@microsoft\/microsoft-graph-client['"]/,
  /['"]procore-sdk['"]/i,
  /['"]@microsoft\/sp-/,
  /['"]axios['"]/,
  /['"]node-fetch['"]/,
  /['"]@adobe\//,
  /['"]document-?crunch/i,
];

const FORBIDDEN_EXECUTABLE_TOKENS: readonly string[] = [
  'MSGraphClient',
  'GraphServiceClient',
  'sp.web',
  '_api/web',
  'provision',
  'execute',
  'repair',
  'scan',
  'mirror',
  'writeBack',
  'upload',
  'delete',
  'mutate',
  'approve',
  'reject',
  'permission',
  // Wave 6 / Prompt 07 — explicit SharePoint group / Teams membership /
  // Graph mutation identifiers. Additive to the fragment-based list
  // above; covers identifiers the fragment list does not catch with
  // precision (e.g. CamelCase Graph SDK call sites).
  'addUserToGroup',
  'removeUserFromGroup',
  'addTeamMember',
  'addChannelMember',
  'joinedTeams',
  'graphMembers',
];

// Wave 13 / Prompt 13D — Procore runtime adoption identifiers. Word-
// boundary regex form so legitimate field identifiers like
// `procoreCompanyId`, `procoreObjectId`, and `procoreProjectId` are NOT
// blocked, while exact runtime tokens (`procoreSdk`, `procoreClient`,
// `procoreFetch`, `procoreApiCall`, `procoreAuth`) are caught.
const FORBIDDEN_PROCORE_RUNTIME_PATTERNS: readonly RegExp[] = [
  /\bprocoreSdk\b/,
  /\bprocoreClient\b/,
  /\bprocoreFetch\b/,
  /\bprocoreApiCall\b/,
  /\bprocoreAuth\b/,
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

describe('PCC read-only route guardrails', () => {
  const files = listSourceFiles(PCC_HOST_DIR);

  it('contains source files under pcc-read-model host', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('does not import forbidden runtime clients in route/provider source', () => {
    const offenders: Array<{ file: string; line: string }> = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const rawLine of content.split('\n')) {
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

  it('contains no mutation/execution seam tokens in executable source', () => {
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

  it('contains no Procore runtime adoption tokens (Wave 13D)', () => {
    const offenders: Array<{ file: string; pattern: string }> = [];
    for (const file of files) {
      const stripped = stripCommentsAndStrings(readFileSync(file, 'utf8'));
      for (const pattern of FORBIDDEN_PROCORE_RUNTIME_PATTERNS) {
        if (pattern.test(stripped)) {
          offenders.push({ file, pattern: pattern.source });
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not block legitimate Procore field identifiers used by 13B/13C contracts', () => {
    // Sanity check: the Wave 13D forbidden-pattern regexes must NOT match
    // legitimate field identifiers that appear elsewhere in the codebase.
    const legitimate = ['procoreCompanyId', 'procoreObjectId', 'procoreProjectId'];
    for (const identifier of legitimate) {
      for (const pattern of FORBIDDEN_PROCORE_RUNTIME_PATTERNS) {
        expect(pattern.test(identifier)).toBe(false);
      }
    }
  });
});
