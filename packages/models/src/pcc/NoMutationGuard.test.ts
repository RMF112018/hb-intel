import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PCC_DIR = fileURLToPath(new URL('.', import.meta.url));

/**
 * Allowlisted exported helpers that are pure read-model functions. Any
 * additional `export function` introduced in the PCC domain must be added
 * here to remain inside the no-mutation guard.
 */
const ALLOWED_EXPORTED_FUNCTIONS: readonly string[] = ['mapPccPersonaToProjectRole'];

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

describe('PCC shared models are mutation-free', () => {
  it('no top-level mutable bindings (let/var) and only allowlisted exported functions', () => {
    const offenders: Array<{ file: string; reason: string; line: string }> = [];

    for (const file of listSourceFiles(PCC_DIR)) {
      const contents = readFileSync(file, 'utf8');
      for (const rawLine of contents.split('\n')) {
        const line = rawLine.replace(/\/\/.*$/, '').trim();

        if (/^export\s+(let|var)\b/.test(line)) {
          offenders.push({ file, reason: 'mutable export', line });
        }
        if (/^(let|var)\b/.test(line)) {
          offenders.push({ file, reason: 'top-level mutable binding', line });
        }

        const fnMatch = /^export\s+function\s+([A-Za-z0-9_]+)/.exec(line);
        if (fnMatch && !ALLOWED_EXPORTED_FUNCTIONS.includes(fnMatch[1])) {
          offenders.push({
            file,
            reason: 'unallowlisted exported function',
            line,
          });
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
