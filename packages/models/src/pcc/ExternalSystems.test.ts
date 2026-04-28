import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  EXTERNAL_SYSTEM_IDS,
  EXTERNAL_SYSTEM_POSTURES,
  EXTERNAL_SYSTEM_CATALOG,
} from './ExternalSystems.js';

const REQUIRED_MIN_IDS = [
  'sharepoint',
  'onedrive',
  'procore',
  'sage_intacct',
  'teams',
  'compass',
  'document_crunch',
  'cupix',
] as const;

const SECRET_TOKEN_PATTERNS = /(secret|token|bearer|apikey|api[-_]key|authorization|password)/i;

/**
 * Strip line comments, block comments, and string literals from a TypeScript
 * source. Used by forbidden-substring guards so legitimate guardrail wording
 * in comments does not trip the test.
 */
function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  const len = source.length;
  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') {
      while (i < len && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i++;
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\') i += 2;
        else i++;
      }
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

describe('PCC external system catalog', () => {
  it('covers the required minimum identifier set', () => {
    for (const id of REQUIRED_MIN_IDS) {
      expect(EXTERNAL_SYSTEM_IDS).toContain(id);
      expect(EXTERNAL_SYSTEM_CATALOG[id]).toBeDefined();
    }
  });

  it('every entry has a posture from the allowed literal set', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      const entry = EXTERNAL_SYSTEM_CATALOG[id];
      expect(EXTERNAL_SYSTEM_POSTURES).toContain(entry.posture);
    }
  });

  it('display names contain no secret/token-like substrings', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      const entry = EXTERNAL_SYSTEM_CATALOG[id];
      expect(entry.displayName).not.toMatch(SECRET_TOKEN_PATTERNS);
    }
  });

  it('every entry has at least one primary work center', () => {
    for (const id of EXTERNAL_SYSTEM_IDS) {
      expect(EXTERNAL_SYSTEM_CATALOG[id].primaryWorkCenterIds.length).toBeGreaterThan(0);
    }
  });

  it('source code (after stripping comments + strings) contains no sync / mirror / write-back tokens', () => {
    const sourcePath = fileURLToPath(new URL('./ExternalSystems.ts', import.meta.url));
    const stripped = stripCommentsAndStrings(readFileSync(sourcePath, 'utf8'));
    // Forbidden tokens in code (identifiers, type names, field names).
    // Comment wording like "no sync, no mirror, no write-back" is allowed
    // because it is removed by the stripper.
    const forbidden = [/sync/i, /mirror/i, /writeBack/i, /writeback/i, /write-back/i];
    for (const pattern of forbidden) {
      expect(stripped).not.toMatch(pattern);
    }
  });
});
