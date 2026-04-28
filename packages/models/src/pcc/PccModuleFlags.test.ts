import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_MODULE_FLAG_POSTURES,
  PCC_MODULE_FLAGS,
} from './PccModuleFlags.js';
import {
  PCC_WORKFLOW_MODULE_IDS,
  PCC_WORKFLOW_MODULES,
} from './WorkflowModules.js';

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

describe('PCC module flags', () => {
  it('every workflow module id has a flag entry', () => {
    for (const id of PCC_WORKFLOW_MODULE_IDS) {
      expect(PCC_MODULE_FLAGS[id]).toBeDefined();
      expect(PCC_MODULE_FLAGS[id].moduleId).toBe(id);
    }
  });

  it('postures restricted to allowed literal set', () => {
    for (const id of PCC_WORKFLOW_MODULE_IDS) {
      expect(PCC_MODULE_FLAG_POSTURES).toContain(PCC_MODULE_FLAGS[id].posture);
    }
  });

  it('flag posture aligns with each module mvpTier from the registry', () => {
    for (const id of PCC_WORKFLOW_MODULE_IDS) {
      const moduleTier = PCC_WORKFLOW_MODULES[id].mvpTier;
      const flagPosture = PCC_MODULE_FLAGS[id].posture;
      if (moduleTier === 'MVP') {
        expect(flagPosture).toBe('mvp');
      } else if (moduleTier === 'Later') {
        expect(flagPosture).toBe('later');
      }
    }
  });

  it('source contains no runtime tokens (read-model only)', () => {
    const sourcePath = fileURLToPath(new URL('./PccModuleFlags.ts', import.meta.url));
    const stripped = stripCommentsAndStrings(readFileSync(sourcePath, 'utf8'));
    for (const pattern of RUNTIME_TOKENS) {
      expect(stripped).not.toMatch(pattern);
    }
  });
});
