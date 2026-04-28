import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_FEATURE_FLAG_IDS,
  PCC_FEATURE_FLAG_POSTURES,
  PCC_FEATURE_FLAGS,
} from './PccFeatureFlags.js';
import { PCC_MVP_SURFACE_IDS } from './PccMvpSurfaces.js';
import { PCC_WORKFLOW_MODULE_IDS } from './WorkflowModules.js';

const SECRET_TOKEN_PATTERNS = /(secret|token|bearer|apikey|api[-_]key|password)/i;

const RUNTIME_TOKENS: readonly RegExp[] = [
  /process\.env/,
  /localStorage/,
  /sessionStorage/,
  /document\.cookie/,
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /requireAdmin/,
  /withAuth/,
  /getConfig/,
];

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

describe('PCC feature flags', () => {
  it('every flag id has a registry entry', () => {
    for (const id of PCC_FEATURE_FLAG_IDS) {
      const entry = PCC_FEATURE_FLAGS[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it('postures restricted to allowed literal set', () => {
    for (const id of PCC_FEATURE_FLAG_IDS) {
      expect(PCC_FEATURE_FLAG_POSTURES).toContain(PCC_FEATURE_FLAGS[id].posture);
    }
  });

  it('surfaceId / moduleId references resolve when present', () => {
    for (const id of PCC_FEATURE_FLAG_IDS) {
      const entry = PCC_FEATURE_FLAGS[id];
      if (entry.surfaceId !== undefined) {
        expect(PCC_MVP_SURFACE_IDS).toContain(entry.surfaceId);
      }
      if (entry.moduleId !== undefined) {
        expect(PCC_WORKFLOW_MODULE_IDS).toContain(entry.moduleId);
      }
    }
  });

  it('no flag id contains secret-like substrings', () => {
    for (const id of PCC_FEATURE_FLAG_IDS) {
      expect(id).not.toMatch(SECRET_TOKEN_PATTERNS);
    }
  });

  it('source contains no runtime tokens (read-model only)', () => {
    const sourcePath = fileURLToPath(new URL('./PccFeatureFlags.ts', import.meta.url));
    const stripped = stripCommentsAndStrings(readFileSync(sourcePath, 'utf8'));
    for (const pattern of RUNTIME_TOKENS) {
      expect(stripped).not.toMatch(pattern);
    }
  });
});
